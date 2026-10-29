
export type DelegatedEventType = "click" | "input" | "keydown";

export type EventHandler = (event: Event) => void;

type HandlerRegistry = Partial<
    Record<DelegatedEventType, EventHandler>
>;

const handlers = new WeakMap<Element, HandlerRegistry>();
const registeredRoots = new WeakSet<Element>();

export function registerEventHandler(
    element: Element,
    type: DelegatedEventType,
    handler: EventHandler
): void {
    if (!(element instanceof Element)) {
        throw new TypeError("Event target must be an Element");
    }

    if (typeof handler !== "function") {
        throw new TypeError("Event handler must be a function");
    }

    const registry = handlers.get(element) ?? {};
    registry[type] = handler;
    handlers.set(element, registry);
}

export function attachRootEventDelegation(root: Element): void {
    if (!(root instanceof Element)) {
        throw new TypeError("Root must be an Element");
    }

    if (registeredRoots.has(root)) {
        return;
    }

    const eventTypes: DelegatedEventType[] = [
        "click",
        "input",
        "keydown",
    ];

    for (const type of eventTypes) {
        root.addEventListener(type, (event: Event) => {
            let target = event.target;

            while (target instanceof Element) {
                const handler = handlers.get(target)?.[type];

                if (handler) {
                    handler(event);
                }

                if (event.cancelBubble || target === root) {
                    break;
                }

                target = target.parentElement;
            }
        });
    }

    registeredRoots.add(root);
}
