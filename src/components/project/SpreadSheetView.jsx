import { useState, useEffect, useMemo, useRef } from 'react';
import { FiDownload, FiTrash2, FiInfo, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiSearch } from 'react-icons/fi';
import { LuFileSpreadsheet } from "react-icons/lu";
import { IoMdCheckmark } from "react-icons/io";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/virtualised-data-table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams } from 'next/navigation';

const SpreadsheetView = ({ data, title }) => {
  const searchParams = useSearchParams();
  const tableContainerRef = useRef(null);
  
  // Get pagination params from URL or use defaults
  const defaultPageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const defaultPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(data?.rows);
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [tableHeight, setTableHeight] = useState('500px');
  
  const pageSizeOptions = [10, 20, 30, 50, 100];

  // Recalculate table height when window resizes or container changes
  useEffect(() => {
    const calculateTableHeight = () => {
      if (!tableContainerRef.current) return;
      
      // Get the actual height of the table container
      const containerHeight = tableContainerRef.current.clientHeight;
      
      // Set a minimum height to ensure the table is always visible
      const height = Math.max(containerHeight, 200);
      setTableHeight(`${height}px`);
    };

    // Initial calculation
    calculateTableHeight();
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateTableHeight);
    
    // Use ResizeObserver to watch container size changes
    const resizeObserver = new ResizeObserver(calculateTableHeight);
    if (tableContainerRef.current) {
      resizeObserver.observe(tableContainerRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', calculateTableHeight);
      resizeObserver.disconnect();
    };
  }, []);

  // Filter data based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data?.rows);
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = data?.rows.filter(row => 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchLower)
      )
    );
    
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, data?.rows]);

  // Update URL with pagination parameters
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', currentPage.toString());
    url.searchParams.set('pageSize', pageSize.toString());
    window.history.replaceState({}, '', url);
  }, [currentPage, pageSize]);

  // Pagination calculations
  const totalItems = filteredData?.length || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentData = useMemo(() => 
    filteredData?.slice(startIndex, endIndex) || [],
  [filteredData, startIndex, endIndex]);

  // Style maps for status badges
  const fileStatusBadgeStyles = new Map([
    ["validated", { icon: IoMdCheckmark, styles: "text-green-900 bg-green-100" }],
    ["pending",   { icon: FiInfo, styles: "text-gray-800 bg-gray-100" }],
    ["error",     { icon: FiInfo, styles: "text-red-800 bg-red-100" }],
  ]);

  // Create column definitions for react-table
  const columnHelper = createColumnHelper();
  
  const columns = useMemo(() => {
    if (!data?.columns) return [];
    
    return data.columns.map(col => 
      columnHelper.accessor(col.key, {
        header: col.name,
        cell: info => <div className="truncate">{info.getValue()}</div>,
        size: col.width,
      })
    );
  }, [data?.columns]);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  const handlePageSizeChange = (value) => {
    const newPageSize = parseInt(value, 10);
    setPageSize(newPageSize);
    // Adjust current page to maintain visible data as much as possible
    const newTotalPages = Math.ceil(totalItems / newPageSize);
    setCurrentPage(Math.min(currentPage, newTotalPages));
  };

  return (
    <div className="h-full max-md:h-[95%]  flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col p-4 border-b">
        <div className="flex justify-between items-center">
          <div className='flex items-center justify-center gap-2'>
            <LuFileSpreadsheet size={20} className='text-gray-400'/>
            <div className="flex flex-col items-start justify-center">
              <h2 className='text-[14px] font-medium'>{title}</h2>
              {(() => {
                const badge = fileStatusBadgeStyles.get(data?.status) || { icon: IoMdCheckmark, styles: "text-green-500 bg-green-100" };
                const Icon = badge.icon;
                return (
                  <span className={`${badge.styles} text-[10px] capitalize rounded-full px-2 py-[2px] flex items-center gap-1`}>
                    <Icon size={12} />
                    <span>{data?.status}</span>
                  </span>
                );
              })()}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
              <FiDownload size={14} />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100">
              <FiTrash2 size={14} />
            </button>
          </div>
        </div>
        <p className='flex flex-wrap gap-2 text-[10px] text-gray-500 font-medium mt-2'>
            <span>Last Modified: {data?.lastModified}</span>
            <span>Size: {data?.size}</span>
            <span>Records: {data?.records}</span>
        </p>
      </div>

      {/* Search and Title Section */}
      <div className="p-2">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Sheet Data</h1>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className="text-gray-500  text-sm">
            Showing {startIndex + 1}-{endIndex} of {totalItems} records
          </p>
          
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="search"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-2 text-sm"
            />
          </div>
        </div>
      </div>
      
      {/* Table Container with fixed explicit height */}
      <div 
        ref={tableContainerRef} 
        className="flex-1"
        style={{ height: "calc(100% - 200px)", minHeight: "300px" }}
      >
        {filteredData && columns.length > 0 ? (
          <DataTable
            columns={columns}
            data={currentData}
            height={tableHeight}
            className="w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No data available</p>
          </div>
        )}
      </div>
      
      {/* Pagination Footer */}
      <div className="px-4 max-md:px-2 py-3 border-t mt-auto">
        <div className="flex flex-wrap sm:flex-row justify-between items-center gap-3">
          {/* Rows per page selector */}
          <div className="flex items-center gap-2 max-md:gap-1">
            <span className="text-xs max-md:hidden text-gray-500">Rows per page:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-fit">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(option => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Pagination controls */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <FiChevronsLeft className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 "
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FiChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="px-4 text-sm">
              Page {currentPage} of {totalPages || 1}
            </span>
            
            <Button 
              variant="ghost"
              className="h-8 w-8 p-0 "
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <FiChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetView;
