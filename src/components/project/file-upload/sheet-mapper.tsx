"use client";

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
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
import { Trash2, X, Plus } from "lucide-react";
import { MdVerified } from "react-icons/md";
import { useFileUpload } from "@/contexts/file-upload-context";
import { FormValues, SheetMapping } from "@/types/project-types";
import { Input } from "@/components/ui/input";

interface SheetMapperProps {
  form: UseFormReturn<FormValues>;
}

interface SheetRow {
  fileId: string;
  fileName: string;
  sheetId: string;
  sheetName: string;
  sheetIndex: number;
  mappingIndex?: number;
  isEmpty?: boolean; // For empty rows
}

const CLEAR_SELECTION_VALUE = "__CLEAR_SELECTION__";

export function SheetMapper({ form }: SheetMapperProps) {
  const {
    uploadedFiles,
    sheetTypes,
    mappings,
    addMapping,
    removeMapping,
    updateMapping,
    isSheetTypeValidated,
  } = useFileUpload();

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [pendingMapping, setPendingMapping] = useState<{
    index: number;
    mapping: SheetMapping;
    sheetRow: SheetRow;
  } | null>(null);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(
    null
  );

  // Generate all available sheets from uploaded files
  const getAllAvailableSheets = () => {
    const sheets: {
      fileId: string;
      fileName: string;
      sheetId: string;
      sheetName: string;
      sheetIndex: number;
    }[] = [];

    uploadedFiles.forEach((file) => {
      file.sheets.forEach((sheet, sheetIndex) => {
        sheets.push({
          fileId: file.id,
          fileName: file.file_name,
          sheetId: sheet.id,
          sheetName: sheet.name,
          sheetIndex,
        });
      });
    });

    return sheets;
  };

  // State to track empty row selections
  const [emptyRowSelections, setEmptyRowSelections] = useState<{
    [key: number]: {
      fileId: string;
      fileName: string;
      sheetId: string;
      sheetName: string;
      sheetIndex: number;
    };
  }>({});

  // Generate sheet rows including empty rows for extra data types
  const generateSheetRows = (): SheetRow[] => {
    const rows: SheetRow[] = [];
    const availableSheets = getAllAvailableSheets();

    // Add rows for existing mappings
    mappings.forEach((mapping, index) => {
      const sheet = availableSheets.find(
        (s) => s.fileId === mapping.fileId && s.sheetId === mapping.sheetId
      );
      if (sheet) {
        rows.push({
          ...sheet,
          mappingIndex: index,
        });
      }
    });

    // Add empty rows for unmapped sheets
    availableSheets.forEach((sheet) => {
      const isAlreadyMapped = mappings.some(
        (mapping) =>
          mapping.fileId === sheet.fileId && mapping.sheetId === sheet.sheetId
      );

      if (!isAlreadyMapped) {
        rows.push({
          ...sheet,
        });
      }
    });

    // Add empty rows if we have more data types than total rows
    const totalDataTypes = sheetTypes.length;
    const currentRowCount = rows.length;

    if (totalDataTypes > currentRowCount) {
      const emptyRowsNeeded = totalDataTypes - currentRowCount;
      for (let i = 0; i < emptyRowsNeeded; i++) {
        const emptyRowKey = currentRowCount + i;
        const emptyRowData = emptyRowSelections[emptyRowKey];

        rows.push({
          fileId: emptyRowData?.fileId || "",
          fileName: emptyRowData?.fileName || "",
          sheetId: emptyRowData?.sheetId || "",
          sheetName: emptyRowData?.sheetName || "",
          sheetIndex: emptyRowData?.sheetIndex || -1,
          isEmpty: true,
        });
      }
    }

    return rows;
  };

  const allSheetRows = generateSheetRows();

  // Sync form with mappings whenever mappings change
  useEffect(() => {
    // Clear existing form values first
    const currentFormValues = form.getValues();
    if (currentFormValues.mappings) {
      currentFormValues.mappings.forEach((_, index) => {
        form.unregister(`mappings.${index}`);
      });
    }

    // Set new form values based on current mappings
    mappings.forEach((mapping, index) => {
      form.setValue(`mappings.${index}.fileId`, mapping.fileId || "");
      form.setValue(`mappings.${index}.sheetId`, mapping.sheetId || "");
      form.setValue(`mappings.${index}.sheetType`, mapping.sheetType || "");
    });
  }, [mappings, form]);

  const getAvailableSheetTypes = (currentMappingIndex: number) => {
    return sheetTypes.filter((type) => {
      const isUsedElsewhere = mappings.some(
        (mapping, idx) =>
          idx !== currentMappingIndex && mapping.sheetType === type.name
      );
      return !isUsedElsewhere;
    });
  };

  const getAssignedDataTypesCount = (): number => {
    return mappings.length;
  };

  const getCurrentSheetType = (sheetRow: SheetRow): string => {
    if (sheetRow.mappingIndex !== undefined) {
      return mappings[sheetRow.mappingIndex]?.sheetType || "";
    }
    return "";
  };

  // Get the current values for a row (considering empty row selections)
  const getCurrentRowValues = (sheetRow: SheetRow, rowIndex: number) => {
    if (sheetRow.isEmpty) {
      const emptyRowData = emptyRowSelections[rowIndex];
      return emptyRowData || sheetRow;
    }
    return sheetRow;
  };

  // Handle source file selection
  const handleSourceFileChange = (
    sheetRow: SheetRow,
    rowIndex: number,
    fileId: string
  ) => {
    if (fileId === CLEAR_SELECTION_VALUE) {
      // Clear the entire row
      if (sheetRow.mappingIndex !== undefined) {
        removeMapping(sheetRow.mappingIndex);
      }
      // Clear empty row selection if it's an empty row
      if (sheetRow.isEmpty) {
        const newSelections = { ...emptyRowSelections };
        delete newSelections[rowIndex];
        setEmptyRowSelections(newSelections);
      }
      return;
    }

    const selectedFile = uploadedFiles.find((file) => file.id === fileId);
    if (!selectedFile || selectedFile.sheets.length === 0) return;

    // Auto-select first sheet of the file
    const firstSheet = selectedFile.sheets[0];

    // For empty rows, update the local state
    if (sheetRow.isEmpty) {
      setEmptyRowSelections((prev) => ({
        ...prev,
        [rowIndex]: {
          fileId: fileId,
          fileName: selectedFile.file_name,
          sheetId: firstSheet.id,
          sheetName: firstSheet.name,
          sheetIndex: 0,
        },
      }));
      return;
    }

    const newMapping: SheetMapping = {
      fileId: fileId,
      sheetId: firstSheet.id,
      sheetType: getCurrentSheetType(sheetRow),
      sheetIndex: 0,
    };

    if (sheetRow.mappingIndex !== undefined) {
      updateMapping(sheetRow.mappingIndex, newMapping);
    } else if (newMapping.sheetType) {
      addMapping(newMapping);
    }
  };

  // Handle sheet selection
  const handleSheetChange = (
    sheetRow: SheetRow,
    rowIndex: number,
    sheetId: string
  ) => {
    if (sheetId === CLEAR_SELECTION_VALUE) {
      return;
    }

    const currentRowValues = getCurrentRowValues(sheetRow, rowIndex);

    const selectedFile = uploadedFiles.find(
      (file) => file.id === currentRowValues.fileId
    );
    if (!selectedFile) return;

    const selectedSheet = selectedFile.sheets.find(
      (sheet) => sheet.id === sheetId
    );
    if (!selectedSheet) return;

    const sheetIndex = selectedFile.sheets.findIndex(
      (sheet) => sheet.id === sheetId
    );

    // For empty rows, update the local state
    if (sheetRow.isEmpty) {
      setEmptyRowSelections((prev) => ({
        ...prev,
        [rowIndex]: {
          ...prev[rowIndex],
          sheetId: sheetId,
          sheetName: selectedSheet.name,
          sheetIndex: sheetIndex,
        },
      }));
      return;
    }

    const newMapping: SheetMapping = {
      fileId: currentRowValues.fileId,
      sheetId: sheetId,
      sheetType: getCurrentSheetType(sheetRow),
      sheetIndex: sheetIndex,
    };

    if (sheetRow.mappingIndex !== undefined) {
      updateMapping(sheetRow.mappingIndex, newMapping);
    } else if (newMapping.sheetType) {
      addMapping(newMapping);
    }
  };

  // Handle sheet type change
  const handleSheetTypeChange = (
    sheetRow: SheetRow,
    rowIndex: number,
    value: string
  ) => {
    const existingMappingIndex = sheetRow.mappingIndex;

    // Handle clear selection
    if (value === CLEAR_SELECTION_VALUE) {
      if (existingMappingIndex !== undefined) {
        removeMapping(existingMappingIndex);
      }
      return;
    }

    const sheetType = value;

    // If no sheet type selected, do nothing
    if (!sheetType) {
      return;
    }

    // Check if this sheet type is already mapped elsewhere
    const isAlreadyMapped = mappings.some(
      (mapping, idx) =>
        idx !== existingMappingIndex && mapping.sheetType === sheetType
    );

    if (isAlreadyMapped) {
      return;
    }

    const currentRowValues = getCurrentRowValues(sheetRow, rowIndex);

    // For empty rows, we need file and sheet selection first
    if (
      sheetRow.isEmpty &&
      (!currentRowValues.fileId || !currentRowValues.sheetId)
    ) {
      return;
    }

    // For empty rows, create mapping from the selections
    if (sheetRow.isEmpty) {
      const newMapping: SheetMapping = {
        fileId: currentRowValues.fileId,
        sheetId: currentRowValues.sheetId,
        sheetType,
        sheetIndex: currentRowValues.sheetIndex,
      };

      if (isSheetTypeValidated(sheetType)) {
        setPendingMapping({
          index: -1,
          mapping: newMapping,
          sheetRow,
        });
        setConfirmationOpen(true);
        return;
      }

      addMapping(newMapping);
      return;
    }

    const newMapping: SheetMapping = {
      fileId: currentRowValues.fileId,
      sheetId: currentRowValues.sheetId,
      sheetType,
      sheetIndex: currentRowValues.sheetIndex,
    };

    if (
      isSheetTypeValidated(sheetType) &&
      (existingMappingIndex === undefined ||
        mappings[existingMappingIndex]?.sheetType !== sheetType)
    ) {
      setPendingMapping({
        index: existingMappingIndex ?? -1,
        mapping: newMapping,
        sheetRow,
      });
      setConfirmationOpen(true);
      return;
    }

    // If this sheet already has a mapping, update it
    if (existingMappingIndex !== undefined) {
      updateMapping(existingMappingIndex, newMapping);
    } else {
      // Otherwise, add a new mapping
      addMapping(newMapping);
    }
  };

  const handleConfirmValidatedType = (confirmed: boolean) => {
    setConfirmationOpen(false);

    if (confirmed && pendingMapping) {
      if (pendingMapping.index >= 0) {
        updateMapping(pendingMapping.index, pendingMapping.mapping);
      } else {
        addMapping(pendingMapping.mapping);
      }
    }

    setPendingMapping(null);
  };

  const handleRemoveMapping = (index: number) => {
    setPendingDeleteIndex(index);
    setDeleteConfirmationOpen(true);
  };

  const confirmRemoveMapping = () => {
    if (pendingDeleteIndex !== null) {
      removeMapping(pendingDeleteIndex);
      setPendingDeleteIndex(null);
    }
    setDeleteConfirmationOpen(false);
  };

  const handleClearMapping = (sheetRow: SheetRow, rowIndex: number) => {
    if (sheetRow.mappingIndex !== undefined) {
      removeMapping(sheetRow.mappingIndex);
    }
    // Clear empty row selection if it's an empty row
    if (sheetRow.isEmpty) {
      const newSelections = { ...emptyRowSelections };
      delete newSelections[rowIndex];
      setEmptyRowSelections(newSelections);
    }
  };

  // Get available sheets for a selected file
  const getAvailableSheetsForFile = (fileId: string) => {
    const file = uploadedFiles.find((f) => f.id === fileId);
    return file ? file.sheets : [];
  };

  if (uploadedFiles.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Sheet Mappings</h3>
        </div>

        <div className="text-center p-6 border rounded-md text-muted-foreground">
          <p>No files available. Please upload files first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Sheet Mappings</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {getAssignedDataTypesCount()} of {sheetTypes.length} data types
            assigned
          </span>
        </div>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Source File</TableHead>
              <TableHead className="w-[30%]">Sheet in File</TableHead>
              <TableHead className="w-[30%]">Data Type</TableHead>
              <TableHead className="w-[10%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allSheetRows.map((sheetRow, rowIndex) => {
              const hasMapping = sheetRow.mappingIndex !== undefined;
              const currentSheetType = getCurrentSheetType(sheetRow);
              const currentRowValues = getCurrentRowValues(sheetRow, rowIndex);
              const availableSheetsForFile = getAvailableSheetsForFile(
                currentRowValues.fileId
              );

              return (
                <TableRow
                  key={`${sheetRow.fileId}-${sheetRow.sheetId}-${rowIndex}`}
                >
                  {/* Source File Column */}
                  <TableCell>
                    <Select
                      value={currentRowValues.fileId || ""}
                      onValueChange={(value) =>
                        handleSourceFileChange(sheetRow, rowIndex, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source file">
                          {currentRowValues.fileName || "Select source file"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {currentRowValues.fileId && (
                          <SelectItem value={CLEAR_SELECTION_VALUE}>
                            <span className="text-muted-foreground">
                              Clear selection
                            </span>
                          </SelectItem>
                        )}
                        {uploadedFiles.map((file) => (
                          <SelectItem key={file.id} value={file.id}>
                            {file.file_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Sheet in File Column */}
                  <TableCell>
                    <Select
                      value={currentRowValues.sheetId || ""}
                      onValueChange={(value) =>
                        handleSheetChange(sheetRow, rowIndex, value)
                      }
                      disabled={!currentRowValues.fileId}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            currentRowValues.fileId
                              ? "Select sheet"
                              : "Select file first"
                          }
                        >
                          {currentRowValues.sheetName ||
                            (currentRowValues.fileId
                              ? "Select sheet"
                              : "Select file first")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {currentRowValues.sheetId && (
                          <SelectItem value={CLEAR_SELECTION_VALUE}>
                            <span className="text-muted-foreground">
                              Clear selection
                            </span>
                          </SelectItem>
                        )}
                        {availableSheetsForFile.map((sheet) => (
                          <SelectItem key={sheet.id} value={sheet.id}>
                            {sheet.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Data Type Column */}
                  <TableCell>
                    <Select
                      value={currentSheetType || ""}
                      onValueChange={(value) =>
                        handleSheetTypeChange(sheetRow, rowIndex, value)
                      }
                      disabled={
                        !currentRowValues.fileId || !currentRowValues.sheetId
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !currentRowValues.fileId ||
                            !currentRowValues.sheetId
                              ? "Select file and sheet first"
                              : "Select data type"
                          }
                        >
                          {currentSheetType ? (
                            <div className="flex items-center gap-2">
                              <span>
                                {
                                  sheetTypes.find(
                                    (type) => type.name === currentSheetType
                                  )?.name
                                }
                              </span>
                              {isSheetTypeValidated(currentSheetType) && (
                                <MdVerified
                                  className="text-green-800"
                                  title="Previously validated"
                                />
                              )}
                            </div>
                          ) : !currentRowValues.fileId ||
                            !currentRowValues.sheetId ? (
                            "Select file and sheet first"
                          ) : (
                            "Select data type"
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {currentSheetType && (
                          <SelectItem value={CLEAR_SELECTION_VALUE}>
                            <span className="text-muted-foreground">
                              Clear selection
                            </span>
                          </SelectItem>
                        )}
                        {getAvailableSheetTypes(
                          sheetRow.mappingIndex ?? -1
                        ).map((type) => (
                          <SelectItem key={type.name} value={type.name}>
                            <div className="flex items-center gap-2">
                              <span>{type.name}</span>
                              {type.isValidated && (
                                <MdVerified
                                  className="text-green-800"
                                  title="Previously validated"
                                />
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {(hasMapping ||
                        currentRowValues.fileId ||
                        currentRowValues.sheetId ||
                        currentSheetType) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleClearMapping(sheetRow, rowIndex)}
                          title="Clear mapping"
                        >
                          <X className="h-4 w-4" />
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

      {/* Keep form fields in sync - FIXED VERSION */}
      {mappings.map((mapping, index) => (
        <div key={`form-sync-${index}`} style={{ display: "none" }}>
          <FormField
            control={form.control}
            name={`mappings.${index}.fileId`}
            render={({ field }) => (
              <Input {...field} value={field.value || ""} />
            )}
          />
          <FormField
            control={form.control}
            name={`mappings.${index}.sheetId`}
            render={({ field }) => (
              <Input {...field} value={field.value || ""} />
            )}
          />
          <FormField
            control={form.control}
            name={`mappings.${index}.sheetType`}
            render={({ field }) => (
              <Input {...field} value={field.value || ""} />
            )}
          />
        </div>
      ))}

      {/* Alert Dialog for validation confirmation */}
      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Validated Mapping?</AlertDialogTitle>
            <AlertDialogDescription>
              This sheet type has been mapped and validated previously. Do you
              want to update this file mapping?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => handleConfirmValidatedType(false)}
            >
              No, cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleConfirmValidatedType(true)}>
              Yes, update mapping
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog for delete confirmation */}
      <AlertDialog
        open={deleteConfirmationOpen}
        onOpenChange={setDeleteConfirmationOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Mapping?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this mapping?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmationOpen(false)}>
              No, cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveMapping}>
              Yes, remove mapping
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
