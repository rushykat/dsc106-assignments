import { fetchJSON, renderProjects } from "../global.js";

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector(".projects");

renderProjects(projects, projectsContainer, 'h2');

const projectTitle = document.querySelector(".projects-title");
projectTitle.innerHTML = `
    ${projects.length} Projects
`;

// Adding link for project 2 report clickable from 
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
document.querySelector(".projects").appendChild(reportWrapper);

// console.log(projects[5]);
// for (let i = 0; i < projects.length; i++) {
//     console.log(projects[i]);
// }