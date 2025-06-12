"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/providers/query-provider";
import axios from "axios";
import {
  BASE_TEMP_BACKEND_URL,
  FILE_UPLOAD_ENDPOINTS,
} from "@/constants/endpoints-constant";
import type { Analysis } from "@/components/project/create-analysis";

// Types
type StatusEnum =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "uploaded";

type Item = {
  id?: string;
  name?: string;
  status?: string;
  summary?: string;
  templateId?: string;
  [x: string]: unknown;
};

type SelectedItem = Item & {
  type: "sheet" | "analysis";
  index: number;
};

type AnalysisAPIItem = {
  working_id: string;
  working_name: string;
  status: string;
};

// Context types
interface ProjectContextType {
  // States
  selectedItem: SelectedItem | null;
  sheets: Item[];
  analysis: AnalysisAPIItem[];
  loading: boolean;
  isMobile: boolean;
  sidebarOpen: boolean;
  selectedTab: "sheets" | "analysis";
  projectId: string;

  // Actions
  setSelectedItem: (item: SelectedItem | null) => void;
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedTab: (tab: "sheets" | "analysis") => void;
  toggleSidebar: () => void;
  handleClearSelection: () => void;

  // Data actions
  handleItemClick: (
    item: Item,
    type: "sheet" | "analysis",
    index: number
  ) => void;
  handleAnalysisCreate: (selectedAnalyses: Analysis[]) => void;

  // Query states and actions
  isSheetsLoading: boolean;
  isAnalysisLoading: boolean;
  refetchSheets: () => void;

  // Utility functions
  statusDotColors: Record<StatusEnum, string>;
  mapStatusToUI: (status: string) => StatusEnum;
  normalizeSheet: (item: Item) => { name: string; status: StatusEnum };
  toAnalysisItem: (item: Analysis | AnalysisAPIItem | Item) => Analysis;
  getCreatedAnalysisTemplateIds: () => string[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const params = useParams();
  const projectId = params?.id as string;

  // Core states
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [sheets, setSheets] = useState<Item[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisAPIItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<"sheets" | "analysis">(
    "sheets"
  );

  // Status color mapping
  const statusDotColors: Record<StatusEnum, string> = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
    neutral: "bg-gray-400",
    uploaded: "bg-purple-500",
  };

  // Utility functions
  const mapStatusToUI = useCallback((status: string): StatusEnum => {
    switch (status.toLowerCase()) {
      case "validated":
      case "completed":
        return "success";
      case "pending":
        return "info";
      case "processing":
        return "warning";
      case "failed":
      case "error":
        return "danger";
      case "uploaded":
        return "uploaded";
      default:
        return "neutral";
    }
  }, []);

  const normalizeSheet = useCallback(
    (item: Item): { name: string; status: StatusEnum } => ({
      name: item.name ?? "",
      status: mapStatusToUI(item.status ?? ""),
    }),
    [mapStatusToUI]
  );

  const toAnalysisItem = useCallback(
    (item: Analysis | AnalysisAPIItem | Item): Analysis => ({
      working_id:
        (item as Analysis).working_id ??
        (item as AnalysisAPIItem).working_id ??
        (item as Item).id ??
        "",
      working_name:
        (item as Analysis).working_name ??
        (item as AnalysisAPIItem).working_name ??
        (item as Item).name ??
        "",
      status: item.status ?? "",
    }),
    []
  );

  const getCreatedAnalysisTemplateIds = useCallback((): string[] => {
    return analysis.map((a) => a.working_id);
  }, [analysis]);

  // Mobile detection
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // React Query for mapped sheets
  const {
    data: mappedSheets,
    isLoading: isSheetsLoading,
    refetch: refetchSheets,
  } = useQuery<Item[]>({
    queryKey: ["mappedSheets", projectId],
    queryFn: async () => {
      const response = await axios.get(
        FILE_UPLOAD_ENDPOINTS?.getMappedSheetTypes + "/" + projectId
      );
      return (response?.data?.data?.sheet_types as Item[]) || [];
    },
    enabled: !!projectId,
    refetchInterval: 5000,
  });

  // Update sheets state when query data changes
  useEffect(() => {
    if (mappedSheets) setSheets(mappedSheets);
  }, [mappedSheets]);

  // Fetch created analyses using react-query
  const { data: analysisData, isLoading: isAnalysisLoading } = useQuery<
    AnalysisAPIItem[]
  >({
    queryKey: ["projectAnalyses", projectId],
    queryFn: async () => {
      const response = await axios.get(
        BASE_TEMP_BACKEND_URL + `/api/v1/projects/get_analysis/${projectId}`
      );
      return response.data?.data || [];
    },
    enabled: !!projectId,
    refetchInterval: 5000,
  });

  // Keep local state in sync with react-query data
  useEffect(() => {
    if (Array.isArray(analysisData)) setAnalysis(analysisData);
  }, [analysisData]);

  // Mutation for updating analyses
  const saveProjectAnalyses = useMutation({
    mutationFn: async (selectedAnalyses: string[]) => {
      await axios.post(
        BASE_TEMP_BACKEND_URL + `/api/v1/projects/create_analysis/`,
        {
          project_id: projectId,
          working_id: selectedAnalyses,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectAnalyses", projectId],
      });
    },
  });

  // Action handlers
  const handleItemClick = useCallback(
    (item: Item, type: "sheet" | "analysis", index: number): void => {
      setSelectedItem({
        ...item,
        type,
        index,
        status: item.status,
      });
      if (isMobile) {
        setSidebarOpen(false);
      }
    },
    [isMobile]
  );

  const handleAnalysisCreate = useCallback(
    (selectedAnalyses: Analysis[]): void => {
      const analysisIds = selectedAnalyses
        .map((item) => item.working_id)
        .filter(Boolean) as string[];

      saveProjectAnalyses
        .mutateAsync(analysisIds)
        .then(() => {
          console.log(
            `Successfully updated analysis list with ${analysisIds.length} items`
          );
        })
        .catch((e) => {
          console.error("Failed to update analyses", e);
        });
    },
    [saveProjectAnalyses]
  );

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

  const handleClearSelection = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const contextValue: ProjectContextType = {
    // States
    selectedItem,
    sheets,
    analysis,
    loading,
    isMobile,
    sidebarOpen,
    selectedTab,
    projectId,

    // Actions
    setSelectedItem,
    setLoading,
    setSidebarOpen,
    setSelectedTab,
    toggleSidebar,
    handleClearSelection,

    // Data actions
    handleItemClick,
    handleAnalysisCreate,

    // Query states and actions
    isSheetsLoading,
    isAnalysisLoading,
    refetchSheets,

    // Utility functions
    statusDotColors,
    mapStatusToUI,
    normalizeSheet,
    toAnalysisItem,
    getCreatedAnalysisTemplateIds,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};
