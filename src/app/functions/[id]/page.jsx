'use client'

import { useState, useEffect } from 'react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { IoMdAdd } from "react-icons/io";
import { MdOutlineFileDownload } from "react-icons/md";
import { LuFileSpreadsheet } from "react-icons/lu";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { LuChartPie } from "react-icons/lu";
import { Skeleton } from "@/components/ui/skeleton";
import AnalysisView from "@/components/functions/function/AnalysisView";
import SpreadSheetView from "@/components/functions/function/SpreadSheetView";
export default function Function() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const sheets = [
    { id: 1, name: "PR Register", status: "success" },
    { id: 2, name: "PO Register", status: "warning" },
    { id: 3, name: "GRN Register", status: "danger" },
    { id: 4, name: "Invoice Reg", status: "info" },
    { id: 5, name: "Payment Reg", status: "neutral" },
    { id: 6, name: "Vendor Master", status: "success" },
    { id: 7, name: "Item Master", status: "warning" },
    { id: 8, name: "GRIR Report", status: "danger" },
    { id: 9, name: "Adv To Vendor", status: "info" },
    { id: 10, name: "PO Matrix", status: "neutral" },
  ];
  
  const analysis = [
    { id: 1, name: "Top Vendors (80-20)", status: "success" },
    { id: 2, name: "Top Items (80-20)", status: "warning" },
    { id: 3, name: "PO By Creater", status: "danger" },
    { id: 4, name: "PO By Location", status: "info" },
    { id: 5, name: "PO By Currency", status: "neutral" },
  ];
  
  const statusDotColors = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
    neutral: "bg-gray-400",
  };

  useEffect(() => {
    if (selectedItem) {
      fetchData();
    }
  }, [selectedItem]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (selectedItem.type === 'sheet') {
        // Mock spreadsheet data - generate more rows for virtualization
        const columns = [
          { key: 'id', name: 'ID', width: 100 },
          { key: 'reference', name: 'Reference', width: 165 },
          { key: 'date', name: 'Date', width: 165 },
          { key: 'vendor', name: 'Vendor', width: 165 },
          { key: 'amount', name: 'Amount', width: 165 },
          { key: 'status', name: 'Status', width: 165 }
        ];
        
        const rows = Array(10000).fill(0).map((_, i) => ({
          id: i + 1,
          reference: `REF-${Math.floor(10000 + Math.random() * 90000)}`,
          date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
          vendor: ['ABC Corp', 'XYZ Ltd', 'Global Solutions', 'Tech Innovations'][Math.floor(Math.random() * 4)],
          amount: `$${(1000 + Math.random() * 9000).toFixed(2)}`,
          status: ['Pending', 'Approved', 'Rejected', 'In Progress'][Math.floor(Math.random() * 4)]
        }));
        
        const fileStatuses = ['validated', 'pending', 'error'];
        const randomStatus = fileStatuses[Math.floor(Math.random() * fileStatuses.length)];
  
        setData({lastModified: "Jan 15, 2024", size:"2.4 MB", records:234,  columns, rows, status: randomStatus });
      } else {
        // Mock analysis data
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const values = Array(6).fill(0).map(() => Math.floor(Math.random() * 100));
        
        setData({
          status: ["completed", "running", "deleted"][Math.floor(Math.random()*3)],
          threshold:"20%",
          dateRange:"Q3 2024",
          chartType: ['bar', 'line', 'pie'][Math.floor(Math.random() * 3)],
          labels,
          values,
          summary: `This analysis shows the distribution of ${selectedItem.name} across different periods.`,
          keyPoints: [
            'Point 1: Significant increase in Q2',
            'Point 2: ABC Corp is the top vendor',
            'Point 3: 80% of purchases come from 20% of vendors'
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item, type) => {
    setSelectedItem({ ...item, type });
  };

  return (
    <div className="h-[calc(100dvh-65px)] w-full"> 
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full h-full"
      >
        <ResizablePanel defaultSize={25}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel className="flex flex-col w-full" defaultSize={50}>
              <div className="flex items-center justify-between p-4 bg-gray-50">
                <div className="text-xs flex items-center gap-1">
                  <span className="">Sheets</span>
                  <span className="text-[12px] mt-[2px] text-muted-foreground">({sheets.length})</span>
                </div>
                <div className="flex gap-2 items-center">
                  <IoMdAdd className="text-muted-foreground cursor-pointer" size={16} />
                  <MdOutlineFileDownload className="text-muted-foreground cursor-pointer" size={16} />
                </div>
              </div>
              <div className="overflow-y-auto py-4">
                {sheets.map((sheet) => (
                  <div
                    key={sheet.id}
                    className={`flex group items-center justify-between rounded-md p-2 hover:bg-slate-50 cursor-pointer ${
                      selectedItem?.id === sheet.id && selectedItem?.type === 'sheet' ? 'bg-slate-100' : ''
                    }`}
                    onClick={() => handleItemClick(sheet, 'sheet')}
                  >
                    <div className="text-xs flex items-center gap-2">
                      <LuFileSpreadsheet className="text-gray-400" />
                      <span className="text-gray-950">{sheet.name}</span>
                      <span
                        className={`size-[6px] rounded-full ${
                          statusDotColors[sheet.status] || "bg-gray-300"
                        }`}
                      />
                    </div>
                    <div className="gap-2 hidden group-hover:flex items-center">
                      <HiOutlineDotsVertical className="text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel className="flex flex-col w-full" defaultSize={50}>
              <div className="flex items-center justify-between p-4 bg-gray-50">
                <div className="text-xs flex items-center gap-1">
                  <span className="">Analysis</span>
                  <span className="text-[12px] mt-[2px] text-muted-foreground">({analysis.length})</span>
                </div>
                <div className="flex gap-2 items-center">
                  <IoMdAdd className="text-muted-foreground cursor-pointer" size={16} />
                  <MdOutlineFileDownload className="text-muted-foreground cursor-pointer" size={16} />
                </div>
              </div>
              <div className="overflow-y-auto py-4">
                {analysis.map((item) => (
                  <div
                    key={item.id}
                    className={`flex group items-center justify-between rounded-md p-2 hover:bg-slate-50 cursor-pointer ${
                      selectedItem?.id === item.id && selectedItem?.type === 'analysis' ? 'bg-slate-100' : ''
                    }`}
                    onClick={() => handleItemClick(item, 'analysis')}
                  >
                    <div className="text-xs flex items-center gap-2">
                      <LuChartPie className="text-gray-400" />
                      <span className="text-gray-950">{item.name}</span>
                      <span
                        className={`size-[6px] rounded-full ${
                          statusDotColors[item.status] || "bg-gray-300"
                        }`}
                      />
                    </div>
                    <div className="gap-2 hidden group-hover:flex items-center">
                      <HiOutlineDotsVertical className="text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={75}>
          <div className="relative h-full w-full bg-white dark:bg-black overflow-hidden">
            {/* Background pattern */}
            <div
              className="
                absolute inset-0 
                [background-size:20px_20px] 
                [background-image:radial-gradient(#d4d4d4_1px,transparent_1px)] 
                dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]
              "
            />

            {/* Fade mask */}
            <div className="
              pointer-events-none 
              absolute inset-0 
              bg-white dark:bg-black 
              [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]
            " />

            {/* Content */}
            <div className="relative z-10 h-full">
              {!selectedItem ? (
                // Empty state
                <div className="
                  absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white 
                  rounded-lg shadow-sm p-4 w-fit text-gray-400 z-20 flex flex-col items-center justify-center
                ">
                  <LuFileSpreadsheet size={40} className="mb-4"/>
                  <p className="text-gray-500 text-sm">
                    Select a sheet or analysis to view details
                  </p>
                </div>
              ) : loading ? (
                // Loading state
                <div className="p-6 h-full">
                  <Skeleton className="h-8 w-1/4 mb-6" />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80 w-full" />
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>
                </div>
              ) : (
                // Render appropriate content based on selection type
                selectedItem.type === 'sheet' ? (
                  <SpreadSheetView data={data} title={selectedItem.name} />
                ) : (
                  <AnalysisView data={data} title={selectedItem.name} />
                )
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}