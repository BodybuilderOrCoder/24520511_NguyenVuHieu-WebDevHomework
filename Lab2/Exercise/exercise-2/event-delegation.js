// Root Event Delegation Hub

const clickHandlers = new WeakMap();
const registeredRoots = new WeakSet();

export function registerClickHandler(element, handler) {
    if (!(element instanceof Element)) {
        throw new TypeError("Target must be an element");
    }

    if (typeof handler !== "function") {
        throw new TypeError("Handler must be a function");
    }

    clickHandlers.set(element, handler);
}

export function attachRootEventDelegation(root) {
    if (!(root instanceof Element)) {
        throw new TypeError("Root must be an element");
    }

    // Prevent duplicate root listeners
    if (registeredRoots.has(root)) {
        return;
    }

    root.addEventListener("click", event => {
        let target = event.target;

        while (target && target !== root) {
            const handler = clickHandlers.get(target);

            if (handler) {
                handler(event);

                if (event.cancelBubble) {
                    break;
                }
            }

            target = target.parentElement;
        }
    });

    registeredRoots.add(root);
}