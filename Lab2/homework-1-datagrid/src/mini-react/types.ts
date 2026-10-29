
export type VNodeType = string | Function;

export interface VNode {
    type: VNodeType;
    props: {
        children: VNode[];
        [key: string]: unknown;
    };
}

export interface TextVNode {
    type: "TEXT_ELEMENT";
    props: {
        nodeValue: string;
        children: [];
    };
}

export type VNodeChild =
    | VNode
    | string
    | number
    | boolean
    | null
    | undefined
    | VNodeChild[];
