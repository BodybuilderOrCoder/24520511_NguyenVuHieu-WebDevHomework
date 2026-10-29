"use strict";

// Theme state: preserve the original localStorage feature.
const themeToggle = document.querySelector("#theme-toggle");
const storedTheme = localStorage.getItem("theme");
const initialTheme = storedTheme === "light" || storedTheme === "dark"
    ? storedTheme
    : "dark";

function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    themeToggle.textContent = isDark ? "☀ Light" : "☾ Dark";
    localStorage.setItem("theme", theme);
}

setTheme(initialTheme);
themeToggle.addEventListener("click", () => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});

// Preserve the original asynchronous loading / empty / error / retry exercise.
const projectsContent = document.querySelector("#projects-content");
const sampleProjects = [
    {
        name: "FreshLoop",
        description: "A grocery platform concept exploring predictive inventory and real-time stock synchronization. Work in progress.",
        category: "Full-stack concept",
        url: null
    },
    {
        name: "Portfolio Website",
        description: "A responsive personal site built with semantic HTML, modern CSS, and accessible Vanilla JavaScript.",
        category: "Frontend",
        url: "https://github.com/BodybuilderOrCoder/24520511_NguyenVuHieu-Lab1Webdev"
    },
    {
        name: "Drum Kit Engine",
        description: "An interactive drum kit with keyboard controls, polyphonic sounds, and beat recording.",
        category: "JavaScript",
        url: "https://github.com/BodybuilderOrCoder/24520511_NguyenVuHieu-Lab1Webdev/tree/main/hw2-drum-kit"
    },
    {
        name: "Event Hub",
        description: "An event landing page with a UTC countdown and an asynchronous registration state machine demo.",
        category: "JavaScript",
        url: "https://github.com/BodybuilderOrCoder/24520511_NguyenVuHieu-Lab1Webdev/tree/main/hw3-event-hub"
    }
];

// Set to "empty" or "error" to test alternate UI states.
const demoMode = "success";

function renderLoading() {
    projectsContent.replaceChildren();
    projectsContent.setAttribute("aria-busy", "true");
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton-item";
    skeleton.setAttribute("aria-hidden", "true");
    projectsContent.append(skeleton);
}

function renderProjects(projects) {
    projectsContent.replaceChildren();
    projectsContent.setAttribute("aria-busy", "false");

    if (projects.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No projects available.";
        projectsContent.append(message);
        return;
    }

    const grid = document.createElement("div");
    grid.className = "project-grid";

    projects.forEach((project) => {
        const article = document.createElement("article");
        article.className = "project-card";

        const badge = document.createElement("span");
        badge.className = "project-badge";
        badge.textContent = project.category;

        const title = document.createElement("h3");
        title.textContent = project.name;

        const description = document.createElement("p");
        description.textContent = project.description;

        article.append(badge, title, description);

        if (project.url) {
            const link = document.createElement("a");
            link.className = "text-link project-link";
            link.href = project.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "View source ↗";
            article.append(link);
        }

        grid.append(article);
    });

    projectsContent.append(grid);
}

function renderError() {
    projectsContent.replaceChildren();
    projectsContent.setAttribute("aria-busy", "false");

    const message = document.createElement("p");
    message.textContent = "Unable to load projects.";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "retry-button";
    button.textContent = "Retry";
    button.addEventListener("click", loadProjects);

    projectsContent.append(message, button);
}

function fetchProjects() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (demoMode === "error") {
                reject(new Error("Simulated request failure"));
            } else if (demoMode === "empty") {
                resolve([]);
            } else {
                resolve(sampleProjects);
            }
        }, 800);
    });
}

async function loadProjects() {
    renderLoading();
    try {
        const projects = await fetchProjects();
        renderProjects(projects);
    } catch (error) {
        console.error("Project request failed:", error);
        renderError();
    }
}

loadProjects();
