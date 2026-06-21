import { Card, Typography } from '@mui/material';
import AppIcon from 'components/AppIcon';
import useAuth from 'hooks/useAuth';
import useScreenSize from 'hooks/useScreenSize';

const AppSelectionPage = () => {
  const { permissionBasedMenuTree } = useAuth();
  const { isMobile } = useScreenSize();

  const MobileView = () => (
    <Card className="flex flex-col space-y-2 p-3 rounded-xl max-w-[600px] overflow-auto">
      <Typography className="text-xl font-semibold mb-1">Application</Typography>
      <div className="grid grid-cols-2 gap-4">
        {permissionBasedMenuTree?.map((eachApplication) => (
          <div key={eachApplication.id} className="flex justify-center items-center h-20">
            <AppIcon item={eachApplication} />
          </div>
        ))}
      </div>
    </Card>
  );

  const WebView = () => (
    <>
      <div className="bg-white p-6 rounded-xl">
        <Typography className="text-2xl font-semibold mb-1">Application</Typography>
        <div className="grid grid-cols-4 gap-4 py-6">
          {permissionBasedMenuTree?.map((eachApplication) => (
            <AppIcon key={eachApplication.id} item={eachApplication} />
          ))}
        </div>
      </div>
    </>
  );

  return <div className="h-screen flex justify-start items-start p-4">{isMobile ? <MobileView /> : <WebView />}</div>;
};

export default AppSelectionPage;
