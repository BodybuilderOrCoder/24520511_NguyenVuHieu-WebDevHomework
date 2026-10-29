
import type { VNode } from "./types";

import {
    registerEventHandler,
    type DelegatedEventType,
    type EventHandler,
} from "./events";

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

    const eventProps: Record<string, DelegatedEventType> = {
        onClick: "click",
        onInput: "input",
        onKeyDown: "keydown",
    };

    for (const [name, value] of Object.entries(vnode.props)) {
        if (name === "children" || value == null) {
            continue;
        }

        if (Object.prototype.hasOwnProperty.call(eventProps, name)) {
            if (typeof value !== "function") {
                throw new TypeError(`Invalid event handler: ${name}`);
            }

            registerEventHandler(
                element,
                eventProps[name]!,
                value as EventHandler
            );

            continue;
        }

        if (name === "className") {
            element.setAttribute("class", String(value));
            continue;
        }

        if (name === "id") {
            if (typeof value !== "string") {
                throw new TypeError("Invalid id");
            }

            element.setAttribute("id", value);
            continue;
        }

        if (name === "type" && vnode.type === "button") {
            if (
                value !== "button" &&
                value !== "submit" &&
                value !== "reset"
            ) {
                throw new TypeError("Invalid button type");
            }

            element.setAttribute("type", value);
            continue;
        }

        if (name === "type" && vnode.type === "input") {
            if (value !== "text") {
                throw new TypeError("Invalid input type");
            }

            element.setAttribute("type", value);
            continue;
        }

        if (name === "aria-label") {
            if (typeof value !== "string") {
                throw new TypeError("Invalid aria-label");
            }

            element.setAttribute("aria-label", value);
            continue;
        }

        if (name === "scope" && vnode.type === "th") {
            if (value !== "col" && value !== "row") {
                throw new TypeError("Invalid table header scope");
            }

            element.setAttribute("scope", value);
            continue;
        }

        if (name === "aria-sort" && vnode.type === "th") {
            if (
                value !== "ascending" &&
                value !== "descending" &&
                value !== "none"
            ) {
                throw new TypeError("Invalid aria-sort");
            }

            element.setAttribute("aria-sort", value);
            continue;
        }

        if (name === "tabIndex" && vnode.type === "tr") {
            if (
                typeof value !== "number" ||
                !Number.isInteger(value)
            ) {
                throw new TypeError("Invalid tabIndex");
            }

            element.setAttribute("tabindex", String(value));
            continue;
        }

        if (name === "aria-selected" && vnode.type === "tr") {
            if (typeof value !== "boolean") {
                throw new TypeError("Invalid aria-selected");
            }

            element.setAttribute("aria-selected", String(value));
            continue;
        }

        throw new TypeError(`Unsupported attribute: ${name}`);
    }

    for (const child of vnode.props.children) {
        element.appendChild(renderToDOM(child));
    }

    return element;
}
