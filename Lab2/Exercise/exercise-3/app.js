import { createElement } from "../exercise-1/mini-react.js";

import {
    useState,
    renderApp
} from "../exercise-2/reactive-engine.js";

import {
    STATUS,
    idleState,
    loadingState,
    successState,
    errorState,
    isValidState
} from "./state-machine.js";

const h = createElement;

const MOCK_ITEMS = [
    { id: 1, name: "React Architecture", description: "Virtual DOM concepts" },
    { id: 2, name: "State Management", description: "Custom useState hook" },
    { id: 3, name: "Event Delegation", description: "Root event handling" },
    { id: 4, name: "Async State Machine", description: "Resilient data fetching" }
];

// Shared request sequence to reject outdated async responses.
let latestRequestId = 0;

function fetchFeed(shouldFail = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldFail) {
                reject(new Error("Unable to connect to the server."));
                return;
            }

            resolve(MOCK_ITEMS);
        }, 1500);
    });
}

function SkeletonLoader() {
    return h(
        "section",
        {
            className: "skeleton-container",
            "aria-label": "Loading content"
        },

        ...Array.from({ length: 3 }, () =>
            h(
                "section",
                { className: "skeleton-card" },

                h("p", { className: "skeleton-line skeleton-title" }, " "),
                h("p", { className: "skeleton-line" }, " "),
                h("p", { className: "skeleton-line skeleton-short" }, " ")
            )
        )
    );
}

function DataFeed() {
    const [state, setState] = useState(idleState());

    async function loadData(shouldFail = false) {
        const requestId = ++latestRequestId;

        setState(loadingState());

        try {
            const items = await fetchFeed(shouldFail);

            // Ignore stale responses from older requests.
            if (requestId !== latestRequestId) return;

            setState(successState(items));
        } catch (error) {
            if (requestId !== latestRequestId) return;

            setState(errorState(error.message));
        }
    }

    if (!isValidState(state)) {
        throw new Error("Invalid state machine state");
    }

    let content;

    switch (state.status) {
        case STATUS.IDLE:
            content = h(
                "section",
                { className: "status-card" },
                h("h2", null, "Ready to load"),
                h("p", null, "Click Load Data to fetch the feed.")
            );
            break;

        case STATUS.LOADING:
            content = SkeletonLoader();
            break;

        case STATUS.SUCCESS:
            content = h(
                "section",
                { className: "feed" },
                h("h2", null, "Data loaded successfully"),

                ...state.data.map(item =>
                    h(
                        "section",
                        { className: "feed-card" },
                        h("h3", null, item.name),
                        h("p", null, item.description)
                    )
                )
            );
            break;

        case STATUS.ERROR:
            content = h(
                "section",
                { className: "error-card", role: "alert" },

                h("h2", null, "Connection Failed"),
                h("p", null, state.error),

                h(
                    "button",
                    {
                        type: "button",
                        onClick: () => loadData(false)
                    },
                    "Retry Connection"
                )
            );
            break;

        default:
            throw new Error("Unexpected state");
    }

    return h(
        "main",
        { className: "app-container" },

        h(
            "header",
            null,
            h("h1", null, "Resilient Data Feed"),
            h("p", null, `Current State: ${state.status}`)
        ),

        h(
            "section",
            { className: "actions" },

            h(
                "button",
                {
                    type: "button",
                    onClick: () => loadData(false)
                },
                "Load Data"
            ),

            h(
                "button",
                {
                    type: "button",
                    onClick: () => loadData(true)
                },
                "Simulate Error"
            )
        ),

        content
    );
}

renderApp(DataFeed, document.getElementById("app"));