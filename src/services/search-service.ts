import { SearchResponse } from "@/types/header-types";

export const fetchSearchResults = async ({
  query = "",
  cursor = null,
  limit = 10,
}: {
  query: string;
  cursor: string | null;
  limit?: number;
}): Promise<SearchResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const allResults = [
    {
      id: "fn-1",
      title: "Data Processing",
      description: "Process raw data into structured format",
      type: "function",
      path: "/functions/fn-1",
    },
    {
      id: "fn-2",
      title: "Text Analysis",
      description: "Analyze text for sentiment and keywords",
      type: "function",
      path: "/functions/fn-2",
    },
    {
      id: "fn-3",
      title: "Image Recognition",
      description: "Identify objects in images",
      type: "function",
      path: "/functions/fn-3",
    },
    {
      id: "fn-4",
      title: "Natural Language Processing",
      description: "Process and understand human language",
      type: "function",
      path: "/functions/fn-4",
    },
    {
      id: "fn-5",
      title: "Time Series Analysis",
      description: "Analyze time-based data patterns",
      type: "function",
      path: "/functions/fn-5",
    },
    {
      id: "fn-6",
      title: "Predictive Modeling",
      description: "Create models to predict outcomes",
      type: "function",
      path: "/functions/fn-6",
    },
    {
      id: "fn-7",
      title: "Data Visualization",
      description: "Create visual representations of data",
      type: "function",
      path: "/functions/fn-7",
    },
    {
      id: "fn-8",
      title: "Anomaly Detection",
      description: "Identify outliers in datasets",
      type: "function",
      path: "/functions/fn-8",
    },
    {
      id: "fn-9",
      title: "Clustering Algorithm",
      description: "Group similar data points",
      type: "function",
      path: "/functions/fn-9",
    },
    {
      id: "fn-10",
      title: "Classification Model",
      description: "Categorize data into classes",
      type: "function",
      path: "/functions/fn-10",
    },
    {
      id: "fn-11",
      title: "Regression Analysis",
      description: "Predict continuous values",
      type: "function",
      path: "/functions/fn-11",
    },
    {
      id: "fn-12",
      title: "Data Enrichment",
      description: "Add context to existing data",
      type: "function",
      path: "/functions/fn-12",
    },
    {
      id: "fn-13",
      title: "Feature Extraction",
      description: "Identify important attributes in data",
      type: "function",
      path: "/functions/fn-13",
    },
    {
      id: "fn-14",
      title: "Summarization",
      description: "Create concise summaries of data",
      type: "function",
      path: "/functions/fn-14",
    },
    {
      id: "fn-15",
      title: "Entity Recognition",
      description: "Identify entities in text",
      type: "function",
      path: "/functions/fn-15",
    },
  ];

  const filteredResults = query
    ? allResults.filter(
        (result) =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase())
      )
    : allResults;

  const startIndex = cursor ? parseInt(cursor) : 0;
  const endIndex = startIndex + limit;
  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  const nextCursorValue =
    endIndex < filteredResults.length ? endIndex.toString() : null;

  return {
    results: paginatedResults,
    nextCursor: nextCursorValue,
    totalCount: filteredResults.length,
  };
};
