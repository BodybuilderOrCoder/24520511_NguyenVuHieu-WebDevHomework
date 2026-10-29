
import type { VNode } from "./types";

export function renderToDOM(vnode: VNode): Node {
    if (
        !vnode ||
        typeof vnode !== "object" ||
        typeof vnode.type !== "string" ||
        !vnode.props ||
        !Array.isArray(vnode.props.children)
    ) {
        throw new TypeError("Invalid Virtual DOM node");
    }

    if (vnode.type === "TEXT_ELEMENT") {
        const text = vnode.props.nodeValue;

        if (typeof text !== "string") {
            throw new TypeError("Invalid text node value");
        }

        return document.createTextNode(text);
    }

    const element = document.createElement(vnode.type);

    for (const [name, value] of Object.entries(vnode.props)) {
        if (name === "children" || value == null) {
            continue;
        }

        if (name === "className") {
            element.setAttribute("class", String(value));
            continue;
        }

        if (name === "id") {
            element.setAttribute("id", String(value));
            continue;
        }

        throw new TypeError(`Unsupported attribute: ${name}`);
    }

    for (const child of vnode.props.children) {
        element.appendChild(renderToDOM(child));
    }

    return element;
}
