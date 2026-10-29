
/** @jsxImportSource @mini-react */

import { renderToDOM } from "./mini-react/renderer";

export function runRendererSmokeTest(): void {
    const vnode = (
        <h1 className="test-heading">
            Hello Mini-React!
        </h1>
    );

    const root = document.getElementById("app");

    if (!root) {
        throw new Error("Root element #app not found");
    }

    root.replaceChildren(renderToDOM(vnode));

    console.log("Renderer Smoke Test: PASS");
}
