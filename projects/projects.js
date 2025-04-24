import { fetchJSON, renderProjects } from "../global.js";

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector(".projects");

renderProjects(projects, projectsContainer, 'h2');

const projectTitle = document.querySelector(".projects-title");
projectTitle.innerHTML = `
    ${projects.length} Projects
`;
