"use client";

import { useState, useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Plus, Trash2, FileSpreadsheet, File } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { StandardSheet, UploadedFile, FormValues } from "@/types/project-types";

// Dummy data for demonstration
const DUMMY_DATA = {
  standardSheets: [
    { id: "invoice", name: "Invoice" },
    { id: "balance_sheet", name: "Balance Sheet" },
    { id: "income_statement", name: "Income Statement" },
    { id: "cash_flow", name: "Cash Flow Statement" },
    { id: "trial_balance", name: "Trial Balance" },
  ],
  uploadedFiles: [
    { 
      id: "file1", 
      name: "Q1 2023 Financial Reports.xlsx", 
      sheets: ["Sheet1", "Income", "Balance", "Cash Flow"] 
    },
    { 
      id: "file2", 
      name: "Q2 2023 Reports.xlsx", 
      sheets: ["Summary", "Income Statement", "Balance Sheet"] 
    },
    { 
      id: "file3", 
      name: "Annual Report 2022.xlsx", 
      sheets: ["Cover", "Income", "Balance", "Cash Flow", "Notes"] 
    }
  ]
};

interface SheetMapperProps {
  form: UseFormReturn<FormValues>
}

export function SheetMapper({ form }: SheetMapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [standardSheets, setStandardSheets] = useState<StandardSheet[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setStandardSheets(DUMMY_DATA.standardSheets);
      setUploadedFiles(DUMMY_DATA.uploadedFiles);
      form.setValue('mappings', []);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [form]);
  
  const addMappingRow = () => {
    const currentMappings = form.getValues('mappings') || [];
    form.setValue('mappings', [
      ...currentMappings, 
      { standardSheetId: '', fileId: '', sheetName: '' }
    ]);
  };
  
  const removeMappingRow = (index: number) => {
    const currentMappings = form.getValues('mappings') || [];
    const updatedMappings = currentMappings.filter((_, i) => i !== index);
    form.setValue('mappings', updatedMappings);
  };
  
  const mappings = form.watch('mappings') || [];
  
  if (isLoading) {
    return <div className="py-4 text-center">Loading sheet mapping configuration...</div>;
  }

  // Mobile layout with cards
  const MobileLayout = () => (
    <div className="space-y-3 px-0 ">
      <ScrollArea className="h-[calc(100vh-300px)] sm:h-[350px] ">
        <div className="space-y-3 ">
          {mappings.map((_, index) => (
            <Card key={index} className="relative px-0">
              <CardContent className="pt-6 px-0 p-2">
                <div className="absolute top-2 right-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMappingRow(index)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Remove mapping</span>
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <FormField
                      control={form.control}
                      name={`mappings.${index}.standardSheetId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">SHEET NAME</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full h-8 text-xs">
                                <div className="flex items-center gap-2 truncate">
                                  <Database className="h-3 w-3 flex-shrink-0" />
                                  <SelectValue placeholder="Select sheet name" />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                {standardSheets.map((sheet) => (
                                  <SelectItem key={sheet.id} value={sheet.id} className="text-xs">
                                    <span className="truncate block">{sheet.name}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <FormField
                      control={form.control}
                      name={`mappings.${index}.fileId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">SOURCE FILE</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue(`mappings.${index}.sheetName`, "");
                              }}
                            >
                              <SelectTrigger className="w-full h-8 text-xs">
                                <div className="flex items-center gap-2 truncate">
                                  <File className="h-3 w-3 flex-shrink-0" />
                                  <SelectValue placeholder="Select file" />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                {uploadedFiles.map((file) => (
                                  <SelectItem key={file.id} value={file.id} className="text-xs">
                                    <span className="truncate block">{file.name}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <FormField
                      control={form.control}
                      name={`mappings.${index}.sheetName`}
                      render={({ field }) => {
                        const selectedFileId = form.watch(`mappings.${index}.fileId`);
                        const selectedFile = uploadedFiles.find((file) => file.id === selectedFileId);
                        const availableSheets = selectedFile?.sheets || [];

                        return (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">SHEET TYPE</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={!selectedFileId || availableSheets.length === 0}
                              >
                                <SelectTrigger className="w-full h-8 text-xs">
                                  <div className="flex items-center gap-2 truncate">
                                    <FileSpreadsheet className="h-3 w-3 flex-shrink-0" />
                                    <SelectValue placeholder="Select sheet" />
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  {availableSheets.map((sheet: string) => (
                                    <SelectItem key={sheet} value={sheet} className="text-xs">
                                      <span className="truncate block">{sheet}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {mappings.length === 0 && (
            <div className="py-6 text-center border rounded-md text-muted-foreground text-sm">
              No mappings added. Click "Add Mapping" to begin.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // Desktop layout with table
  const DesktopLayout = () => (
    <div className="rounded-md border">
      <ScrollArea className="h-[350px]">
        <div className="min-w-[600px]">
          <table className="w-full caption-bottom text-sm">
            <thead className="sticky top-0 bg-background z-10">
              <tr className="border-b bg-muted/50">
                <th className="h-9 px-3 text-left align-middle font-medium text-muted-foreground w-1/3">
                  SHEET TYPE
                </th>
                <th className="h-9 px-3 text-left align-middle font-medium text-muted-foreground w-1/3">
                  SOURCE FILE
                </th>
                <th className="h-9 px-3 text-left align-middle font-medium text-muted-foreground w-1/3">
                  SHEET NAME
                </th>
                <th className="h-9 w-10 px-1 text-center align-middle font-medium text-muted-foreground">
                  
                </th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((_, index) => (
                <tr
                  key={index}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-2 align-middle">
                    <FormField
                      control={form.control}
                      name={`mappings.${index}.standardSheetId`}
                      render={({ field }) => (
                        <FormItem className="m-0">
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="h-8 w-full text-xs">
                                <div className="flex items-center gap-2 truncate">
                                  <Database className="h-3 w-3 flex-shrink-0" />
                                  <SelectValue placeholder="Select sheet name" />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                {standardSheets.map((sheet) => (
                                  <SelectItem key={sheet.id} value={sheet.id} className="text-xs">
                                    <span className="truncate block">{sheet.name}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </td>
                  
                  <td className="p-2 align-middle">
                    <FormField
                      control={form.control}
                      name={`mappings.${index}.fileId`}
                      render={({ field }) => (
                        <FormItem className="m-0">
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue(`mappings.${index}.sheetName`, "");
                              }}
                            >
                              <SelectTrigger className="h-8 w-full text-xs">
                                <div className="flex items-center gap-2 truncate">
                                  <File className="h-3 w-3 flex-shrink-0" />
                                  <SelectValue placeholder="Select file" />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                {uploadedFiles.map((file) => (
                                  <SelectItem key={file.id} value={file.id} className="text-xs">
                                    <span className="truncate block">{file.name}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </td>
                  
                  <td className="p-2 align-middle">
                    <FormField
                      control={form.control}
                      name={`mappings.${index}.sheetName`}
                      render={({ field }) => {
                        const selectedFileId = form.watch(`mappings.${index}.fileId`);
                        const selectedFile = uploadedFiles.find((file) => file.id === selectedFileId);
                        const availableSheets = selectedFile?.sheets || [];

                        return (
                          <FormItem className="m-0">
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={!selectedFileId || availableSheets.length === 0}
                              >
                                <SelectTrigger className="h-8 w-full text-xs">
                                  <div className="flex items-center gap-2 truncate">
                                    <FileSpreadsheet className="h-3 w-3 flex-shrink-0" />
                                    <SelectValue placeholder="Select sheet" />
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  {availableSheets.map((sheet: string) => (
                                    <SelectItem key={sheet} value={sheet} className="text-xs">
                                      <span className="truncate block">{sheet}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        );
                      }}
                    />
                  </td>
                  
                  <td className="p-1 align-middle text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMappingRow(index)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Remove mapping</span>
                    </Button>
                  </td>
                </tr>
              ))}
              {mappings.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground">
                    No mappings added. Click "Add Mapping" to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <Label className="font-normal text-xs text-muted-foreground">
          Configure your sheets below by adding each mapping you need
        </Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addMappingRow}
          className="flex items-center gap-1 h-7 text-xs"
        >
          <Plus className="h-3 w-3" />
          Add Mapping
        </Button>
      </div>
      
      {/* Mobile layout (hidden on md and larger screens) */}
      <div className="md:hidden ">
        <MobileLayout />
      </div>
      
      {/* Desktop layout (hidden on smaller than md screens) */}
      <div className="hidden md:block">
        <DesktopLayout />
      </div>
      
      {/* Status preview (optional - only for development) */}
      {/* 
      <div className="mt-4 p-3 border rounded-md bg-muted/30">
        <h3 className="text-xs font-medium mb-1">Current Mappings:</h3>
        <ScrollArea className="h-[80px]">
          <pre className="text-[10px]">
            {JSON.stringify(mappings, null, 2)}
          </pre>
        </ScrollArea>
      </div>
      */}
    </div>
  );
}