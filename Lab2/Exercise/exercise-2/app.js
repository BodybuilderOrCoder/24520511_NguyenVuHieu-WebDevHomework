import { createElement } from "../exercise-1/mini-react.js";
import { useState, renderApp } from "./reactive-engine.js";

const h = createElement;

function TaskApp() {
    const [tasks, setTasks] = useState([
        { id: 1, title: "Review PR", completed: false },
        { id: 2, title: "Verify AST", completed: false }
    ]);

    const [filter, setFilter] = useState("ALL");

    const filteredTasks = tasks.filter(task => {
        if (filter === "ACTIVE") return !task.completed;
        if (filter === "COMPLETED") return task.completed;
        return true;
    });

    function addTask() {
        const newTask = {
            id: crypto.randomUUID(),
            title: `Task ${tasks.length + 1}`,
            completed: false
        };

        setTasks(previous => [...previous, newTask]);
    }

    function toggleTask(id) {
        setTasks(previous =>
            previous.map(task =>
                task.id === id
                    ? { ...task, completed: !task.completed }
                    : task
            )
        );
    }

    function deleteTask(id) {
        setTasks(previous =>
            previous.filter(task => task.id !== id)
        );
    }

    function filterButton(label, value) {
        return h(
            "button",
            {
                type: "button",
                "aria-pressed": filter === value,
                onClick: () => setFilter(value)
            },
            label
        );
    }

    return h(
        "main",
        { className: "app-container" },

        h(
            "header",
            null,
            h("h1", null, "Reactive Task Manager"),
            h("h2", null, `Tasks: ${tasks.length}`)
        ),

        h(
            "section",
            { "aria-label": "Task actions" },
            h(
                "button",
                { type: "button", onClick: addTask },
                "Add Task"
            )
        ),

        h(
            "section",
            { "aria-label": "Task filters" },
            filterButton("All", "ALL"),
            filterButton("Active", "ACTIVE"),
            filterButton("Completed", "COMPLETED")
        ),

        h(
            "section",
            { "aria-label": "Task list" },

            h(
                "ul",
                null,

                ...filteredTasks.map(task =>
                    h(
                        "li",
                        { className: task.completed ? "completed" : "" },

                        h("span", null, task.title),

                        h(
                            "button",
                            {
                                type: "button",
                                onClick: () => toggleTask(task.id)
                            },
                            task.completed ? "Undo" : "Complete"
                        ),

                        h(
                            "button",
                            {
                                type: "button",
                                onClick: () => deleteTask(task.id)
                            },
                            "Delete"
                        )
                    )
                )
            ),

            filteredTasks.length === 0
                ? h("p", null, "No tasks to display.")
                : null
        )
    );
}

renderApp(TaskApp, document.getElementById("app"));