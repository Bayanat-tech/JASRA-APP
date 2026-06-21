// import { IApiResponse } from 'types/types.services';
// import axiosServices from 'utils/axios';

// class MasterList {
//   getMastersList = async ({ appcode, level1, level2 }: { appcode: string; level1: string; level2: string }) => {
//     try {
//       const response: IApiResponse<{ label: string; value: string }[]> = await axiosServices.get(
//         `api/get-masters/${appcode}/${level1}/${level2}`
//       );
//       if (response.data.success) return response.data.data;
//     } catch (error) {}
//   };
// }
// const MasterListInstance = new MasterList();
// export default MasterListInstance;
