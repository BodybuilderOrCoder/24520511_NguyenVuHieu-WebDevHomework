
/** @jsxImportSource @mini-react */

import { renderToDOM } from "./mini-react/renderer";
import { attachRootEventDelegation } from "./mini-react/events";

export function runEventSmokeTest(): void {
    const root = document.getElementById("app");

    if (!root) {
        throw new Error("Root element #app not found");
    }

    let clickCount = 0;

    const vnode = (
        <button
            type="button"
            onClick={() => {
                clickCount++;
                console.log(`Delegated click: ${clickCount}`);
            }}
        >
            Click me!
        </button>
    );

    attachRootEventDelegation(root);
    root.replaceChildren(renderToDOM(vnode));

    console.log("Event Smoke Test: READY");
}
