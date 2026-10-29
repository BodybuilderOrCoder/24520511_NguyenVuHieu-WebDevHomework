
/** @jsxImportSource @mini-react */

import { renderToDOM } from "./mini-react/renderer";
import { attachRootEventDelegation } from "./mini-react/events";
import {
    beginRender,
    setRenderCallback,
    useState,
} from "./mini-react/state";

function Counter() {
    const [count, setCount] = useState(0);

    return (
        <button
            type="button"
            onClick={() => setCount(prev => prev + 1)}
        >
            Count: {count}
        </button>
    );
}

export function runCounterTest(): void {
    const root = document.getElementById("app");

    if (!root) {
        throw new Error("Root #app not found");
    }

    function render(): void {
        beginRender();
        root!.replaceChildren(renderToDOM(Counter()));
    }

    setRenderCallback(render);
    attachRootEventDelegation(root);
    render();
}
