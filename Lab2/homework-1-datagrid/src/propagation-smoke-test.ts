
import {
    attachRootEventDelegation,
    registerEventHandler,
} from "./mini-react/events";

export function runPropagationSmokeTest(): void {
    const root = document.getElementById("app");

    if (!root) {
        throw new Error("Root element #app not found");
    }

    const parent = document.createElement("div");
    const child = document.createElement("button");

    child.type = "button";
    child.textContent = "Test propagation";

    parent.appendChild(child);
    root.replaceChildren(parent);

    attachRootEventDelegation(root);

    registerEventHandler(child, "click", (event) => {
        console.log("Child handler");
        event.stopPropagation();
    });

    registerEventHandler(parent, "click", () => {
        console.log("Parent handler");
    });

    console.log("Propagation Smoke Test: READY");
}
