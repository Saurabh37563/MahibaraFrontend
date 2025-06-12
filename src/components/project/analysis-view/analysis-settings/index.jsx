"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiInfo, FiCheck } from "react-icons/fi";
import { PiMagicWand } from "react-icons/pi";
import { Loader2, Settings, Trash2, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

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

export default function ColumnMappingDialog({
  projectId,
  analysisType,
  open: controlledOpen,
  setOpen: setControlledOpen,
  children, // custom trigger
}) {
  const queryClient = useQueryClient();

  // Dialog open state
  const [open, setOpen] =
    typeof controlledOpen === "boolean"
      ? [controlledOpen, setControlledOpen]
      : useState(false);

  // State for loading column mapping data
  const [isLoading, setIsLoading] = useState(false);

  // States for column mapping data
  const [sourceColumns, setSourceColumns] = useState([]);
  const [targetColumns, setTargetColumns] = useState([]);
  const [columnMappingQuery, setColumnMappingQuery] = useState({ data: {} });

  // State to track approved mappings
  const [approvedMappings, setApprovedMappings] = useState(new Set());

  // New state to track approved mappings
  const [saveMapping, setSaveMapping] = useState({ isLoading: false });
  const [isApproveAllLoading, setIsApproveAllLoading] = useState(false);

  // Derived values
  const totalSourceColumns = sourceColumns.length;
  const usedTargetColumns = Object.values(columnMappingQuery.data || {});
  const mappedColumnsCount = Object.keys(columnMappingQuery.data || {}).length;
  const approvedColumnsCount = approvedMappings.size;

  const unmappedRequired = targetColumns.filter(
    (col) => col.required && !usedTargetColumns.includes(col.id),
  );

  // Find required source columns that are mapped but not approved
  const requiredSourceColumnsNotApproved = sourceColumns
    .filter(
      (col) =>
        col.required &&
        columnMappingQuery.data[col.id] &&
        !approvedMappings.has(col.id),
    )
    .map((col) => col.name);

  const isAllRequiredMapped = unmappedRequired.length === 0;
  const isAllRequiredApproved = requiredSourceColumnsNotApproved.length === 0;

  const [isAutoRemapLoading, setIsAutoRemapLoading] = useState(false);

  const handleAutoMap = async () => {
    setIsAutoRemapLoading(true);
    // Simulate a long operation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Clear approvals when remapping
    setApprovedMappings(new Set());
    setIsAutoRemapLoading(false);
  };

  const handleApproveAll = async () => {
    setIsApproveAllLoading(true);
    // Simulate a short operation
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Approve all currently mapped columns
    const newApprovedSet = new Set(approvedMappings);
    Object.keys(columnMappingQuery.data).forEach((sourceId) => {
      if (
        columnMappingQuery.data[sourceId] &&
        columnMappingQuery.data[sourceId] !== "none"
      ) {
        newApprovedSet.add(sourceId);
      }
    });

    setApprovedMappings(newApprovedSet);
    setIsApproveAllLoading(false);
  };

  const handleApproveMapping = (sourceId) => {
    const newApprovedSet = new Set(approvedMappings);
    newApprovedSet.add(sourceId);
    setApprovedMappings(newApprovedSet);
  };

  const handleColumnMappingChange = (sourceId, targetId) => {
    // When mapping changes, remove approval
    const newApprovedSet = new Set(approvedMappings);
    newApprovedSet.delete(sourceId);
    setApprovedMappings(newApprovedSet);

    setColumnMappingQuery((prev) => ({
      data: { ...prev.data, [sourceId]: targetId },
    }));
  };

  const clearMapping = (sourceId) => {
    // When mapping is cleared, remove approval
    const newApprovedSet = new Set(approvedMappings);
    newApprovedSet.delete(sourceId);
    setApprovedMappings(newApprovedSet);

    const newData = { ...columnMappingQuery.data };
    delete newData[sourceId];
    setColumnMappingQuery({ data: newData });
  };

  const handleSubmit = async (callback) => {
    setSaveMapping({ isLoading: true });
    try {
      await axios.post(
        BASE_TEMP_BACKEND_URL +
          `/api/v1/sheet/sheet/column_mapping/${projectId}/${analysisType}/save`,
        {
          sheet_types: {
            PO: {
              status: "success",
              mapped_columns: Object.entries(columnMappingQuery.data).map(
                ([sourceColumn, targetColumn]) => ({
                  source_column: sourceColumn,
                  target_column: targetColumn,
                })
              ),
              source_columns: sourceColumns.map((col) => col.id),
              target_columns: targetColumns.map((col) => col.id),
            },
          },
        }
      );
      queryClient.invalidateQueries({
        queryKey: ["analysisData", projectId, analysisType],
      }); // Reload analysis data
      callback();
    } catch (error) {
      console.error("Failed to save column mappings:", error);
    } finally {
      setSaveMapping({ isLoading: false });
    }
  };

  const canComplete = isAllRequiredMapped && isAllRequiredApproved;

  // Fetch column mapping data when dialog opens
  useEffect(() => {
    if (!open || !projectId || !analysisType) return;

    const fetchColumnMappingData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          BASE_TEMP_BACKEND_URL +
            `/api/v1/sheet/sheet/column_mapping/${projectId}/${analysisType}`
        );
        const mappingData = response.data?.data?.sheet_types?.PO;

        if (mappingData) {
          // Populate source columns (mark all as required)
          setSourceColumns(
            mappingData.source_columns.map((sourceColumn) => ({
              id: sourceColumn,
              name: sourceColumn,
              required: true, // Only source columns are required
            }))
          );

          // Populate target columns
          setTargetColumns(
            mappingData.target_columns.map((targetColumn) => ({
              id: targetColumn,
              name: targetColumn,
              required: false, // Target columns are not required
            }))
          );

          // Populate column mapping query
          const mappedColumns = {};
          mappingData.mapped_columns.forEach((mapping) => {
            mappedColumns[mapping.source_column] = mapping.target_column;
          });
          setColumnMappingQuery({ data: mappedColumns });

          // Approve all mapped columns by default
          setApprovedMappings(new Set(Object.keys(mappedColumns)));
        }
      } catch (error) {
        console.error("Failed to fetch column mapping data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchColumnMappingData();
  }, [open, projectId, analysisType]);

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

      <Dialog open={open} onOpenChange={setOpen}>
        {/* Allow custom trigger via children, fallback to settings icon */}
        <DialogTrigger asChild>
          {children ? (
            children
          ) : (
            <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
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
              <div className="space-y-4 mt-2 flex-shrink-0">
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    {mappedColumnsCount} of {totalSourceColumns} columns mapped
                    <span className="ml-2 text-green-700">
                      ({approvedColumnsCount} approved)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {/* New Approve All Button */}
                    <Button
                      variant="outline"
                      className={cn(
                        "relative overflow-hidden transition-all duration-300 bg-blue-800/10 hover:bg-blue-800/20 text-blue-800 hover:shadow-lg",
                        isApproveAllLoading && "pointer-events-none",
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

                    {/* Existing Re-Map All Button */}
                    <Button
                      variant="outline"
                      className={cn(
                        "relative overflow-hidden transition-all duration-300 bg-green-800/10 hover:bg-green-800/20 text-green-800 hover:shadow-lg",
                        isAutoRemapLoading && "pointer-events-none",
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
                      columns that haven't been mapped yet:
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
                <div
                className="overflow-x-auto overflow-y-auto"
                >
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
                        {sourceColumns.map((sourceColumn) => {
                          const mappedTargetId =
                            columnMappingQuery.data?.[sourceColumn.id] || "";
                          const isApproved = approvedMappings.has(
                            sourceColumn.id,
                          );
                          const canApprove =
                            mappedTargetId && mappedTargetId !== "none";

                          return (
                            <TableRow
                              key={sourceColumn.id}
                            >
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
                                      value,
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a target column" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem>None</SelectItem>
                                    {targetColumns.map((targetColumn) => (
                                      <SelectItem
                                        key={targetColumn.id}
                                        value={targetColumn.id}
                                      >
                                        {targetColumn.name}
                                        {targetColumn.required && " *"}
                                      </SelectItem>
                                    ))}
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

                  {sourceColumns.length === 0 && (
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
                  {canComplete
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
                    onClick={() => setOpen(false)}
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
}
