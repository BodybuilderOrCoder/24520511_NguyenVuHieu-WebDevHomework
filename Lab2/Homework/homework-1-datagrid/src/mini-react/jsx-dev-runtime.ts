
import { jsx, type JSX } from "./jsx-runtime";
import type { VNode } from "./types";

export type { JSX };

export function jsxDEV(
    type: VNode["type"],
    props: Record<string, unknown> | null,
    key?: string,
    _isStaticChildren?: boolean,
    _source?: unknown,
    _self?: unknown
): VNode {
    return jsx(type, props, key);
}
