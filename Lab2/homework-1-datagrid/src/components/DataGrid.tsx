
/** @jsxImportSource @mini-react */

import { useState } from "../mini-react/state";

export interface ColumnDef<T> {
    header: string;
    accessorKey: keyof T;
    sortable?: boolean;
}

export interface DataGridProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    ariaLabel: string;
    onRowSelect?: (row: T) => void;
}

export function DataGrid<T>({
                                data,
                                columns,
                                ariaLabel,
                                onRowSelect,
                            }: DataGridProps<T>) {
    const [sortKey, setSortKey] = useState<keyof T | null>(null);
    const [sortDirection, setSortDirection] =
        useState<"asc" | "desc">("asc");

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRow, setSelectedRow] = useState<T | null>(null);

    const pageSize = 3;

    // Filtering
    const filteredData = data.filter(row =>
        columns.some(column =>
            String(row[column.accessorKey] ?? "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
        )
    );

    // Sorting
    const sortedData = [...filteredData];

    if (sortKey !== null) {
        sortedData.sort((a, b) => {
            const first = a[sortKey];
            const second = b[sortKey];

            const comparison =
                typeof first === "number" &&
                typeof second === "number"
                    ? first - second
                    : String(first ?? "").localeCompare(
                        String(second ?? "")
                    );

            return sortDirection === "asc"
                ? comparison
                : -comparison;
        });
    }

    function handleSort(column: ColumnDef<T>): void {
        if (!column.sortable) return;

        if (sortKey === column.accessorKey) {
            setSortDirection(previous =>
                previous === "asc" ? "desc" : "asc"
            );
        } else {
            setSortKey(column.accessorKey);
            setSortDirection("asc");
        }

        setCurrentPage(1);
    }

    // Pagination
    const totalPages = Math.max(
        1,
        Math.ceil(sortedData.length / pageSize)
    );

    const safePage = Math.min(currentPage, totalPages);

    const paginatedData = sortedData.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize
    );

    // Selection
    function selectRow(row: T): void {
        const nextSelection = selectedRow === row ? null : row;
        setSelectedRow(nextSelection);

        if (nextSelection !== null) {
            onRowSelect?.(nextSelection);
        }
    }

    return (
        <div>
            <label>
                Search employees:
                <input
                    id="grid-search"
                    type="text"
                    onInput={(event: Event) => {
                        const target = event.target;

                        if (target instanceof HTMLInputElement) {
                            setSearchQuery(target.value);
                            setCurrentPage(1);
                        }
                    }}
                />
            </label>

            <table aria-label={ariaLabel}>
                <thead>
                <tr>
                    {columns.map(column => {
                        const isSorted =
                            sortKey === column.accessorKey;

                        const sortStatus = isSorted
                            ? sortDirection === "asc"
                                ? "ascending"
                                : "descending"
                            : "none";

                        return (
                            <th
                                scope="col"
                                aria-sort={sortStatus}
                            >
                                {column.sortable ? (
                                    <button
                                        id={`grid-sort-${String(column.accessorKey)}`}
                                        type="button"
                                        onClick={() => handleSort(column)}
                                    >
                                        {column.header}
                                    </button>
                                ) : column.header}
                            </th>
                        );
                    })}
                </tr>
                </thead>

                <tbody>
                {paginatedData.map((row, index) => {
                    const absoluteIndex =
                        (safePage - 1) * pageSize + index;

                    const isSelected = selectedRow === row;

                    return (
                        <tr
                            id={`grid-row-${absoluteIndex}`}
                            tabIndex={0}
                            aria-selected={isSelected}
                            onClick={() => selectRow(row)}
                            onKeyDown={(event: KeyboardEvent) => {
                                if (
                                    event.key === "ArrowDown" ||
                                    event.key === "ArrowUp"
                                ) {
                                    event.preventDefault();

                                    const direction =
                                        event.key === "ArrowDown"
                                            ? 1
                                            : -1;

                                    const nextIndex = Math.max(
                                        0,
                                        Math.min(
                                            paginatedData.length - 1,
                                            index + direction
                                        )
                                    );

                                    const nextAbsoluteIndex =
                                        (safePage - 1) * pageSize +
                                        nextIndex;

                                    document
                                        .getElementById(
                                            `grid-row-${nextAbsoluteIndex}`
                                        )
                                        ?.focus();

                                    return;
                                }

                                if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                ) {
                                    event.preventDefault();
                                    selectRow(row);
                                }
                            }}
                        >
                            {columns.map(column => (
                                <td>
                                    {String(
                                        row[column.accessorKey] ?? ""
                                    )}
                                </td>
                            ))}
                        </tr>
                    );
                })}
                </tbody>
            </table>

            {sortedData.length === 0 ? (
                <div>No matching employees found.</div>
            ) : null}

            <div>
                <button
                    id="grid-previous"
                    type="button"
                    onClick={() =>
                        setCurrentPage(previous =>
                            Math.max(1, previous - 1)
                        )
                    }
                >
                    Previous
                </button>

                <span>
                    Page {safePage} of {totalPages}
                </span>

                <button
                    id="grid-next"
                    type="button"
                    onClick={() =>
                        setCurrentPage(previous =>
                            Math.min(totalPages, previous + 1)
                        )
                    }
                >
                    Next
                </button>
            </div>
        </div>
    );
}
