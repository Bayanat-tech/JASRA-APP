// import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import useAuth from 'hooks/useAuth';
import { useState, useEffect } from 'react';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';

export let gs_userlevel: any = null;
export function useInitializeUserLevel(): void {
  const { user } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function fetchUserLevel() {
      try {
        const userId = user?.username;
        const companyCode = user?.company_code;

        if (!userId || !companyCode) {
          console.error('User ID or Company Code is missing.');
          return;
        }

        if (companyCode === 'BSG') {
          gs_userlevel = null;
          console.log('fetchUserlevel skipped for company BSG');
          setInitialized(true);
          return;
        }

        gs_userlevel = await GmPfServiceInstance.fetchUserlevel(userId, companyCode, '001');
        console.log('Global User Level initialized:', gs_userlevel);
        setInitialized(true);
      } catch (error) {
        console.error('Failed to fetch user level:', error);
      }
    }

    if (!initialized) {
      fetchUserLevel();
    }
  }, [user, initialized]);
}
