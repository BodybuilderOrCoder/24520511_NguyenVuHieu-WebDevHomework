export function createTextElement(text) {
    if (typeof text !== "string" && typeof text !== "number") {
        throw new TypeError("Text node must contain a string or number");
    }

    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: String(text),
            children: []
        }
    };
}

export function createElement(type, props, ...children) {
    if (typeof type !== "string" || !/^[a-z][a-z0-9-]*$/.test(type)) {
        throw new TypeError("Element type must be a valid HTML tag name");
    }

    if (
        props !== null &&
        (typeof props !== "object" || Array.isArray(props))
    ) {
        throw new TypeError("Element props must be an object or null");
    }

    const normalizedChildren = children
        .flat(Infinity)
        .filter(child =>
            child !== null &&
            child !== undefined &&
            typeof child !== "boolean"
        )
        .map(child => {
            if (typeof child === "string" || typeof child === "number") {
                return createTextElement(child);
            }

            if (
                child !== null &&
                typeof child === "object" &&
                typeof child.type === "string" &&
                child.props !== null &&
                typeof child.props === "object" &&
                Array.isArray(child.props.children)
            ) {
                return child;
            }

            throw new TypeError("Invalid child node");
        });

    return {
        type,
        props: {
            ...(props || {}),
            children: normalizedChildren
        }
    };
}

export function renderToDOM(vnode) {
    // 1. Validate Virtual Node
    if (
        vnode === null ||
        typeof vnode !== "object" ||
        typeof vnode.type !== "string" ||
        vnode.props === null ||
        typeof vnode.props !== "object" ||
        !Array.isArray(vnode.props.children)
    ) {
        throw new TypeError("Invalid Virtual DOM node");
    }

    // 2. Handle text nodes safely
    if (vnode.type === "TEXT_ELEMENT") {
        if (typeof vnode.props.nodeValue !== "string") {
            throw new TypeError("Invalid text node value");
        }

        return document.createTextNode(vnode.props.nodeValue);
    }

    // 3. Create actual HTML element
    const element = document.createElement(vnode.type);

    // 4. Apply attributes and event listeners
    Object.entries(vnode.props).forEach(([name, value]) => {
        if (name === "children" || value === null || value === undefined) {
            return;
        }

        // Event handling
        if (/^on[A-Z]/.test(name)) {
            if (typeof value !== "function") {
                throw new TypeError(`Invalid event handler: ${name}`);
            }

            const eventName = name.slice(2).toLowerCase();

            // Only support explicitly permitted events
            if (eventName !== "click") {
                throw new TypeError(`Unsupported event: ${eventName}`);
            }

            element.addEventListener(eventName, value);
            return;
        }

        // Prevent dangerous inline event attributes
        if (/^on/i.test(name)) {
            throw new TypeError(`Unsafe attribute: ${name}`);
        }

        // Reject potentially dangerous attribute names
        if (
            !/^[a-zA-Z][a-zA-Z0-9-]*$/.test(name) ||
            ["srcdoc", "dangerouslySetInnerHTML"].includes(name)
        ) {
            throw new TypeError(`Unsupported attribute: ${name}`);
        }

        // Prevent unsafe URL schemes
        if (["href", "src", "action", "formaction"].includes(name)) {
            const url = String(value).trim();

            if (/^(javascript|vbscript|data):/i.test(url)) {
                throw new TypeError(`Unsafe URL: ${name}`);
            }
        }

        // Convert className into HTML class
        const attributeName = name === "className" ? "class" : name;

        if (typeof value === "object" || typeof value === "function") {
            throw new TypeError(`Invalid attribute value: ${name}`);
        }

        element.setAttribute(attributeName, String(value));
    });

    // 5. Render children recursively
    vnode.props.children.forEach(child => {
        element.appendChild(renderToDOM(child));
    });

    return element;
}