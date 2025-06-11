"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarIcon,
  FilterIcon,
  SortAscIcon,
  SortDescIcon,
  XIcon,
} from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useDebounce } from "@/hooks/use-debounce";
type StatusOption = "all" | "draft" | "in-progress" | "completed" | "pending";
type SortField = "title" | "date" | "status" | "none"; // Added "none"
type SortOrder = "asc" | "desc" | "none"; // Added "none"
type DateRange = "all" | "today" | "week" | "month" | "quarter" | "year";

interface FilterState {
  status: StatusOption;
  sortField: SortField;
  sortOrder: SortOrder;
  dateRange: DateRange;
  search: string;
}

const STATUS_OPTIONS: { value: StatusOption; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
];

const SORT_FIELD_OPTIONS: { value: SortField; label: string }[] = [
  { value: "none", label: "No Sort" },
  { value: "title", label: "Title" },
  { value: "date", label: "Date" },
  { value: "status", label: "Status" },
];

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
];

const DEFAULT_FILTERS: FilterState = {
  status: "all",
  sortField: "none", // Changed from empty string to "none"
  sortOrder: "none", // Changed from empty string to "none"
  dateRange: "all",
  search: "",
};

export default function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>(() => {
    return {
      status:
        (searchParams.get("status") as StatusOption) || DEFAULT_FILTERS.status,
      sortField:
        (searchParams.get("sortField") as SortField) ||
        DEFAULT_FILTERS.sortField,
      sortOrder:
        (searchParams.get("sortOrder") as SortOrder) ||
        DEFAULT_FILTERS.sortOrder,
      dateRange:
        (searchParams.get("dateRange") as DateRange) ||
        DEFAULT_FILTERS.dateRange,
      search: searchParams.get("search") || DEFAULT_FILTERS.search,
    };
  });
  const debouncedFilters = useDebounce<FilterState>(filters, 500);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  useEffect(() => {
    const newParams = new URLSearchParams();

    if (debouncedFilters.status !== DEFAULT_FILTERS.status) {
      newParams.set("status", debouncedFilters.status);
    }

    if (debouncedFilters.sortField !== DEFAULT_FILTERS.sortField) {
      newParams.set("sortField", debouncedFilters.sortField);
    }

    if (debouncedFilters.sortOrder !== DEFAULT_FILTERS.sortOrder) {
      newParams.set("sortOrder", debouncedFilters.sortOrder);
    }

    if (debouncedFilters.dateRange !== DEFAULT_FILTERS.dateRange) {
      newParams.set("dateRange", debouncedFilters.dateRange);
    }

    if (debouncedFilters.search) {
      newParams.set("search", debouncedFilters.search);
    }

    const newUrl = newParams.toString()
      ? `${pathname}?${newParams.toString()}`
      : pathname;
    router.push(newUrl, { scroll: false });
  }, [debouncedFilters, pathname, router]);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Update the appliedFilterCount to use debouncedFilters
  const appliedFilterCount = Object.entries(debouncedFilters).reduce(
    (count, [key, value]) => {
      if (key === "search" && value) return count + 1;
      if (
        key !== "search" &&
        value !== DEFAULT_FILTERS[key as keyof FilterState]
      )
        return count + 1;
      return count;
    },
    0
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full pl-3 bg-white pr-8"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => updateFilter("search", "")}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="hidden sm:flex items-center bg-white gap-2">
          <Select
            value={filters.status}
            onValueChange={(value) =>
              updateFilter("status", value as StatusOption)
            }
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.dateRange}
            onValueChange={(value) =>
              updateFilter("dateRange", value as DateRange)
            }
          >
            <SelectTrigger className="w-[130px]">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <SelectValue placeholder="Date" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <div className="flex items-center gap-1">
                  {filters.sortOrder === "asc" ? (
                    <SortAscIcon className="h-4 w-4" />
                  ) : (
                    <SortDescIcon className="h-4 w-4" />
                  )}
                  <span>Sort</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filters.sortField}
                onValueChange={(value) =>
                  updateFilter("sortField", value as SortField)
                }
              >
                {SORT_FIELD_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filters.sortOrder}
                onValueChange={(value) =>
                  updateFilter("sortOrder", value as SortOrder)
                }
              >
                <DropdownMenuRadioItem value="asc">
                  <div className="flex items-center gap-2">
                    <SortAscIcon className="h-4 w-4" />
                    <span>Ascending</span>
                  </div>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="desc">
                  <div className="flex items-center gap-2">
                    <SortDescIcon className="h-4 w-4" />
                    <span>Descending</span>
                  </div>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {appliedFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          )}
        </div>

        <div className="sm:hidden ">
          <Drawer open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" className="w-full flex justify-between">
                <div className="flex items-center gap-1">
                  <FilterIcon className="h-4 w-4" />
                  <span>Filters</span>
                  {appliedFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {appliedFilterCount}
                    </Badge>
                  )}
                </div>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="focus:outline-none">
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader>
                  <DrawerTitle className="text-center text-xl font-semibold">
                    Filters
                  </DrawerTitle>
                  {appliedFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        resetFilters();
                        setIsFilterMenuOpen(false);
                      }}
                      className="absolute right-4 top-4"
                    >
                      Reset all
                    </Button>
                  )}
                </DrawerHeader>

                <div className="p-4 pb-0">
                  <div className="space-y-6">
                    {/* Status Filter */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="mobile-status"
                        className="text-sm font-medium text-gray-700"
                      >
                        Status
                      </Label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) =>
                          updateFilter("status", value as StatusOption)
                        }
                      >
                        <SelectTrigger
                          id="mobile-status"
                          className="w-full h-10"
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Range Filter */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="mobile-date"
                        className="text-sm font-medium text-gray-700"
                      >
                        Date Range
                      </Label>
                      <Select
                        value={filters.dateRange}
                        onValueChange={(value) =>
                          updateFilter("dateRange", value as DateRange)
                        }
                      >
                        <SelectTrigger id="mobile-date" className="w-full h-10">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            <SelectValue placeholder="Select date range" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {DATE_RANGE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort Options */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="mobile-sort"
                        className="text-sm font-medium text-gray-700"
                      >
                        Sort by
                      </Label>
                      <div className="flex gap-2">
                        <Select
                          value={filters.sortField}
                          onValueChange={(value) =>
                            updateFilter("sortField", value as SortField)
                          }
                        >
                          <SelectTrigger
                            id="mobile-sort"
                            className="flex-1 h-10"
                          >
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            {SORT_FIELD_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() =>
                            updateFilter(
                              "sortOrder",
                              filters.sortOrder === "asc" ? "desc" : "asc"
                            )
                          }
                          aria-label={
                            filters.sortOrder === "asc"
                              ? "Sort ascending"
                              : "Sort descending"
                          }
                        >
                          {filters.sortOrder === "asc" ? (
                            <SortAscIcon className="h-4 w-4" />
                          ) : (
                            <SortDescIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Applied Filters Display */}
                    {appliedFilterCount > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Applied Filters
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {filters.status !== DEFAULT_FILTERS.status && (
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <span>
                                Status:{" "}
                                {
                                  STATUS_OPTIONS.find(
                                    (o) => o.value === filters.status
                                  )?.label
                                }
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() =>
                                  updateFilter("status", DEFAULT_FILTERS.status)
                                }
                              >
                                <XIcon className="h-3 w-3" />
                              </Button>
                            </Badge>
                          )}

                          {filters.dateRange !== DEFAULT_FILTERS.dateRange && (
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <span>
                                Date:{" "}
                                {
                                  DATE_RANGE_OPTIONS.find(
                                    (o) => o.value === filters.dateRange
                                  )?.label
                                }
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() =>
                                  updateFilter(
                                    "dateRange",
                                    DEFAULT_FILTERS.dateRange
                                  )
                                }
                              >
                                <XIcon className="h-3 w-3" />
                              </Button>
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <DrawerFooter className="pt-2">
                  <Button
                    className="w-full"
                    onClick={() => setIsFilterMenuOpen(false)}
                  >
                    Apply Filters
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {appliedFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status !== DEFAULT_FILTERS.status && (
            <Badge variant="outline" className="flex items-center gap-1 pr-1">
              <span>
                Status:{" "}
                {STATUS_OPTIONS.find((o) => o.value === filters.status)?.label}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => updateFilter("status", DEFAULT_FILTERS.status)}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.dateRange !== DEFAULT_FILTERS.dateRange && (
            <Badge variant="outline" className="flex items-center gap-1 pr-1">
              <span>
                Date:{" "}
                {
                  DATE_RANGE_OPTIONS.find((o) => o.value === filters.dateRange)
                    ?.label
                }
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() =>
                  updateFilter("dateRange", DEFAULT_FILTERS.dateRange)
                }
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {(filters.sortField !== DEFAULT_FILTERS.sortField ||
            filters.sortOrder !== DEFAULT_FILTERS.sortOrder) && (
            <Badge variant="outline" className="flex items-center gap-1 pr-1">
              <span>
                Sort:{" "}
                {
                  SORT_FIELD_OPTIONS.find((o) => o.value === filters.sortField)
                    ?.label
                }
                ({filters.sortOrder === "asc" ? "↑" : "↓"})
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => {
                  updateFilter("sortField", DEFAULT_FILTERS.sortField);
                  updateFilter("sortOrder", DEFAULT_FILTERS.sortOrder);
                }}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.search && (
            <Badge variant="outline" className="flex items-center gap-1 pr-1">
              <span>Search: {filters.search}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => updateFilter("search", "")}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
