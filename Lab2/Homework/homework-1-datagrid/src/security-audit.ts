
import { jsx } from "./mini-react/jsx-runtime";
import { renderToDOM } from "./mini-react/renderer";

export function runSecurityAudit(): void {
    const payloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<svg onload=alert("XSS")>',
        '<a href="javascript:alert(1)">Click</a>',
    ];

    const container = document.createElement("div");

    for (const payload of payloads) {
        const vnode = jsx("div", {
            children: payload,
        });

        const node = renderToDOM(vnode);
        container.appendChild(node);

        const actual = node.textContent;

        if (actual !== payload) {
            throw new Error(
                `XSS audit failed: ${payload}`
            );
        }

        if (
            node instanceof Element &&
            node.querySelector("script, img, svg, a")
        ) {
            throw new Error(
                `Unexpected HTML element created: ${payload}`
            );
        }
    }

    console.log(
        "PASS: XSS payloads rendered as plain text."
    );
}
