import { APIResponse, SpreadsheetData } from '@/types/spreadsheet-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const fetchSpreadsheetData = async (projectId: string): Promise<SpreadsheetData> => {
  try {
    // TODO: Uncomment when API is ready
    // const response = await fetch(`${API_BASE_URL}/projects/${projectId}/spreadsheet`);
    // if (!response.ok) {
    //   throw new Error(`Failed to fetch spreadsheet data: ${response.statusText}`);
    // }
    // const result: APIResponse = await response.json();
    // return result.data;

    // Dummy data for now
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    return {
      id: `sheet_${projectId}`,
      projectId,
      status: 'processing',
      metadata: {
        fileName: 'sales_data_2024.xlsx',
        fileSize: '2.5 MB',
        lastModified: new Date().toISOString(),
        recordCount: 15420,
        sheetCount: 3,
      },
      fileUrl: 'https://example.com/files/sales_data_2024.xlsx',
      message: 'Processing spreadsheet...',
      progress: 45,
    };
  } catch (error) {
    console.error('Error fetching spreadsheet data:', error);
    throw error;
  }
};
