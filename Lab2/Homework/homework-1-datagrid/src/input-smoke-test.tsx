
/** @jsxImportSource @mini-react */

import { renderToDOM } from "./mini-react/renderer";
import { attachRootEventDelegation } from "./mini-react/events";

export function runInputSmokeTest(): void {
    const root = document.getElementById("app");

    if (!root) {
        throw new Error("Root element #app not found");
    }

    const vnode = (
        <input
            type="text"
            id="grid-search"
            onInput={(event: Event) => {
                const target = event.target;

                if (!(target instanceof HTMLInputElement)) {
                    return;
                }

                console.log("Search query:", target.value);
            }}
        />
    );

    attachRootEventDelegation(root);
    root.replaceChildren(renderToDOM(vnode));

    console.log("Input Smoke Test: READY");
}
