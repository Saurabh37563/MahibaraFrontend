import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { FiDownload, FiInfo, FiRefreshCw, FiTrash2, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiSearch } from 'react-icons/fi';
import { IoIosSearch, IoMdCheckmark } from 'react-icons/io';
import { LuFileDown, LuFileSpreadsheet } from 'react-icons/lu';
import { IoWarningOutline } from "react-icons/io5";
import { RiBarChartLine } from "react-icons/ri";
import { FaSearch } from 'react-icons/fa';
import { useEffect, useState, useMemo, useRef } from 'react';
import { BsGear } from "react-icons/bs";
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
import AnalysisSettings from './analysisSettings/AnalysisSettings';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AnalysisView = ({ data, title }) => {
  const tableContainerRef = useRef(null);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableHeight, setTableHeight] = useState('500px');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageSizeOptions = [10, 20, 30, 50, 100];

  // Style mapping for status badges
  const getAnalysisStatus = new Map([
    ["completed", { icon: IoMdCheckmark, styles: "text-green-900 bg-green-100" }],
    ["running", { icon: IoMdCheckmark, styles: "text-blue-900 bg-blue-100" }],
    ["pending", { icon: FiInfo, styles: "text-gray-800 bg-gray-100" }],
    ["error", { icon: FiInfo, styles: "text-red-800 bg-red-100" }],
    ["deleted", { icon: FiInfo, styles: "text-red-800 bg-red-100" }],
  ]);

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

  // Generate sample data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Generate more dummy data for testing
        const generatedData = Array(100).fill(0).map((_, index) => {
          const randomValue = Math.floor(10000 + Math.random() * 990000);
          const percentage = Math.floor(1 + Math.random() * 99);
          return {
            name: `Company ${index + 1}`,
            value: `$${randomValue.toLocaleString()}`,
            percentage: `${percentage}%`,
            growth: (Math.random() > 0.5 ? '+' : '-') + (Math.random() * 20).toFixed(2) + '%',
            impact: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
          };
        });
        
        // Add the original sample data at the beginning for recognition
        const sampleData = [
          { name: 'ABC Corp', value: '$125,432', percentage: '34%', growth: '+12.3%', impact: 'High' },
          { name: 'XYZ Ltd', value: '$98,765', percentage: '27%', growth: '+8.7%', impact: 'High' },
          { name: 'Global Solutions', value: '$67,890', percentage: '19%', growth: '-3.2%', impact: 'Medium' },
          { name: 'Tech Innovations', value: '$45,678', percentage: '12%', growth: '+5.9%', impact: 'Low' },
          { name: 'Others', value: '$29,876', percentage: '8%', growth: '-1.4%', impact: 'Low' },
        ];
        
        const allData = [...sampleData, ...generatedData];
        setTableData(allData);
        setFilteredData(allData);
      } catch(error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(tableData);
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = tableData.filter(row => 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchLower)
      )
    );
    
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, tableData]);

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

  // Create column definitions for DataTable
  const columnHelper = createColumnHelper();
  
  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'COMPANY NAME',
      cell: info => <div className="truncate font-medium">{info.getValue()}</div>,
      size: 200,
    }),
    columnHelper.accessor('value', {
      header: 'VALUE',
      cell: info => <div className="truncate text-right">{info.getValue()}</div>,
      size: 120,
    }),
    columnHelper.accessor('percentage', {
      header: 'PERCENTAGE',
      cell: info => <div className="truncate text-right">{info.getValue()}</div>,
      size: 120,
    }),
    columnHelper.accessor('growth', {
      header: 'GROWTH',
      cell: info => {
        const value = info.getValue();
        const isPositive = value.startsWith('+');
        return (
          <div className={`truncate text-right ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {value}
          </div>
        );
      },
      size: 120,
    }),
    columnHelper.accessor('impact', {
      header: 'IMPACT',
      cell: info => {
        const value = info.getValue();
        const colorMap = {
          'High': 'bg-red-100 text-red-800',
          'Medium': 'bg-yellow-100 text-yellow-800',
          'Low': 'bg-green-100 text-green-800'
        };
        return (
          <div className="flex justify-end">
            <span className={`text-xs px-2 py-1 rounded-full ${colorMap[value]}`}>
              {value}
            </span>
          </div>
        );
      },
      size: 120,
    }),
  ], []);

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
    <div className="h-full max-md:h-[95%] w-full flex">
  
        <div className="h-full w-full px-4 py-0 flex flex-col">
          {/* Header - fixed height */}
          <div className="flex-none justify-between items-center border-b py-4">
            <div className='flex flex-col w-full'>
              <div className='flex items-center justify-between mb-2 w-full'>
                <h2 className="font-semibold">{title}</h2>
                <AnalysisSettings />
              </div>
              <div className='flex text-[10px] font-medium items-center gap-2'>
                <div>
                  {(() => {
                    const badge = getAnalysisStatus.get(data?.status) || { icon: IoMdCheckmark, styles: "text-green-500 bg-green-100" };
                    const Icon = badge.icon;

                    return (
                      <span className={`${badge.styles} text-[10px] capitalize rounded-full px-2 py-[2px] flex items-center gap-1`}>
                        <Icon size={12} />
                        <span>{data?.status}</span>
                      </span>
                    );
                  })()}                  
                </div>
                <div>
                  Threshold: {data?.threshold}
                </div>
                <div>
                  Date Range: {data?.dateRange}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons - fixed height */}
          <div className="flex-none rounded-md overflow-hidden my-4">
            <div className='flex gap-2 px-2'> 
              <button className='flex gap-1 bg-emerald-800/10 text-green-800 rounded-md items-center px-2 py-1'>
                <FaSearch size={12}/> <span className='text-[12px] font-medium'>View Sample</span>
              </button>
              <button className='flex gap-1 bg-gray-100 text-gray-800 rounded-md items-center px-2 py-1'>
                <LuFileSpreadsheet size={12}/> <span className='text-[12px] font-medium'>Export Data</span>
              </button>
            </div>
          </div>
          
          {/* Main content - takes remaining height */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search and title - fixed height */}
            <div className="flex-none p-2">
              <h1 className="text-xl font-semibold text-gray-800 mb-2">Result Data</h1>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <p className="text-gray-500 text-sm">
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
            
            {/* Table Container - takes remaining height */}
            <div 
              ref={tableContainerRef}
              className="flex-1  max-md:h-[90%] min-h-0 my-auto border rounded-md"
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <FiRefreshCw className="animate-spin h-6 w-6 text-gray-400" />
                </div>
              ) : filteredData && filteredData.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={currentData}
                  height={tableHeight}
                  className="w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500 flex flex-col items-center">
                    <IoWarningOutline className="h-6 w-6 mb-2" />
                    <p>No data available</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Pagination Footer - fixed height */}
            <div className="flex-none px-4 max-md:px-2 py-3 border-t">
              <div className="flex flex-wrap sm:flex-row justify-between items-center gap-3">
                {/* Rows per page selector */}
                <div className="flex items-center gap-2">
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
                    className="h-8 w-8 p-0 ml-1"
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
                    className="h-8 w-8 p-0 mr-1"
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
        </div>

    </div>
  );
};

export default AnalysisView;