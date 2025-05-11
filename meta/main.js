import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

async function loadData() {
    const data = await d3.csv("loc.csv", (row) => ({
        ...row,
        line: +row.line,
        depth: +row.depth,
        length: +row.length,
        date: new Date(row.date + "T00:00" + row.timezone),
        datetime: new Date(row.datetime),
    }));
    return data;
}

function processCommits(data) {
    return d3
        .groups(data, (d) => d.commit)
        .map(([commit, lines]) => {
            let first = lines[0];
            let { author, date, time, timezone, datetime } = first;
            let ret = {
                id: commit,
                url: "https://github.com/rushykat/commit" + commit,
                author,
                date,
                time,
                timezone,
                datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length,
            };

            Object.defineProperty(ret, "lines", {
                value: lines,
                enumerable: false,
                writable: false,
                configurable: false
            });
            return ret;
        });
}

let xScale;
let yScale;

function renderCommitInfo(data, commits) {
    const dl = d3.select("#stats").append("dl").attr("class", "stats");

    dl.append("dt").html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append("dd").text(data.length);

    dl.append("dt").text("Total commits");
    dl.append("dd").text(commits.length);

    const avgLineLength = d3.mean(data, d=> d.length);
    dl.append("dt").text("Average Line Length");
    dl.append("dd").text(avgLineLength);

    const longestLine = d3.max(data, d=> d.length);
    dl.append("dt").text("Longest Line");
    dl.append("dd").text(longestLine);

    const avgDepth = d3.mean(data, d=> d.depth);
    dl.append("dt").text("Average Depth");
    dl.append("dd").text(avgDepth);

    const maximumDepth = d3.max(data, d=> d.depth);
    dl.append("dt").text("Max Depth");
    dl.append("dd").text(maximumDepth);
}

function renderScatterPlot(data, commits) {
    const width = 1000;
    const height = 600;

    xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

    yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
    
    const svg = d3
        .select("#chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("overflow", "visible");
        
    const dots = svg.append("g").attr("class", "dots");

    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);

    // TODO: come back and adjust rScale
    const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]); // adjust these values based on your experimentation

    dots
        .selectAll("circle")
        .data(sortedCommits)
        .join("circle")
        .attr("cx", (d) => xScale(d.datetime))
        .attr("cy", (d) => yScale(d.hourFrac))
        .attr("r", (d) => rScale(d.totalLines))
        .attr("fill", "steelblue")
        .style("fill-opacity", 0.7)
        .on("mouseenter", (event, commit) => {
            d3.select(event.currentTarget).style("fill-opacity", 1);
            renderTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        .on("mouseleave", (event) => {
            d3.select(event.currentTarget).style("fill-opacity", 0.7);
            updateTooltipVisibility(false);
        });

    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };

    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00");

    // gridlines
    const gridlines = svg
        .append("g")
        .attr("class", "gridlines")
        .attr("transform", `translate(${usableArea.left}, 0)`);
    
    gridlines.call(d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width));

    // axes
    svg
        .append("g")
        .attr("transform", `translate(0, ${usableArea.bottom})`)
        .call(xAxis);
    
    svg
        .append("g")
        .attr("transform", `translate(${usableArea.left}, 0)`)
        .call(yAxis);
    
    function isCommitSelected(selection, commit) {
        if (!selection) {
            return false;
        }

        const [x0, x1] = selection.map((d) => d[0]);
        const [y0, y1] = selection.map((d) => d[1]);
        const x = xScale(commit.datetime);
        const y = yScale(commit.hourFrac);

        return x >= x0 && x <= x1 && y >= y0 && y <= y1;
    }

    function renderSelectionCount(selection) {
        const selectedCommits = selection
            ? commits.filter((d) => isCommitSelected(selection, d))
            : [];
    
        const countElement = document.querySelector("#selection-count");
        countElement.textContent = `${
            selectedCommits.length || "No"
        } commits selected`;
    
        return selectedCommits;
    }

    function renderLanguageBreakdown(selection) {
        const selectedCommits = selection
            ? commits.filter((d) => isCommitSelected(selection, d))
            : [];
        const container = document.getElementById("language-breakdown");
    
        if (selectedCommits.length === 0) {
            container.innerHTML = '';
            return;
        }
        const requiredCommits = selectedCommits.length ? selectedCommits : commits;
        const lines = requiredCommits.flatMap((d) => d.lines);
        
        // count lines per language
        const breakdown = d3.rollup(
            lines,
            (v) => v.length,
            (d) => d.type,
        );
    
        // update DOM with breakdown
        container.innerHTML = '';
    
        for (const [language, count] of breakdown) {
            const proportion = count / lines.length;
            const formatted = d3.format(".1~%")(proportion);
    
            container.innerHTML += `
                    <dt>${language}</dt>
                    <dd>${count} lines (${formatted})</dd>
                `;
        }
    }

    function brushed(event) {
        const selection = event.selection;
        d3.selectAll("circle").classed("selected", (d) =>
            isCommitSelected(selection, d),
        
        );
        renderSelectionCount(selection);
        renderLanguageBreakdown(selection);
    }

    function createBrushSelector(svg) {
        // create brush
        svg.call(d3.brush().on("start brush end", brushed));

        // raise dots over overlay
        svg.selectAll('.dots, .overlay ~ *').raise();
    }
    createBrushSelector(svg);

}

function renderTooltipContent(commit) {
    const link = document.getElementById("commit-link");
    const date = document.getElementById("commit-date");

    if (Object.keys(commit).length === 0) return;

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString("en", {
        dateStyle: "full",
    });
}

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById("commit-tooltip");
    tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById("commit-tooltip");
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
}

let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);
renderScatterPlot(data, commits);
// renderTooltipContent(commits);