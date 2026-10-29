
import {
    attachRootEventDelegation,
    registerEventHandler,
} from "./mini-react/events";

export function runRootBoundarySmokeTest(): void {
    const root = document.getElementById("app");

    if (!root) {
        throw new Error("Root element #app not found");
    }

    const insideButton = document.createElement("button");
    insideButton.type = "button";
    insideButton.textContent = "Inside root";

    const outsideButton = document.createElement("button");
    outsideButton.type = "button";
    outsideButton.textContent = "Outside root";

    root.replaceChildren(insideButton);
    root.after(outsideButton);

    let callCount = 0;

    registerEventHandler(insideButton, "click", () => {
        callCount++;
        console.log(`Inside handler called: ${callCount}`);
    });

    attachRootEventDelegation(root);

    console.log("Root Boundary Test: READY");
}
