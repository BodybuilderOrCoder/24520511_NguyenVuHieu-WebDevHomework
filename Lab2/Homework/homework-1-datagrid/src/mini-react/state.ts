
type StateUpdater<T> = T | ((previous: T) => T);

type StateSetter<T> = (update: StateUpdater<T>) => void;

const stateStore: unknown[] = [];
let hookCursor = 0;
let renderCallback: (() => void) | null = null;
let renderScheduled = false;

function scheduleRender(): void {
    if (renderScheduled) {
        return;
    }

    renderScheduled = true;

    queueMicrotask(() => {
        renderScheduled = false;
        renderCallback?.();
    });
}

export function beginRender(): void {
    hookCursor = 0;
}

export function setRenderCallback(callback: () => void): void {
    renderCallback = callback;
}

export function useState<T>(
    initialValue: T
): [T, StateSetter<T>] {
    const index = hookCursor++;

    if (!(index in stateStore)) {
        stateStore[index] = initialValue;
    }

    const setState: StateSetter<T> = (update) => {
        const previous = stateStore[index] as T;

        const next =
            typeof update === "function"
                ? (update as (value: T) => T)(previous)
                : update;

        if (Object.is(previous, next)) {
            return;
        }

        stateStore[index] = next;
        scheduleRender();
    };

    return [stateStore[index] as T, setState];
}
