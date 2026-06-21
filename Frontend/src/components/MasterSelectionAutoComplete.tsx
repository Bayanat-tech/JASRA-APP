// import { Autocomplete, Stack, TextField } from '@mui/material';
// import { useQuery } from '@tanstack/react-query';
// import useAuth from 'hooks/useAuth';
// import { SyntheticEvent, useEffect } from 'react';
// import { useLocation, useNavigate, useParams } from 'react-router';
// import MasterListInstance from 'service/service.mastersList';
// import { dispatch, useSelector } from 'store';
// import { setSelectedLevel2Item } from 'store/reducers/customReducer/slice.menuSelectionSlice';

// const MasterSelectionAutoComplete = () => {
//   //---------------------------Constants-----------------

//   const navigate = useNavigate();
//   const location = useLocation();
//   const { master } = useParams();
//   const { level2, app } = useSelector((state) => state.menuSelectionSlice);

//   const { user_permission, permissions } = useAuth();

//   const pathnameList = location.pathname.split('/').filter(Boolean);
//   console.log('pathnameList', pathnameList, 'app', app);

//   //--------------------useQuery----------------------
//   const { data: mastersList } = useQuery({
//     queryKey: ['master_list', master],
//     queryFn: () => {
//       console.log('inside useQuery', permissions[app.toUpperCase()].children[level2.toUpperCase()].app_code);

//       return MasterListInstance.getMastersList({
//         appcode: permissions[app.toUpperCase()].children[level2.toUpperCase()].app_code,
//         level1: pathnameList[1],
//         level2
//       });
//     },
//     enabled: !!level2
//   });

//   //-----------------------useEffects------------------
//   useEffect(() => {
//     if (pathnameList.length > 0 && pathnameList[2] !== level2) {
//       console.log('calledinside 1st effect');

//       dispatch(setSelectedLevel2Item(pathnameList[2]));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [location.pathname]);

//   useEffect(() => {
//     if (!!mastersList && !master) {
//       navigate(`/${pathnameList.join('/')}/${mastersList[0].value}`);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [mastersList]);
//   useEffect(() => {
//     console.log('level2', level2);
//   }, [level2]);
//   //--------------------------Handlers-------------------

//   const handleMasterFilterChange = (event: SyntheticEvent<Element, Event>, newValue: { label: string; value: string }) => {
//     navigate(`/${pathnameList.splice(0, 3).join('/')}/${newValue.value}`);
//   };

//   return (
//     <Stack spacing={3}>
//       {!!mastersList && (
//         <Autocomplete
//           id="masters"
//           value={
//             (mastersList ?? []).find((eachMaster) => {
//               return master === eachMaster.value;
//             }) || { label: '', value: '' }
//           }
//           disableClearable
//           isOptionEqualToValue={(option, optionValue) => {
//             return option.value === optionValue.value;
//           }}
//           getOptionLabel={(option) => option.label}
//           onChange={handleMasterFilterChange}
//           options={(mastersList ?? []).filter((eachMaster) =>
//             Object.keys(user_permission)?.includes(permissions[app.toUpperCase()].children[eachMaster.value.toUpperCase()]?.serial_number)
//           )}
//           renderInput={(params) => <TextField
//         />
//       )}
//       {/* {renderMaster(reportData)} */}
//     </Stack>
//   );
// };

// export default MasterSelectionAutoComplete;

const MasterSelectionAutoComplete = () => {
  return <div>MasterSelectionAutoComplete</div>;
};

export default MasterSelectionAutoComplete;
