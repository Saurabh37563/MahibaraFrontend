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
  import { FiDownload, FiInfo, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { IoIosSearch, IoMdCheckmark } from 'react-icons/io';
import { LuFileDown, LuFileSpreadsheet } from 'react-icons/lu';
import {List as VirtualizedList}  from 'react-virtualized';
import { IoWarningOutline } from "react-icons/io5";
import { RiBarChartLine } from "react-icons/ri";
import { FaSearch } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { BsGear } from "react-icons/bs";
import { VariableSizeGrid as Grid } from 'react-window';
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
    const [tableData, setTableData] = useState([])
    const [loading, setLoading] = useState(false)
    const [isConfigOpen,  setIsConfigOpen] = useState(false)
  
    // Row renderer for virtualized list
    const rowRenderer = ({ index, key, style }) => {
      const item = tableData[index];
      return (
        <div key={key} style={style} className="flex items-center border-b border-gray-100 py-2 px-4">
          <div className="flex-1 font-medium text-sm">{item.name}</div>
          <div className="w-1/4 text-right text-sm">{item.value}</div>
          <div className="w-1/4 text-right text-sm">{item.percentage}</div>
        </div>
      );
    };

      const getAnalysisStatus = new Map([
        ["completed", { icon: IoMdCheckmark, styles: "text-green-900 bg-green-100" }],
        ["running", { icon: IoMdCheckmark, styles: "text-blue-900 bg-blue-100" }],
        ["pending",   { icon: FiInfo, styles: "text-gray-800 bg-gray-100" }],
        ["error",     { icon: FiInfo, styles: "text-red-800 bg-red-100" }],
        ["deleted",     { icon: FiInfo, styles: "text-red-800 bg-red-100" }],
      ]);
      
      // Cell renderer function :
      const Cell = ({ columnIndex, rowIndex, style }) => {
        const item = tableData[rowIndex];
        
        if (!item) return null;
        
        switch (columnIndex) {
          case 0:
            return <div style={style} className="flex items-center py-2 px-4">{item.name}</div>;
          case 1:
            return <div style={style} className="text-right py-2 px-4">{item.value}</div>;
          case 2:
            return <div style={style} className="text-right py-2 px-4">{item.percentage}</div>;
          default:
            return null;
        }
      };

      useEffect(() => {
          // fetch Result Data from the api : 
          const fetchData = async () => {
            try{
              setLoading(true);
              setTableData([
                { name: 'ABC Corp', value: '$125,432', percentage: '34%' },
                { name: 'XYZ Ltd', value: '$98,765', percentage: '27%' },
                { name: 'Global Solutions', value: '$67,890', percentage: '19%' },
                { name: 'Tech Innovations', value: '$45,678', percentage: '12%' },
                { name: 'Others', value: '$29,876', percentage: '8%' },
              ]);
            } catch(error) {
              console.error(error)
            }finally{
              setLoading(false)
            }
      
        };

        fetchData();
      }, [])
  
    return (
      <div>
        {
          !isConfigOpen ? (<div className="p-2 h-full flex flex-col bg-white">
            <div className="flex justify-between items-center  border-b py-4">
              <div className='flex flex-col w-full '>
               <div className='flex items-center justify-between mb-2 w-full '>
               <h2 className=" font-semibold">{title}</h2>
               <BsGear onClick={() => setIsConfigOpen(true)} size={30} className='text-green-900 bg-gray-100 p-2 rounded-full hover:bg-gray-200 cursor-pointer'/>
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
                      Threshold : {data?.threshold}
                    </div>
                    <div>
                      Date Range : {data?.dateRange}
                    </div>
                </div>
              </div>
              
            </div>
    
            <div className="flex flex-col  border  rounded-md overflow-hidden my-4">
            <div className='p-4'>
                  <h3 className="text-sm font-medium mb-3 text-gray-700">Summary</h3>
                  <p className="text-sm text-gray-600 mb-4">{data?.summary}</p>
                  
                  <h4 className="text-sm font-medium mb-2 text-gray-700">Key Insights</h4>
                  <ul className="space-y-2 mb-6">
                    {data?.keyPoints?.map((point, i) => (
                      <li key={i} className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                        <span className="text-sm text-gray-600">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
    
                <div className='flex gap-2 p-4'> 
                  <button className='flex gap-1 bg-emerald-800/10 text-green-800 rounded-md items-center px-2 py-1'>
                    <FaSearch  size={12}/> <span className='text-[12px] font-medium'>View Sample</span>
                  </button>
                  <button className='flex gap-1 bg-amber-400/10 text-yellow-800 rounded-md items-center px-2 py-1'>
                    <RiBarChartLine  size={12}/> <span className='text-[12px] font-medium'>Generate Report</span>
                  </button>
                  <button className='flex gap-1 bg-gray-100 text-gray-800 rounded-md items-center px-2 py-1'>
                    <LuFileSpreadsheet  size={12}/> <span className='text-[12px] font-medium'>Export Data</span>
                  </button>
                </div>
                  </div>
            
            <div className="flex flex-col">
              <h4 className="text-sm font-medium mb-2 text-gray-700">Result Data</h4>
              
              
              <div className=" p-4 rounded-lg shadow-sm border flex flex-col overflow-hidden">
              
                
                <div className="h-[500px]  overflow-hidden">
                  
                  
                  {/* Table Header */}
                  <div className="flex items-center bg-gray-50 py-2 px-4 border-y">
                    <div className="flex-1 font-medium text-xs text-gray-500 uppercase tracking-wider">Name</div>
                    <div className="w-1/4 text-right font-medium text-xs text-gray-500 uppercase tracking-wider">Value</div>
                    <div className="w-1/4 text-right font-medium text-xs text-gray-500 uppercase tracking-wider">Percentage</div>
                  </div>
                  
                  {/* Virtualized Table */}
                  <div style={{ height: "calc(100% - 36px)" }}>
                    <AutoSizer>
                      {({ height, width }) => (
                        <VirtualizedList
                          width={width}
                          height={400}
                          rowCount={tableData.length}
                          rowHeight={40}
                          rowRenderer={rowRenderer}
                          overscanRowCount={5}
                        />
                      )}
                    </AutoSizer>
                  </div>
                </div>
              </div>
            </div>
          </div>) : 
          (
            <div className="p-2 h-full flex flex-col bg-white">
              <AnalysisSettings />
            </div>
          )
        }
      </div>
    );
  };
  
  export default AnalysisView;