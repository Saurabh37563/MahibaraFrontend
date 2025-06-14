import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FILE_UPLOAD_ENDPOINTS } from "@/constants/endpoints-constant";
import type { SheetType } from "@/types/project-types";

const fetchSheetTypesApi = async () => {
  const response = await axios.get(FILE_UPLOAD_ENDPOINTS.getSheetTypes, {
    headers: { Authorization: `Bearer test-token` },
  });
  return response.data.data;
};

const fetchValidatedSheetTypesApi = async (projectId: string) => {
  const response = await axios.get(
    `${FILE_UPLOAD_ENDPOINTS.getValidatedSheetTypes}/${projectId}`,
    {
      headers: { Authorization: `Bearer test-token` },
    }
  );
  return response.data.data;
};

const getSheetTypesWithValidation = async (projectId: string): Promise<SheetType[]> => {
  const [sheetTypes, validatedSheetTypes] = await Promise.all([
    fetchSheetTypesApi(),
    fetchValidatedSheetTypesApi(projectId),
  ]);
  return sheetTypes.map((type: string) => ({
    name: type,
    isValidated: validatedSheetTypes.includes(type),
  }));
};

export const useSheetTypesWithValidation = (projectId: string) => {
  return useQuery<SheetType[], Error>({
    queryKey: ["sheetTypesWithValidation", projectId],
    queryFn: () => getSheetTypesWithValidation(projectId),
    enabled: !!projectId,
  });
};
