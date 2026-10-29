
"use strict";

/* ==========================================
   HW3 - DRIFT-FREE COUNTDOWN ENGINE
========================================== */

// 1. DOM elements

const countdownDisplay = document.querySelector("#countdown-display");
const countdownStatus = document.querySelector("#countdown-status");

const daysElement = document.querySelector("#days");
const hoursElement = document.querySelector("#hours");
const minutesElement = document.querySelector("#minutes");
const secondsElement = document.querySelector("#seconds");

// 2. Read the UTC ISO 8601 deadline

const deadlineString = countdownDisplay.dataset.deadline;
const deadline = Date.parse(deadlineString);

// 3. Format numbers

function padNumber(value) {
    return String(value).padStart(2, "0");
}

// 4. Update countdown

function updateCountdown() {
    // Recalculate from the actual clock on every tick.
    // Do not subtract one second from a stored counter.
    const remaining = Math.max(0, deadline - Date.now());

    const totalSeconds = Math.ceil(remaining / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    daysElement.textContent = padNumber(days);
    hoursElement.textContent = padNumber(hours);
    minutesElement.textContent = padNumber(minutes);
    secondsElement.textContent = padNumber(seconds);

    if (remaining === 0) {
        countdownStatus.textContent = "The event has started!";
        return true;
    }

    countdownStatus.textContent = "Countdown is running.";
    return false;
}

// 5. Start countdown safely


if (Number.isNaN(deadline)) {
    countdownStatus.textContent = "Invalid event deadline.";
} else {
    const finished = updateCountdown();

    if (!finished) {
        const timerId = setInterval(() => {
            if (updateCountdown()) {
                clearInterval(timerId);
            }
        }, 250);

        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) {
                if (updateCountdown()) {
                    clearInterval(timerId);
                }
            }
        });
    }
}



/* ==========================================
   HW3 - REGISTRATION FORM STATE MACHINE
========================================== */

// 1. DOM elements

const registrationForm = document.querySelector("#registration-form");
const submitButton = document.querySelector("#submit-button");
const formStatus = document.querySelector("#form-status");
const formInputs = registrationForm.querySelectorAll("input");

// 2. Define states

const FORM_STATES = Object.freeze({
    IDLE: "idle",
    SUBMITTING: "submitting",
    SUCCESS: "success",
    ERROR: "error"
});

let currentFormState = FORM_STATES.IDLE;

// 3. Render state


function setFormState(state, message = "") {
    currentFormState = state;

    formStatus.dataset.state = state;
    formStatus.textContent = message;

    const isSubmitting = state === FORM_STATES.SUBMITTING;

    // Prevent repeated submissions.
    submitButton.disabled = isSubmitting;

    // Keep submitted data unchanged while processing.
    formInputs.forEach((input) => {
        input.readOnly = isSubmitting;
    });

    if (isSubmitting) {
        submitButton.textContent = "Submitting...";
    } else {
        submitButton.textContent = "Register Now";
    }
}

// 4. Simulate asynchronous registration

function simulateRegistration(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (data.email.toLowerCase().endsWith("@error.test")) {
                reject(new Error("Simulated registration failure."));
                return;
            }

            resolve({ success: true });
        }, 1000);
    });
}

// 5. Handle form submission

registrationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Prevent duplicate submissions.
    if (currentFormState === FORM_STATES.SUBMITTING) {
        return;
    }

    const formData = new FormData(registrationForm);

    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    if (!fullName || !email || !registrationForm.checkValidity()) {
        setFormState(
            FORM_STATES.ERROR,
            "Please provide a valid name and email address."
        );
        return;
    }

    setFormState(FORM_STATES.SUBMITTING, "Processing registration...");

    try {
        await simulateRegistration({ fullName, email });

        setFormState(
            FORM_STATES.SUCCESS,
            `Registration successful! Thank you, ${fullName}.`
        );

        registrationForm.reset();
    } catch (error) {
        setFormState(
            FORM_STATES.ERROR,
            "Registration failed. Please try again."
        );
    }
});

// 6. Initial state

setFormState(FORM_STATES.IDLE);


/* Reset stale feedback when the user edits the form */

registrationForm.addEventListener("input", () => {
    if (
        currentFormState === FORM_STATES.SUCCESS ||
        currentFormState === FORM_STATES.ERROR
    ) {
        setFormState(FORM_STATES.IDLE);
    }
});

