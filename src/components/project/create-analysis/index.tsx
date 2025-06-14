"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IoMdAdd } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import { Label } from "@/components/ui/label";
import { BASE_TEMP_BACKEND_URL } from "@/constants/endpoints-constant";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { queryClient } from "@/providers/query-provider";
import {
  Analysis,
  Section,
  ApiSection,
  ApiSubSection,
  ApiAnalysis,
} from "@/types/project-types";

interface AnalysisSelectionModalProps {
  onAnalysisCreate: (selectedAnalyses: Analysis[]) => void;
  createdAnalysisTemplateIds: string[];
}

export function AnalysisSelectionModal({
  onAnalysisCreate,
  createdAnalysisTemplateIds,
}: AnalysisSelectionModalProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [analysisData, setAnalysisData] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  // Fetch analysis data (API call would go here)

  const fetchAnalysisData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_TEMP_BACKEND_URL}/api/v1/projects/working-types/hierarchy`
      );
      // Map all analyses to have working_id, working_name, and status, ensuring no undefined
      const mappedData: Section[] = (response.data?.data as ApiSection[]).map(
        (section) => ({
          id: section.id ?? "",
          name: section.name ?? "",
          subSections: (section.subSections ?? []).map(
            (subSection: ApiSubSection) => ({
              id: subSection.id ?? "",
              name: subSection.name ?? "",
              analyses: (subSection.analyses ?? []).map((a: ApiAnalysis) => ({
                working_id: a.id ?? "",
                working_name: a.name ?? "",
                status: "neutral", // or set from API if available
                summary: a.summary ?? "",
                id: a.id ?? "",
                name: a.name ?? "",
              })),
            })
          ),
        })
      );
      setAnalysisData(mappedData);
    } catch (error) {
      console.error("Error fetching analysis data:", error);
      toast.error("Failed to load analysis templates. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAnalysisData();
      // Pre-select already created analyses when modal opens
      setSelectedAnalyses([...createdAnalysisTemplateIds]);
      setSearchQuery("");
    }
  }, [open, createdAnalysisTemplateIds]);

  const handleToggleAnalysis = (analysisId: string) => {
    setSelectedAnalyses((prev) =>
      prev.includes(analysisId)
        ? prev.filter((id) => id !== analysisId)
        : [...prev, analysisId]
    );
  };

  const handleClearAll = () => {
    setSelectedAnalyses([]);
  };

  const handleCreate = () => {
    // Find all analysis objects for selected IDs
    const allAnalyses: Analysis[] = analysisData.flatMap((section) =>
      section.subSections.flatMap((subSection) => subSection.analyses)
    );
    // Ensure all returned objects have working_id, working_name, and status
    const selectedAnalysisObjects = allAnalyses
      .filter((a) => selectedAnalyses.includes(a.working_id))
      .map((a) => ({
        ...a,
        working_id: a.working_id,
        working_name: a.working_name,
        status: a.status || "neutral",
      }));
    onAnalysisCreate(selectedAnalysisObjects);
    // Invalidate the query to refetch analyses after update
    queryClient.invalidateQueries({ queryKey: ["projectAnalyses", id] });
    setSelectedAnalyses([]);
    setSearchQuery("");
    setOpen(false);
  };

  const handleCancel = () => {
    setSelectedAnalyses([]);
    setSearchQuery("");
    setOpen(false);
  };

  // Filter sections based on search query
  const filteredData =
    searchQuery.trim() === ""
      ? analysisData
      : analysisData
          .map((section) => ({
            ...section,
            subSections: section.subSections
              .map((subSection) => ({
                ...subSection,
                analyses: subSection.analyses.filter(
                  (analysis) =>
                    (analysis.name ?? "")
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    (analysis.summary ?? "")
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                ),
              }))
              .filter((subSection) => subSection.analyses.length > 0),
          }))
          .filter((section) => section.subSections.length > 0);

  const handleSelectSection = (section: Section) => {
    // Get all analysis IDs from this section
    const sectionAnalysisIds = section.subSections.flatMap((subSection) =>
      subSection.analyses.map((analysis) => analysis.id ?? "")
    );

    // Check if all analyses in this section are already selected
    const allSelected = sectionAnalysisIds.every((id) =>
      selectedAnalyses.includes(id ?? "")
    );

    if (allSelected) {
      // If all are selected, deselect them
      setSelectedAnalyses((prev) =>
        prev.filter((id) => !sectionAnalysisIds.includes(id ?? ""))
      );
    } else {
      // Otherwise, add all missing analyses
      const newSelectedAnalyses = [...selectedAnalyses];

      sectionAnalysisIds.forEach((id) => {
        const safeId = id ?? "";
        if (!newSelectedAnalyses.includes(safeId)) {
          newSelectedAnalyses.push(safeId);
        }
      });

      setSelectedAnalyses(newSelectedAnalyses);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <IoMdAdd className="text-muted-foreground cursor-pointer" size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="[&>button:last-child]:hidden  bg-slate-50 p-0 gap-y-0 border-0 ring-0 outline-0 flex flex-col max-h-screen  !max-sm:max-w-screen sm:h-[90dvh] w-full sm:max-w-[70dvw] overflow-y-auto">
        {/* Header - Fixed at top */}
        <DialogHeader className="bg-primary text-white p-[18px] flex-shrink-0">
          <DialogTitle>Add Analysis</DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="p-4 border-b bg-white flex-shrink-0">
          <div className="relative">
            <FiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <Input
              placeholder="Search analyses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="overflow-y-auto px-4 flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Loading analysis templates...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {filteredData.map((section) => {
                // Calculate if all analyses in this section are selected
                const sectionAnalysisIds = section.subSections.flatMap((sub) =>
                  sub.analyses.map((analysis) => analysis.id ?? "")
                );
                const allSectionSelected =
                  sectionAnalysisIds.length > 0 &&
                  sectionAnalysisIds.every((id) =>
                    selectedAnalyses.includes(id)
                  );

                return (
                  <div key={section.id} className="space-y-4">
                    <div className="flex items-center gap-x-3">
                      <h3 className="font-semibold text-xl text-green-900">
                        {section.name}
                      </h3>
                      <Button
                        className={`${
                          allSectionSelected
                            ? "bg-red-700 hover:bg-red-800"
                            : "bg-green-900 hover:bg-green-800"
                        } rounded-full h-7 px-3 text-[14px]`}
                        onClick={() => handleSelectSection(section)}
                      >
                        {allSectionSelected ? "Remove" : "Add"}
                      </Button>
                    </div>

                    {section.subSections.map((subSection) => (
                      <div key={subSection.id} className="ml-2 space-y-2">
                        <h4 className="font-medium text-sm text-gray-700 pl-2 border-l-2">
                          {subSection.name}
                        </h4>

                        <div className="mt-4 flex items-center gap-2 flex-wrap space-y-2 w-full">
                          {subSection.analyses.map((analysis) => {
                            const isSelected = selectedAnalyses.includes(
                              analysis.id ?? ""
                            );
                            return (
                              <div
                                key={analysis.id ?? ""}
                                onClick={() =>
                                  handleToggleAnalysis(analysis.id ?? "")
                                }
                                className={`flex flex-col gap-1 border items-start min-w-[350px] rounded-md w-fit bg-white p-4 
                                  ${
                                    isSelected
                                      ? "border-primary ring-2 ring-primary/20"
                                      : "border-gray-200"
                                  }
                                  cursor-pointer hover:bg-gray-50 transition-colors max-md:flex-grow max-md:min-w-[250px] `}
                              >
                                <div className="flex justify-between w-full items-center space-x-2">
                                  <Label
                                    htmlFor={analysis.id ?? ""}
                                    className="cursor-pointer font-medium"
                                  >
                                    {analysis.name ?? ""}
                                  </Label>
                                  <Checkbox
                                    id={analysis.id ?? ""}
                                    checked={isSelected}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleToggleAnalysis(analysis.id ?? "");
                                    }}
                                    className="peer cursor-pointer"
                                  />
                                </div>
                                <Label className="text-gray-600 font-normal text-[14px] cursor-pointer">
                                  {analysis?.summary ?? ""}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}

              {filteredData.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? `No analyses found for "${searchQuery}"`
                    : "No analysis templates available"}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer - Fixed at bottom */}
        <div className="border-t flex-shrink-0 p-4 bg-background">
          <div className="flex items-center justify-between w-full">
            <div className="flex space-x-2">
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              {selectedAnalyses.length > 0 && (
                <Button variant="outline" onClick={handleClearAll}>
                  Clear All
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {selectedAnalyses.length > 0 && (
                <span className="text-sm font-medium">
                  {selectedAnalyses.length} selected
                </span>
              )}
              <Button onClick={handleCreate}>Update Analysis</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default AnalysisSelectionModal;
