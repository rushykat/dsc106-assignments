console.log("It's ALIVE!");

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector))
}

// Lab 3 Step 2: Adding current class for pages with JS instead of manually

// let navLinks = $$("nav a");

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname,
//   );

// currentLink?.classList.add("current")

let pages = [
    { url: "", title: "Home" },
    { url: "projects/", title: "Projects" },
    { url: "resume/", title: "Resume" },
    { url: "contact/", title: "Contact" },
    { url: "https://github.com/rushykat", title: "Profile" }
  ];

let nav = document.createElement("nav");
document.body.prepend(nav);

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1") ? "/" : "/website/";

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    
    url = !url.startsWith('http') ? BASE_PATH + url : url;

    // nav.insertAdjacentHTML("beforeend", `<a href="${url}">${title}</a>`);
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    } else if (a.host !== location.host) {
        a.target = "_blank";
    }

    nav.append(a);

}
