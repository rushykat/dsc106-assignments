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

document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select>
              <option value="light dark">Automatic</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
          </select>
      </label>`,
);

const select = document.querySelector("select");

if ("colorScheme" in localStorage) {
    select.value = localStorage.colorScheme;
    document.documentElement.style.setProperty("color-scheme", localStorage.colorScheme);
}

select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value);
    localStorage.colorScheme = event.target.value;
});

const form = document.querySelector("form");
form?.addEventListener("submit", function (event) {
    event.preventDefault();
    const data = new FormData(form);

    let url = form.action + "?";
    for (let [name, value] of data) {
        console.log(name, encodeURIComponent(value));
        url += `${encodeURIComponent(name)}=${encodeURIComponent(value)}&`;
    }
    // console.log(url);
    location.href = url;
})
