 // Adjust path as needed
import axiosServices from 'utils/axios';




export const getRequestFlowUsers = async (requestNumber: string, loginId: string): Promise<any[] | null> => {
  try {
    if (!requestNumber || !loginId) {
      console.warn('Missing input: requestNumber or loginId');
      return null;
    }

    const params = new URLSearchParams({
      doc_id: requestNumber,
      loginId
    });

    const url = `api/HR/gm/getRequestFlowUsers?${params.toString()}`;

    const response = await axiosServices.get(url);

    if (response.data?.data && Array.isArray(response.data.data)) {
      console.log('Request flow users received. Success flag:', response.data.success);
      console.log('Data:', response.data.data);
      return response.data.data as any[];
    } else {
      console.error('No valid data array found in response:', response.data);
      return null;
    }
  } catch (error: unknown) {
    console.error('Error in getRequestFlowUsers:', error);
    return null;
  }
};
