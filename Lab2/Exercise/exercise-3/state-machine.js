export const STATUS = Object.freeze({
    IDLE: "IDLE",
    LOADING: "LOADING",
    SUCCESS: "SUCCESS",
    ERROR: "ERROR"
});

export function idleState() {
    return { status: STATUS.IDLE };
}

export function loadingState() {
    return { status: STATUS.LOADING };
}

export function successState(data) {
    if (!Array.isArray(data)) {
        throw new TypeError("Success data must be an array");
    }

    return { status: STATUS.SUCCESS, data };
}

export function errorState(error) {
    return {
        status: STATUS.ERROR,
        error: String(error || "Unknown error")
    };
}

export function isValidState(state) {
    if (!state || typeof state !== "object") return false;

    switch (state.status) {
        case STATUS.IDLE:
        case STATUS.LOADING:
            return Object.keys(state).length === 1;

        case STATUS.SUCCESS:
            return Array.isArray(state.data);

        case STATUS.ERROR:
            return typeof state.error === "string";

        default:
            return false;
    }
}