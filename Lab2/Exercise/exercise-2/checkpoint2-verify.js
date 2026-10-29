import { createElement } from "../exercise-1/mini-react.js";
import { useState, renderApp } from "./reactive-engine.js";

const h = createElement;
let setCount;
let renders = 0;

function TestApp() {
    const [count, updateCount] = useState(0);
    setCount = updateCount;
    renders++;

    return h(
        "main",
        null,
        h("h2", null, `Count: ${count}`),
        h("button", { onClick: () => updateCount(n => n + 1) }, "Increase")
    );
}

const root = document.createElement("section");
document.body.appendChild(root);

renderApp(TestApp, root);

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function waitForRender() {
    return new Promise(resolve => queueMicrotask(resolve));
}

async function runTests() {
    assert(root.querySelector("h2").textContent === "Count: 0",
        "Initial render failed");

    root.querySelector("button").click();
    await waitForRender();

    assert(root.querySelector("h2").textContent === "Count: 1",
        "Reactive click failed");

    const beforeBatch = renders;

    setCount(n => n + 1);
    setCount(n => n + 1);
    await waitForRender();

    assert(root.querySelector("h2").textContent === "Count: 3",
        "Functional state updates failed");

    assert(renders === beforeBatch + 1,
        "Synchronous updates were not batched");

    assert(root.querySelectorAll("main").length === 1,
        "Unexpected DOM structure");

    console.log("PASS: Initial render");
    console.log("PASS: Delegated click");
    console.log("PASS: Reactive state update");
    console.log("PASS: Batched functional updates");
    console.log("PASS: No duplicate main nodes");

    console.log("Checkpoint 2 verification passed");
}

runTests().catch(error => {
    console.error("Checkpoint 2 verification failed:", error);
});