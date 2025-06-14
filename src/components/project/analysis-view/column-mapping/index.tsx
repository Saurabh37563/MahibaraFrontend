"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiInfo, FiCheck } from "react-icons/fi";
import { PiMagicWand } from "react-icons/pi";
import { Loader2, Settings, Trash2, CheckCircle2 } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { BASE_TEMP_BACKEND_URL } from "@/constants/endpoints-constant";
import {
  ColumnMappingDialogProps,
  ColumnMappingSourceColumn,
  ColumnMappingTargetColumn,
  AiColumnMappingResponse,
} from "@/types/project-types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Add SheetTypeMappingData type ---
type SheetTypeMappingData = {
  sourceColumns: ColumnMappingSourceColumn[];
  targetColumns: ColumnMappingTargetColumn[];
  columnMappingQuery: { data: Record<string, string> };
  approvedMappings: Set<string>;
};

type SheetTypeMappingState = Record<string, SheetTypeMappingData>;

const useAiColumnMapping = () => {
  return useMutation({
    mutationFn: async ({
      projectId,
      workingTypeId,
    }: {
      projectId: string | number;
      workingTypeId: string | number;
    }) => {
      const url = `${BASE_TEMP_BACKEND_URL}/api/v1/sheet/sheet/ai_column_mapping/${projectId}/${workingTypeId}/`;
      const response = await axios.post(url);
      return response.data as AiColumnMappingResponse;
    },
  });
};

const ColumnMappingDialog: React.FC<ColumnMappingDialogProps> = ({
  projectId,
  analysisType,
  open: controlledOpen,
  setOpen: setControlledOpen,
  children,
}) => {
  const queryClient = useQueryClient();

  // Always call useState for open
  const [open, setOpen] = useState(false);

  // Sync internal open state with controlled props if provided
  useEffect(() => {
    if (typeof controlledOpen === "boolean") {
      setOpen(controlledOpen);
    }
  }, [controlledOpen]);

  // Handler to update open state and call controlled setter if present
  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (setControlledOpen) setControlledOpen(value);
  };

  // State for loading column mapping data
  const [isLoading, setIsLoading] = useState(false);

  // State for all sheet types mapping data
  const [sheetTypeMappings, setSheetTypeMappings] =
    useState<SheetTypeMappingState>({});
  const [selectedSheetType, setSelectedSheetType] = useState<string | null>(
    null
  );

  // New state to track approved mappings
  const [saveMapping, setSaveMapping] = useState<{ isLoading: boolean }>({
    isLoading: false,
  });
  const [isApproveAllLoading, setIsApproveAllLoading] = useState(false);
  const [isAutoRemapLoading, setIsAutoRemapLoading] = useState(false);

  // Derived values
  const currentMapping =
    selectedSheetType && sheetTypeMappings[selectedSheetType]
      ? sheetTypeMappings[selectedSheetType]
      : {
          sourceColumns: [],
          targetColumns: [],
          columnMappingQuery: { data: {} },
          approvedMappings: new Set<string>(),
        };

  const {
    sourceColumns: currentSourceColumns,
    targetColumns: currentTargetColumns,
    columnMappingQuery: currentColumnMappingQuery,
    approvedMappings: currentApprovedMappings,
  } = currentMapping;

  const totalSourceColumns = currentSourceColumns.length;
  const usedTargetColumns = Object.values(currentColumnMappingQuery.data || {});
  const mappedColumnsCount = Object.keys(
    currentColumnMappingQuery.data || {}
  ).length;
  const approvedColumnsCount = currentApprovedMappings.size;

  const unmappedRequired = currentTargetColumns.filter(
    (col) => col.required && !usedTargetColumns.includes(col.id)
  );

  // Find required source columns that are mapped but not approved
  const requiredSourceColumnsNotApproved = currentSourceColumns
    .filter(
      (col) =>
        col.required &&
        currentColumnMappingQuery.data[col.id] &&
        !currentApprovedMappings.has(col.id)
    )
    .map((col) => col.name);

  const isAllRequiredMapped = unmappedRequired.length === 0;
  const isAllRequiredApproved = requiredSourceColumnsNotApproved.length === 0;

  // AI column mapping mutation
  const aiColumnMappingMutation = useAiColumnMapping();

  // --- Remap handler for all sheet types ---
  const handleAutoMap = async () => {
    aiColumnMappingMutation.reset();
    setIsAutoRemapLoading(true);
    try {
      const aiResult = await aiColumnMappingMutation.mutateAsync({
        projectId,
        workingTypeId: analysisType,
      });
      const sheetTypesData = (aiResult?.data as { [key: string]: unknown })[
        "sheet_types"
      ] as Record<string, SheetTypeMappingApiResponse>;
      if (!sheetTypesData) {
        setIsAutoRemapLoading(false);
        return;
      }
      const newMappings: SheetTypeMappingState = {};
      Object.entries(sheetTypesData).forEach(([sheetType, data]) => {
        const mappedColumns: Record<string, string> = {};
        (Array.isArray(data.mapped_columns) ? data.mapped_columns : []).forEach(
          (mapping: { source_column: string; target_column: string }) => {
            mappedColumns[mapping.source_column] = mapping.target_column;
          }
        );
        newMappings[sheetType] = {
          sourceColumns: (Array.isArray(data.source_columns)
            ? data.source_columns
            : []
          ).map(
            (col: string): ColumnMappingSourceColumn => ({
              id: col,
              name: col,
              required: true,
            })
          ),
          targetColumns: (Array.isArray(data.target_columns)
            ? data.target_columns
            : []
          ).map(
            (col: string): ColumnMappingTargetColumn => ({
              id: col,
              name: col,
              required: false,
            })
          ),
          columnMappingQuery: { data: mappedColumns },
          approvedMappings: new Set(),
        };
      });
      setSheetTypeMappings(newMappings);
      if (!selectedSheetType || !newMappings[selectedSheetType]) {
        setSelectedSheetType(Object.keys(newMappings)[0] || null);
      }
    } catch (error) {
      console.error("AI column mapping failed", error);
    } finally {
      setIsAutoRemapLoading(false);
    }
  };

  // --- Approve All for current sheet type ---
  const handleApproveAll = async () => {
    setIsApproveAllLoading(true);
    // Simulate a short operation
    await new Promise((resolve) => setTimeout(resolve, 800));

    setSheetTypeMappings((prev: SheetTypeMappingState) => {
      if (!selectedSheetType || !prev[selectedSheetType]) return prev;
      const mapping = prev[selectedSheetType];
      const newApprovedSet = new Set(mapping.approvedMappings);
      Object.keys(mapping.columnMappingQuery.data).forEach(
        (sourceId: string) => {
          if (
            mapping.columnMappingQuery.data[sourceId] &&
            mapping.columnMappingQuery.data[sourceId] !== "none"
          ) {
            newApprovedSet.add(sourceId);
          }
        }
      );
      return {
        ...prev,
        [selectedSheetType]: {
          ...mapping,
          approvedMappings: newApprovedSet,
        },
      };
    });
    setIsApproveAllLoading(false);
  };

  // --- Approve single mapping for current sheet type ---
  const handleApproveMapping = (sourceId: string) => {
    setSheetTypeMappings((prev: SheetTypeMappingState) => {
      if (!selectedSheetType || !prev[selectedSheetType]) return prev;
      const mapping = prev[selectedSheetType];
      const newApprovedSet = new Set(mapping.approvedMappings);
      newApprovedSet.add(sourceId);
      return {
        ...prev,
        [selectedSheetType]: {
          ...mapping,
          approvedMappings: newApprovedSet,
        },
      };
    });
  };

  // --- Change mapping for current sheet type ---
  const handleColumnMappingChange = (sourceId: string, targetId: string) => {
    setSheetTypeMappings((prev: SheetTypeMappingState) => {
      if (!selectedSheetType || !prev[selectedSheetType]) return prev;
      const mapping = prev[selectedSheetType];
      const newApprovedSet = new Set(mapping.approvedMappings);
      newApprovedSet.delete(sourceId);
      return {
        ...prev,
        [selectedSheetType]: {
          ...mapping,
          columnMappingQuery: {
            data: { ...mapping.columnMappingQuery.data, [sourceId]: targetId },
          },
          approvedMappings: newApprovedSet,
        },
      };
    });
  };

  // --- Clear mapping for current sheet type ---
  const clearMapping = (sourceId: string) => {
    setSheetTypeMappings((prev: SheetTypeMappingState) => {
      if (!selectedSheetType || !prev[selectedSheetType]) return prev;
      const mapping = prev[selectedSheetType];
      const newApprovedSet = new Set(mapping.approvedMappings);
      newApprovedSet.delete(sourceId);
      const newData = { ...mapping.columnMappingQuery.data };
      delete newData[sourceId];
      return {
        ...prev,
        [selectedSheetType]: {
          ...mapping,
          columnMappingQuery: { data: newData },
          approvedMappings: newApprovedSet,
        },
      };
    });
  };

  // --- Submit handler for all sheet types ---
  const handleSubmit = async (callback: () => void) => {
    setSaveMapping({ isLoading: true });
    try {
      const sheet_types: Record<
        string,
        {
          status: string;
          mapped_columns: { source_column: string; target_column: string }[];
          source_columns: string[];
          target_columns: string[];
        }
      > = {};
      Object.entries(sheetTypeMappings).forEach(([sheetType, mapping]) => {
        sheet_types[sheetType] = {
          status: "success",
          mapped_columns: Object.entries(mapping.columnMappingQuery.data).map(
            ([sourceColumn, targetColumn]: [string, string]) => ({
              source_column: sourceColumn,
              target_column: targetColumn,
            })
          ),
          source_columns: mapping.sourceColumns.map(
            (col: ColumnMappingSourceColumn) => col.id
          ),
          target_columns: mapping.targetColumns.map(
            (col: ColumnMappingTargetColumn) => col.id
          ),
        };
      });
      await axios.post(
        BASE_TEMP_BACKEND_URL +
          `/api/v1/sheet/sheet/column_mapping/${projectId}/${analysisType}/save`,
        { sheet_types }
      );
      queryClient.invalidateQueries({
        queryKey: ["analysisData", projectId, analysisType],
      });
      callback();
    } catch (error) {
      console.error("Failed to save column mappings:", error);
    } finally {
      setSaveMapping({ isLoading: false });
    }
  };

  // --- Fetch column mapping data when dialog opens ---
  useEffect(() => {
    if (!open || !projectId || !analysisType) return;

    const fetchColumnMappingData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          BASE_TEMP_BACKEND_URL +
            `/api/v1/sheet/sheet/column_mapping/${projectId}/${analysisType}`
        );
        const sheetTypesData = (response.data?.data?.sheet_types ??
          {}) as Record<string, SheetTypeMappingApiResponse>;
        if (sheetTypesData) {
          setAllSheetTypeMappings(sheetTypesData);
        }
      } catch (error) {
        console.error("Failed to fetch column mapping data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchColumnMappingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectId, analysisType]);

  // Helper to set all sheet type mappings
  const setAllSheetTypeMappings = (
    sheetTypesData: Record<string, SheetTypeMappingApiResponse>
  ) => {
    const newMappings: SheetTypeMappingState = {};
    Object.entries(sheetTypesData).forEach(([sheetType, data]) => {
      const mappedColumns: Record<string, string> = {};
      (Array.isArray(data.mapped_columns) ? data.mapped_columns : []).forEach(
        (mapping: { source_column: string; target_column: string }) => {
          mappedColumns[mapping.source_column] = mapping.target_column;
        }
      );
      newMappings[sheetType] = {
        sourceColumns: (Array.isArray(data.source_columns)
          ? data.source_columns
          : []
        ).map(
          (col: string): ColumnMappingSourceColumn => ({
            id: col,
            name: col,
            required: true,
          })
        ),
        targetColumns: (Array.isArray(data.target_columns)
          ? data.target_columns
          : []
        ).map(
          (col: string): ColumnMappingTargetColumn => ({
            id: col,
            name: col,
            required: false,
          })
        ),
        columnMappingQuery: { data: mappedColumns },
        approvedMappings: new Set(Object.keys(mappedColumns)),
      };
    });
    setSheetTypeMappings(newMappings);
    // Set default selected sheet type if not set
    if (!selectedSheetType) {
      const firstType = Object.keys(newMappings)[0] || null;
      setSelectedSheetType(firstType);
    }
  };

  // Dialog open state
  // const [open, setOpen] =
  //   typeof controlledOpen === "boolean" && setControlledOpen
  //     ? [controlledOpen, setControlledOpen]
  //     : useState(false);

  return (
    <>
      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
          background-color: #f5f5f5;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cccccc;
          border-radius: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #aaaaaa;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cccccc #f5f5f5;
          scrollbar-gutter: stable;
        }
      `}</style>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        {/* Allow custom trigger via children, fallback to settings icon */}
        <DialogTrigger asChild>
          {children ? (
            children
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleOpenChange(true)}
            >
              <Settings className="size-4" />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-full sm:max-w-[95%] md:max-w-[85%] lg:max-w-[75%] h-[90vh] p-3 sm:p-4 md:p-6 overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Column Mapping</DialogTitle>
            <DialogDescription>
              Verify the suggested mappings and adjust if needed
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8 flex-grow">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">Loading column data...</span>
            </div>
          ) : (
            <div className="flex flex-col flex-grow overflow-hidden">
              {/* Sheet type tabs */}
              <div className="mb-4">
                <Tabs
                  value={selectedSheetType || ""}
                  onValueChange={setSelectedSheetType}
                >
                  <TabsList>
                    {Object.keys(sheetTypeMappings).map((sheetType) => (
                      <TabsTrigger key={sheetType} value={sheetType}>
                        {sheetType}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-4 mt-2 flex-shrink-0">
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    {mappedColumnsCount} of {totalSourceColumns} columns mapped
                    <span className="ml-2 text-green-700">
                      ({approvedColumnsCount} approved)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className={cn(
                        "relative overflow-hidden transition-all duration-300 bg-blue-800/10 hover:bg-blue-800/20 text-blue-800 hover:shadow-lg",
                        isApproveAllLoading && "pointer-events-none"
                      )}
                      onClick={handleApproveAll}
                      disabled={isApproveAllLoading || mappedColumnsCount === 0}
                    >
                      {isApproveAllLoading ? (
                        <>
                          <span className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Approving...</span>
                          </span>
                        </>
                      ) : (
                        <span className="flex items-center">
                          <CheckCircle2
                            className="mr-2 transition-transform hover:translate-y-[-2px]"
                            size={18}
                          />
                          Approve All
                        </span>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className={cn(
                        "relative overflow-hidden transition-all duration-300 bg-green-800/10 hover:bg-green-800/20 text-green-800 hover:shadow-lg",
                        isAutoRemapLoading && "pointer-events-none"
                      )}
                      onClick={handleAutoMap}
                      disabled={isAutoRemapLoading}
                    >
                      {isAutoRemapLoading ? (
                        <>
                          <span className="flex items-center">
                            <PiMagicWand
                              className="mr-2 animate-[bounce_1s_ease-in-out_infinite]"
                              size={18}
                            />
                            <span>Mapping...</span>
                          </span>
                          <span className="absolute inset-0 flex justify-center items-center">
                            <span className="absolute w-8 h-8 bg-white/20 rounded-full animate-ping"></span>
                            <span className="absolute w-full h-full bg-gradient-to-r from-green-500/20 via-green-400/20 to-green-500/20 opacity-75"></span>
                          </span>
                        </>
                      ) : (
                        <span className="flex items-center">
                          <PiMagicWand className="mr-2 transition-transform hover:translate-y-[-2px]" />
                          Re-Map All
                        </span>
                      )}
                    </Button>
                  </div>
                </div>

                <Progress
                  value={(approvedColumnsCount / totalSourceColumns) * 100}
                  className="h-2 w-full bg-gray-200"
                />

                {unmappedRequired.length > 0 && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertDescription className="text-amber-800">
                      There are {unmappedRequired.length} required target
                      columns that haven&apos;t been mapped yet:
                      <div className="flex flex-wrap gap-1 mt-2">
                        {unmappedRequired.map((col) => (
                          <Badge
                            key={col.id}
                            variant="outline"
                            className="border-amber-300 bg-amber-100 text-amber-800"
                          >
                            {col.name}
                          </Badge>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {requiredSourceColumnsNotApproved.length > 0 && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-blue-800">
                      These required mappings need your approval:
                      <div className="flex flex-wrap gap-1 mt-2">
                        {requiredSourceColumnsNotApproved.map((name) => (
                          <Badge
                            key={name}
                            variant="outline"
                            className="border-blue-300 bg-blue-100 text-blue-800"
                          >
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Table container with both horizontal and vertical scrolling */}
              <div className="flex-grow overflow-hidden mt-4 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
                <div className="overflow-x-auto overflow-y-auto">
                  <div className="min-w-[800px] pb-4">
                    <Table className="w-full">
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="w-[35%]">
                            Source Column
                          </TableHead>
                          <TableHead className="w-[45%]">
                            Target Column
                          </TableHead>
                          <TableHead className="w-[20%] text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentSourceColumns.map((sourceColumn) => {
                          const mappedTargetId =
                            currentColumnMappingQuery.data?.[sourceColumn.id] ||
                            "";
                          const isApproved = currentApprovedMappings.has(
                            sourceColumn.id
                          );
                          const canApprove =
                            mappedTargetId && mappedTargetId !== "none";

                          return (
                            <TableRow key={sourceColumn.id}>
                              <TableCell className="font-medium">
                                <div className="flex flex-wrap gap-1 items-center">
                                  <span className="w-fit">
                                    {sourceColumn.name}
                                  </span>
                                  {sourceColumn?.required && (
                                    <Badge className="text-xs rounded-full bg-yellow-500/10 text-amber-700 whitespace-nowrap">
                                      Required
                                    </Badge>
                                  )}
                                  {isApproved && (
                                    <Badge className="text-xs rounded-full bg-green-500/10 text-green-700 whitespace-nowrap">
                                      <FiCheck className="mr-1" /> Approved
                                    </Badge>
                                  )}
                                </div>
                                {sourceColumn.summary && (
                                  <div className="text-gray-500 mt-1 w-fit text-sm">
                                    {sourceColumn.summary}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={mappedTargetId}
                                  onValueChange={(value) =>
                                    handleColumnMappingChange(
                                      sourceColumn.id,
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a target column" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {currentTargetColumns.map(
                                      (targetColumn) => (
                                        <SelectItem
                                          key={targetColumn.id}
                                          value={targetColumn.id}
                                        >
                                          {targetColumn.name}
                                          {targetColumn.required && " *"}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {canApprove && !isApproved && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleApproveMapping(sourceColumn.id)
                                      }
                                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                      <CheckCircle2
                                        size={14}
                                        className="mr-1"
                                      />
                                      Approve
                                    </Button>
                                  )}
                                  {mappedTargetId && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        clearMapping(sourceColumn.id)
                                      }
                                      className="text-gray-500 hover:text-red-500"
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {currentSourceColumns.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No source columns available for mapping
                    </div>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-500 flex items-center gap-1 mt-4 flex-shrink-0">
                <span className="text-red-500">*</span> Indicates required
                target columns
              </div>

              <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2 mt-4 pt-4 border-t flex-shrink-0">
                <div className="flex items-center text-sm gap-2 font-light mb-4 sm:mb-0">
                  <FiInfo />
                  {isAllRequiredMapped && isAllRequiredApproved
                    ? "All required columns are mapped and approved"
                    : `${
                        !isAllRequiredMapped
                          ? unmappedRequired.length +
                            " required columns still need to be mapped"
                          : requiredSourceColumnsNotApproved.length +
                            " required mappings need approval"
                      }`}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-green-900 w-full sm:w-auto"
                    onClick={() =>
                      handleSubmit(() => {
                        setOpen(false);
                      })
                    }
                    disabled={
                      saveMapping.isLoading ||
                      mappedColumnsCount === 0 ||
                      !isAllRequiredMapped ||
                      !isAllRequiredApproved
                    }
                  >
                    {saveMapping.isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Complete Mapping"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ColumnMappingDialog;

// --- Add API response type for sheet type mapping ---
type SheetTypeMappingApiResponse = {
  mapped_columns: { source_column: string; target_column: string }[];
  source_columns: string[];
  target_columns: string[];
  // ...other possible fields
};
