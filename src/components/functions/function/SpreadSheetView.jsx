import { useState, useCallback, useRef, useEffect } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FiDownload, FiFilter, FiSearch, FiShare2, FiTrash2 } from 'react-icons/fi';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { LuFileSpreadsheet } from "react-icons/lu";
import { IoMdCheckmark } from "react-icons/io";
import { FiInfo } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import { LuFileDown } from "react-icons/lu";
import { FaRegTrashAlt } from "react-icons/fa";

const SpreadsheetView = ({ data, title }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(data?.rows);
  const headerRef = useRef(null);
  const containerRef = useRef(null);
  const gridRef = useRef(null);
  const outerRef = useRef(null);
  
  // Calculate total width of all columns
  const totalWidth = data?.columns?.reduce((sum, col) => sum + col.width, 0) || 0;
  
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
  }, [searchTerm, data?.rows]);

  // Sync header scroll with grid scroll
  const handleScroll = useCallback(({ scrollLeft }) => {
    if (headerRef.current) {
      headerRef.current.scrollLeft = scrollLeft;
    }
  }, []);

  const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
    const column = data.columns[columnIndex];
    const row = filteredData[rowIndex];
    
    if (!row) return null;
    
    const value = row[column.key];
    
    return (
      <div 
        style={{
          ...style,
          borderBottom: '1px solid #eaeaea',
          borderRight: columnIndex < data.columns.length - 1 ? '1px solid #eaeaea' : 'none',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
        className="text-sm text-gray-700"
      >
        {value}
      </div>
    );
  }, [data?.columns, filteredData]);

  const fileStatusBadgeStyles = new Map([
    ["validated", { icon: IoMdCheckmark, styles: "text-green-900 bg-green-100" }],
    ["pending",   { icon: FiInfo, styles: "text-gray-800 bg-gray-100" }],
    ["error",     { icon: FiInfo, styles: "text-red-800 bg-red-100" }],
  ]);
  
  const renderHeader = () => {
    return (
      <div className="overflow-hidden border-b">
        <div
          ref={headerRef}
          className="flex bg-gray-50 sticky top-0 z-10 overflow-x-auto"
          style={{ 
            minWidth: totalWidth,
            width: '100%'
          }}
        >
          {data?.columns?.map((column, index) => (
            <div
              key={column.key}
              className="flex items-center justify-between font-medium text-xs text-gray-500 uppercase tracking-wider px-3 py-3 shrink-0"
              style={{ 
                width: column.width,
                minWidth: column.width,
                borderRight: index < data.columns.length - 1 ? '1px solid #eaeaea' : 'none'
              }}
            >
              <span>{column.name}</span>
              <MdOutlineKeyboardArrowDown size={14} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col" ref={containerRef}>
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
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100">
              <FiShare2 size={14} />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100">
              <FiTrash2 size={14} />
            </button>
          </div>
        </div>
        <p className='flex gap-2 text-[10px] text-gray-500 font-medium mt-2'>
            <span>Last Modified: {data?.lastModified}</span>
            <span>Size: {data?.size}</span>
            <span>Records: {data?.records}</span>
        </p>
      </div>

      {/* Analytics */}
      <div className="flex flex-col p-4 border-b">
        <div className='rounded-lg w-full p-4'>
          <div className='flex border rounded-lg bg-gray-50 border-b p-2 items-center justify-between'>
            <div className='flex items-center gap-1 text-xs font-medium'>
              <FiInfo size={16} /> Data Quality Insights
            </div>
            <div className='flex items-center gap-2 text-xs font-medium'>
              <IoIosSearch size={14} /> 
              <LuFileDown size={12} /> 
              <FiTrash2 className="text-red-600" size={12} /> 
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border rounded-lg m-4 flex-1 flex flex-col overflow-hidden">
          {renderHeader()}
          
          <div className="flex-1 overflow-hidden">
            <AutoSizer>
              {({ height, width }) => (
                <Grid
                  ref={gridRef}
                  columnCount={data.columns.length}
                  columnWidth={index => data.columns[index].width}
                  height={height}
                  rowCount={filteredData?.length || 0}
                  rowHeight={() => 40}
                  width={width}
                  overscanRowCount={5}
                  overscanColumnCount={2}
                  className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                  onScroll={handleScroll}
                  outerRef={outerRef}
                  style={{overflow: 'auto'}}
                >
                  {Cell}
                </Grid>
              )}
            </AutoSizer>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-2 border-t text-xs text-gray-500">
        Showing {filteredData?.length} of {data?.rows?.length} rows
      </div>
    </div>
  );
};

export default SpreadsheetView;