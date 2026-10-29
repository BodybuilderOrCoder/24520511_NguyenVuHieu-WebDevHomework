// Exercise 2 - Phase 1: State Store Engine
import { renderDelegatedDOM } from "./delegated-renderer.js";
import { attachRootEventDelegation } from "./event-delegation.js";

const stateStore = [];
let cursor = 0;

export function resetCursor() {
    cursor = 0;
}

export function getStateSlot(initialValue) {
    const slot = cursor++;

    if (!(slot in stateStore)) {
        stateStore[slot] = initialValue;
    }

    return {
        slot,
        value: stateStore[slot]
    };
}

export function updateStateSlot(slot, nextValue) {
    if (!Number.isInteger(slot) || slot < 0 || slot >= stateStore.length) {
        throw new RangeError("Invalid state slot");
    }

    stateStore[slot] = nextValue;
}

export function getStateSnapshot() {
    return [...stateStore];
}

// Exercise 2 - Phase 2: Reactive useState Dispatcher

let rootElement = null;
let rootComponent = null;
let renderScheduled = false;

export function useState(initialValue) {
    const { slot, value } = getStateSlot(initialValue);

    function setState(nextValue) {
        const previousValue = stateStore[slot];

        // Support both direct values and functional updates
        const resolvedValue =
            typeof nextValue === "function"
                ? nextValue(previousValue)
                : nextValue;

        // Skip rendering if state has not changed
        if (Object.is(previousValue, resolvedValue)) {
            return;
        }

        updateStateSlot(slot, resolvedValue);
        scheduleRender();
    }

    return [value, setState];
}

export function renderApp(component, root) {
    if (typeof component !== "function") {
        throw new TypeError("Component must be a function");
    }

    if (!(root instanceof Element)) {
        throw new TypeError("Root must be a DOM element");
    }

    rootComponent = component;
    rootElement = root;

    attachRootEventDelegation(rootElement);
    performRender();
}

function performRender() {
    if (!rootComponent || !rootElement) {
        return;
    }

    // Reset hook position, but preserve state values
    resetCursor();

    // Generate the new Virtual DOM tree
    const vnode = rootComponent();

    // Convert Virtual DOM into actual DOM
    const dom = renderDelegatedDOM(vnode);

    // Replace previous UI with the new UI
    rootElement.replaceChildren(dom);
}

function scheduleRender() {
    if (!rootComponent || !rootElement || renderScheduled) {
        return;
    }

    renderScheduled = true;

    queueMicrotask(() => {
        renderScheduled = false;
        performRender();
    });
}