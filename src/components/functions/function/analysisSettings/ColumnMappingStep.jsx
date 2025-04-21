import { useState, useEffect } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { PiMagicWand } from "react-icons/pi";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ColumnMappingStep({ sourceColumns = [], targetColumns = [], mapping = {}, onChange }) {
  // Initialize state only once from props
  const [columnMapping, setColumnMapping] = useState({ ...mapping });
  const [unmappedRequired, setUnmappedRequired] = useState([]);
  
  // Find required target columns
  const requiredTargetColumns = targetColumns.filter(col => col.required);
  
  // Update unmapped required columns when mapping changes
  useEffect(() => {
    const unmapped = requiredTargetColumns
      .filter(col => !Object.values(columnMapping).includes(col.id))
      .map(col => col.id);
    
    setUnmappedRequired(unmapped);
  }, [columnMapping, requiredTargetColumns]);

  // Sync internal state with external mapping when props change
  useEffect(() => {
    // Only update internal state if the mapping prop is different
    if (JSON.stringify(mapping) !== JSON.stringify(columnMapping)) {
      setColumnMapping({ ...mapping });
    }
  }, [mapping]);
  
  // Handle column mapping changes
  const handleColumnMappingChange = (sourceColumnId, targetColumnId) => {
    const updatedMapping = { ...columnMapping };
    
    if (!targetColumnId) {
      delete updatedMapping[sourceColumnId];
    } else {
      updatedMapping[sourceColumnId] = targetColumnId;
    }
    
    setColumnMapping(updatedMapping);
    onChange(updatedMapping);
  };
  
  // Clear mapping for a source column
  const clearMapping = (sourceColumnId) => {
    const updatedMapping = { ...columnMapping };
    delete updatedMapping[sourceColumnId];
    setColumnMapping(updatedMapping);
    onChange(updatedMapping);
  };
  
  // Get list of already mapped target columns
  const usedTargetColumns = Object.values(columnMapping);
  
  return (
    <div className="space-y-6">
      <div className="text-sm flex justify-between">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-2">Column Mapping</h2>
          <p> Verify the suggested mappings and adjust if needed</p>
        </div>
        <p className="flex items-center gap-2">
          <span> 5 of 5 columns mapped</span>
          <Button className=" bg-green-800/10 hover:bg-green-800/20 text-green-800"><PiMagicWand/> Re-Map All</Button>
        </p>
      </div>

      <div className="h-2 w-full  bg-green-900 rounded-full">
        
      </div>
      
      {unmappedRequired.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-800">
            There are {unmappedRequired.length} required target columns that haven't been mapped yet:
            <div className="flex flex-wrap gap-1 mt-2">
              {unmappedRequired.map(colId => {
                const col = targetColumns.find(c => c.id === colId);
                return (
                  <Badge key={colId} variant="outline" className="border-amber-300 bg-amber-100 text-amber-800">
                    {col?.name || colId}
                  </Badge>
                );
              })}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Table>
        
        <TableBody>
          {sourceColumns.map((sourceColumn) => {
            const mappedTargetId = columnMapping[sourceColumn.id] || "";
            const mappedTarget = targetColumns.find(col => col.id === mappedTargetId);
            
            return (
              <TableRow key={sourceColumn.id} className="">
                <TableCell className="font-medium">
                  <div className="flex gap-1 items-center">
                    <span className="text-[16px]">
                      {sourceColumn.name}
                    </span>
                    {sourceColumn?.required && (<Badge className="text-xs rounded-full bg-yellow-500/10 text-amber-700">Required</Badge>)}
                  </div>
                  {sourceColumn.summary && (
                    <div className=" text-gray-500 mt-1 truncate max-w-[200px]">
                     {sourceColumn.summary}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <select
                    value={mappedTargetId}
                    onChange={(e) => onValueChange(e.target.value)}
                    className="w-full"
                  >
                    <option value="" disabled>
                      Select a target column
                    </option>
                    {targetColumns.map((targetColumn) => {
                      const isUsed = usedTargetColumns.includes(targetColumn.id) && mappedTargetId !== targetColumn.id;
                      return (
                        <option
                          key={targetColumn.id}
                          value={targetColumn.id}
                          disabled={isUsed}
                          className={isUsed ? 'opacity-50' : ''}
                        >
                          {targetColumn.name}
                          {targetColumn.required && <div className="ml-1 text-red-500">*</div>}
                        </option>
                      );
                    })}
                  </select>
                </TableCell>
                
               
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {sourceColumns.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No source columns available for mapping
        </div>
      )}
      
      <div className="text-sm text-gray-500 flex items-center gap-1">
        <span className="text-red-500">*</span> Indicates required target columns
      </div>
    </div>
  );
}