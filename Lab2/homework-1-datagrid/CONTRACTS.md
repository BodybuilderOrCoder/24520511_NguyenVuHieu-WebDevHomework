
# HW1 — Data-Grid Contracts

Status: Draft
Task: T-00C

## 1. VNode Contract

```ts
type VNodeType = string | Function;

interface VNode {
  type: VNodeType;
  props: {
    children: VNode[];
    [key: string]: unknown;
  };
}
```

Invariants:
- Children must be normalized.
- Text content must use TEXT_ELEMENT.
- Rendering must not use unsafe innerHTML.
- Functional components require explicit support.

## 2. Column Contract

```ts
interface ColumnDef<T> {
  id: string;
  header: string;
  accessor: keyof T;
  sortable?: boolean;
  filterable?: boolean;
}
```

Invariants:
- Column IDs must be unique.
- Accessors must reference valid row fields.
- Sorting must not mutate source data.

## 3. DataGridProps Contract

```ts
interface DataGridProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize: number;
  getRowId: (row: T) => string | number;
}
```

Invariants:
- Row IDs must be unique.
- Page size must be a positive integer.
- Data must remain immutable.

## 4. GridState Contract

```ts
interface GridState {
  sortColumn: string | null;
  sortDirection: "asc" | "desc";
  filterQuery: string;
  currentPage: number;
  selectedRowIds: Set<string | number>;
  focusedCell: {
    rowIndex: number;
    columnIndex: number;
  } | null;
}
```

Invariants:
- Current page must remain within valid bounds.
- Focused cell must refer to an existing cell.
- Selected row IDs must correspond to valid rows.
- Sorting and filtering must preserve source data.

## 5. Data Processing Pipeline

Original Data
↓
Filtering
↓
Sorting
↓
Pagination
↓
Rendered Grid

## 6. Verification Requirements

- Sorting must be deterministic.
- Filtering must handle empty results.
- Pagination must handle boundary cases.
- Keyboard navigation must respect grid boundaries.
- All interactive controls must be keyboard accessible.
- User-controlled text must render safely.
