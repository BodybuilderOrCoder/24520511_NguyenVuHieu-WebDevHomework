
/** @jsxImportSource @mini-react */

import { renderToDOM } from "./mini-react/renderer";
import { attachRootEventDelegation } from "./mini-react/events";

export function runKeyboardSmokeTest(): void {
    const root = document.getElementById("app");

    if (!root) {
        throw new Error("Root element #app not found");
    }

    const vnode = (
        <input
            type="text"
            id="keyboard-test"
            onKeyDown={(event: KeyboardEvent) => {
                const keys = [
                    "ArrowUp",
                    "ArrowDown",
                    "ArrowLeft",
                    "ArrowRight",
                    "Enter",
                    " ",
                ];

                if (!keys.includes(event.key)) {
                    return;
                }

                console.log(
                    "Delegated keydown:",
                    event.key === " " ? "Space" : event.key
                );
            }}
        />
    );

    attachRootEventDelegation(root);
    root.replaceChildren(renderToDOM(vnode));

    console.log("Keyboard Smoke Test: READY");
}
