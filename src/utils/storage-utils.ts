import { FILE_UPLOAD_ENDPOINTS } from "@/constants/endpoints-constant";
import axios from "axios";
import type {
  FileUploadResponse,
  UploadProgress,
  UploadResponse,
} from "@/types/project-types";

export async function uploadToDigitalOcean(
  file: File,
  fileId: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", "38");

    const response = await axios.post<FileUploadResponse>(
      `${FILE_UPLOAD_ENDPOINTS?.uploadToSpaces}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress({ fileId, progress: percentCompleted });
          }
        },
      },
    );

    if (response.data.success) {
      return {
        success: true,
        file_id: response.data.data.file_id,
        file_link: response.data.data.storage_path,
        file_name: response.data.data.filename,
      };
    } else {
      throw new Error(response.data.error || "Upload failed");
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error uploading file to Digital Ocean:", err);
    return {
      success: false,
      file_id: 0,
      file_link: "",
      file_name: file.name,
      message: err.message || "Failed to upload file. Please try again.",
    };
  }
}
