import { FilterState, StatusOption, SortField, DateRange } from "@/types/project-types";

export const DEFAULT_FILTERS: FilterState = {
  status: "all",
  sortField: "date",
  sortOrder: "desc",
  dateRange: "all",
  search: "",
};

export const STATUS_OPTIONS: { value: StatusOption; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
  { value: "pending", label: "Pending" },
  { value: "error", label: "Error" },
];

export const SORT_FIELD_OPTIONS: { value: SortField; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "date", label: "Date" },
  { value: "priority", label: "Priority" },
  { value: "status", label: "Status" },
];

export const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
];