import { registerClickHandler } from "./event-delegation.js";

export function renderDelegatedDOM(vnode) {
    if (
        !vnode ||
        typeof vnode !== "object" ||
        typeof vnode.type !== "string" ||
        !vnode.props ||
        typeof vnode.props !== "object" ||
        !Array.isArray(vnode.props.children)
    ) {
        throw new TypeError("Invalid Virtual DOM node");
    }

    if (vnode.type === "TEXT_ELEMENT") {
        if (typeof vnode.props.nodeValue !== "string") {
            throw new TypeError("Invalid text value");
        }

        return document.createTextNode(vnode.props.nodeValue);
    }

    if (!/^[a-z][a-z0-9-]*$/.test(vnode.type)) {
        throw new TypeError("Invalid element type");
    }

    // Restrict the exercise to safe semantic elements
    const allowedTags = new Set([
        "main", "header", "section", "h1", "h2", "h3",
        "p", "button", "ul", "li", "span", "strong"
    ]);

    if (!allowedTags.has(vnode.type)) {
        throw new TypeError(`Unsupported tag: ${vnode.type}`);
    }

    const element = document.createElement(vnode.type);

    for (const [name, value] of Object.entries(vnode.props)) {
        if (name === "children" || value == null) {
            continue;
        }

        if (name === "onClick") {
            registerClickHandler(element, value);
            continue;
        }

        const allowedAttributes = new Set([
            "id", "className", "role", "type",
            "aria-label", "aria-pressed", "disabled"
        ]);

        if (!allowedAttributes.has(name)) {
            throw new TypeError(`Unsupported attribute: ${name}`);
        }

        if (
            typeof value !== "string" &&
            typeof value !== "number" &&
            typeof value !== "boolean"
        ) {
            throw new TypeError(`Invalid attribute value: ${name}`);
        }

        const attributeName = name === "className" ? "class" : name;

        if (name === "disabled") {
            if (value === true) {
                element.setAttribute("disabled", "");
            }
            continue;
        }

        element.setAttribute(attributeName, String(value));
    }

    for (const child of vnode.props.children) {
        element.appendChild(renderDelegatedDOM(child));
    }

    return element;
}