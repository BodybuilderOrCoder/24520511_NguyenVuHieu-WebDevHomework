
/** @jsxImportSource @mini-react */

import { DataGrid, type ColumnDef } from "./components/DataGrid";
import { renderToDOM } from "./mini-react/renderer";
import { attachRootEventDelegation } from "./mini-react/events";
import { beginRender, setRenderCallback } from "./mini-react/state";

interface Employee {
    id: number;
    name: string;
    department: string;
    salary: number;
}

const employees: Employee[] = [
    {
        id: 1,
        name: "Alice",
        department: "Engineering",
        salary: 65000,
    },
    {
        id: 2,
        name: "Bob",
        department: "Marketing",
        salary: 52000,
    },
    {
        id: 3,
        name: "Charlie",
        department: "Finance",
        salary: 58000,
    },
    {
        id: 4,
        name: "Diana",
        department: "Engineering",
        salary: 72000,
    },
    {
        id: 5,
        name: "Ethan",
        department: "HR",
        salary: 49000,
    },
];

const columns: ColumnDef<Employee>[] = [
    {
        header: "ID",
        accessorKey: "id",
        sortable: true,
    },
    {
        header: "Name",
        accessorKey: "name",
        sortable: true,
    },
    {
        header: "Department",
        accessorKey: "department",
        sortable: true,
    },
    {
        header: "Salary",
        accessorKey: "salary",
        sortable: true,
    },
];

export function runGridDemo(): void {
    const root = document.getElementById("app");

    if (!root) {
        throw new Error("Root #app not found");
    }

    function render(): void {
        const activeElement = document.activeElement;

        // Save focus before replacing the DOM.
        const focusedElement =
            activeElement instanceof HTMLElement &&
            root!.contains(activeElement)
                ? activeElement
                : null;

        const focusedId = focusedElement?.id ?? null;

        const focusedInput =
            focusedElement instanceof HTMLInputElement
                ? focusedElement
                : null;

        const inputValue = focusedInput?.value ?? "";
        const selectionStart = focusedInput?.selectionStart ?? null;
        const selectionEnd = focusedInput?.selectionEnd ?? null;

        // Render the DataGrid using Mini-React.
        beginRender();

        const vnode = DataGrid({
            data: employees,
            columns,
            ariaLabel: "Employee Data Grid",
            onRowSelect: (row) => {
                console.log("Selected employee:", row);
            },
        });

        root!.replaceChildren(renderToDOM(vnode));

        // Restore focus and cursor position.
        if (focusedId) {
            const nextElement = Array.from(
                root!.querySelectorAll<HTMLElement>("[id]")
            ).find(element => element.id === focusedId);

            if (nextElement) {
                nextElement.focus({ preventScroll: true });

                if (nextElement instanceof HTMLInputElement) {
                    nextElement.value = inputValue;

                    if (
                        selectionStart !== null &&
                        selectionEnd !== null
                    ) {
                        nextElement.setSelectionRange(
                            selectionStart,
                            selectionEnd
                        );
                    }
                }
            }
        }
    }

    setRenderCallback(render);
    attachRootEventDelegation(root);
    render();
}
