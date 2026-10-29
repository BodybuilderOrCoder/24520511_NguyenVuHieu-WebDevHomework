import {
    createElement,
    createTextElement,
    renderToDOM
} from "./mini-react.js";

let passed = 0;
let failed = 0;

function test(name, callback) {
    try {
        callback();
        console.log(`PASS: ${name}`);
        passed++;
    } catch (error) {
        console.error(`FAIL: ${name}`, error);
        failed++;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

// Test 1: Text node factory
test("createTextElement creates a valid text VNode", () => {
    const node = createTextElement("Hello");

    assert(node.type === "TEXT_ELEMENT", "Incorrect node type");
    assert(node.props.nodeValue === "Hello", "Incorrect text");
});

// Test 2: Element factory
test("createElement creates a valid VNode", () => {
    const node = createElement("main", { id: "test" }, "Hello");

    assert(node.type === "main", "Incorrect element type");
    assert(node.props.id === "test", "Incorrect props");
    assert(node.props.children.length === 1, "Incorrect children");
});

// Test 3: Nested elements
test("createElement supports nested children", () => {
    const node = createElement(
        "main",
        null,
        createElement("section", null, "Content")
    );

    assert(node.props.children[0].type === "section", "Nesting failed");
});

// Test 4: Type guards
test("createElement rejects invalid element types", () => {
    let rejected = false;

    try {
        createElement(123, null, "Invalid");
    } catch (error) {
        rejected = error instanceof TypeError;
    }

    assert(rejected, "Invalid type was not rejected");
});

// Test 5: DOM rendering
test("renderToDOM creates semantic HTML", () => {
    const vnode = createElement(
        "main",
        null,
        createElement("section", null, "Hello")
    );

    const element = renderToDOM(vnode);

    assert(element.tagName === "MAIN", "Expected main element");
    assert(element.querySelector("section") !== null, "Section missing");
});

// Test 6: Safe text rendering
test("renderToDOM prevents HTML injection in text children", () => {
    const payload = "<img src=x onerror=alert(1)>";

    const vnode = createElement("p", null, payload);
    const element = renderToDOM(vnode);

    assert(element.textContent === payload, "Text was modified");
    assert(element.querySelector("img") === null, "HTML injection detected");
});

// Test 7: Event handling
test("renderToDOM attaches click handlers", () => {
    let clicked = false;

    const vnode = createElement(
        "button",
        {
            onClick: () => {
                clicked = true;
            }
        },
        "Click"
    );

    const element = renderToDOM(vnode);
    element.click();

    assert(clicked, "Click handler did not execute");
});

// Test 8: Null and boolean children
test("createElement filters empty children", () => {
    const vnode = createElement(
        "section",
        null,
        null,
        false,
        undefined,
        "Visible"
    );

    assert(vnode.props.children.length === 1, "Empty children not filtered");
});

// Test 9: Invalid child
test("createElement rejects unsupported child types", () => {
    let rejected = false;

    try {
        createElement("main", null, { invalid: true });
    } catch (error) {
        rejected = error instanceof TypeError;
    }

    assert(rejected, "Invalid child was accepted");
});

// Test 10: DOM tree structure
test("renderToDOM does not create unnecessary wrappers", () => {
    const vnode = createElement(
        "main",
        null,
        createElement("header", null, "Title"),
        createElement("section", null, "Content"),
        createElement("button", null, "Click")
    );

    const element = renderToDOM(vnode);

    assert(element.children.length === 3, "Unexpected child elements");
    assert(element.querySelectorAll("div").length === 0, "Div soup detected");
});

console.log("------------------------------");
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log("------------------------------");