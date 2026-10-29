
import type { VNode, VNodeChild } from "./types";

type JSXProps = Record<string, unknown> & {
    children?: VNodeChild;
};

function normalizeChildren(children: VNodeChild): VNode[] {
    const result: VNode[] = [];

    function visit(child: VNodeChild): void {
        if (Array.isArray(child)) {
            for (const item of child) {
                visit(item);
            }
            return;
        }

        if (
            child === null ||
            child === undefined ||
            typeof child === "boolean"
        ) {
            return;
        }

        if (
            typeof child === "string" ||
            typeof child === "number"
        ) {
            result.push({
                type: "TEXT_ELEMENT",
                props: {
                    nodeValue: String(child),
                    children: [],
                },
            });
            return;
        }

        result.push(child);
    }

    visit(children);
    return result;
}

export function jsx(
    type: VNode["type"],
    props: JSXProps | null,
    _key?: string
): VNode {
    const { children, ...rest } = props ?? {};

    return {
        type,
        props: {
            ...rest,
            children: normalizeChildren(children),
        },
    };
}

export const jsxs = jsx;

export namespace JSX {
    export type Element = VNode;

    export interface IntrinsicElements {
        div: {
            id?: string;
            className?: string;
            children?: VNodeChild;
        };

        label: {
            children?: VNodeChild;
        };

        span: {
            children?: VNodeChild;
        };

        h1: {
            className?: string;
            onClick?: (event: MouseEvent) => void;
            children?: VNodeChild;
        };

        button: {
            id?: string;
            type?: "button" | "submit" | "reset";
            onClick?: (event: MouseEvent) => void;
            children?: VNodeChild;
        };

        input: {
            id?: string;
            type?: "text";
            onInput?: (event: Event) => void;
            onKeyDown?: (event: KeyboardEvent) => void;
        };

        table: {
            "aria-label": string;
            children?: VNodeChild;
        };

        thead: {
            children?: VNodeChild;
        };

        tbody: {
            children?: VNodeChild;
        };

        tr: {
            id?: string;
            tabIndex?: number;
            "aria-selected"?: boolean;
            onClick?: (event: MouseEvent) => void;
            onKeyDown?: (event: KeyboardEvent) => void;
            children?: VNodeChild;
        };

        th: {
            scope?: "col" | "row";
            "aria-sort"?: "ascending" | "descending" | "none";
            children?: VNodeChild;
        };

        td: {
            children?: VNodeChild;
        };
    }
}
