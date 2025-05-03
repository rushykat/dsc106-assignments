import { fetchJSON, renderProjects } from "../global.js";
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// fetch projects and render
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector(".projects");
renderProjects(projects, projectsContainer, 'h2');

// add project counter
const projectTitle = document.querySelector(".projects-title");
projectTitle.innerHTML = `
    ${projects.length} Projects
`;

// adding link for project 2 report clickable from projects page
const reportWrapper = document.createElement("a");
reportWrapper.href = `./police/project2_report.html`;
const p = projects[5];
reportWrapper.innerHTML = `
    <article>
        <h3>${p.title}</h3>
        <img src="${p.image}">
        <p>${p.description}</p>
    </article>

`
// remove underline, purple hyperlink color for project 2 report add to report
reportWrapper.style.textDecoration = "none";
reportWrapper.style.color = "inherit";
document.querySelector(".projects").appendChild(reportWrapper);

let selectedIndex = -1;

function renderPieChart(projectsGiven) {
    // reshapes project data
    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );

    // initializes data for pie chart
    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    // pie chart creation
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    // clear svg
    let svg = d3.select("svg");
    svg.selectAll("path").remove();

    // clear legend
    let legend = d3.select(".legend");
    legend.selectAll("*").remove();

    // adds each pie slice to svg element
    arcs.forEach((arc, idx) => {
        // add slices and on slice click functionality
        svg.append("path").attr("d", arc).attr("fill", colors(idx)).on("click", () => {
            selectedIndex = selectedIndex === idx ? -1 : idx;

            // find slice and attach selected class
            svg.selectAll("path").attr("class", (_, idx) => (
                idx === selectedIndex ? "selected" : null
            ));

            // find matching legend element and attach selected class
            legend.selectAll(".legend-li").attr("class", (_, idx) => (
                idx === selectedIndex ? "legend-li selected" : "legend-li"
            ));

            // if no slice selected, render all given projects
            if (selectedIndex === -1) {
                renderProjects(projectsGiven, projectsContainer, "h2");
            // else filter out selected projects and render
            } else {
                let filteredProj = projectsGiven.filter(
                    proj => proj.year === data[selectedIndex].label
                );
                renderProjects(filteredProj, projectsContainer, "h2");
            }
        });
    })

    // adds legend for pie chart
    data.forEach((d, idx) => {
        legend.append("li").attr("style", `--color:${colors(idx)}`).attr("class", "legend-li").html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em`);
    });
}
  
// initialize pie chart on load
renderPieChart(projects);


// initializes user query and search bar element
let query = "";
let searchInput = document.querySelector(".searchBar");

// handles search bar functionality for projects
searchInput.addEventListener("input", (event) => {
    // user input value
    query = event.target.value;

    // filter out projects containing search query
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join("\n").toLowerCase();
        return values.includes(query.toLowerCase());
    });
    
    // renders filtered projects
    renderProjects(filteredProjects, projectsContainer, 'h2');
    
    // render filtered pie chart
    renderPieChart(filteredProjects);
});