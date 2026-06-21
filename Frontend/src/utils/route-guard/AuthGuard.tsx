import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project import
import useAuth from 'hooks/useAuth';

// types
import { GuardProps } from 'types/auth';
import UnauthorisedPage from 'utils/permission-guard/UnauthorisedPage';
import { isUserAuthorized } from 'utils/functions';

// ==============================|| AUTH GUARD ||============================== //

const AuthGuard = ({ children }: GuardProps) => {
  const { isLoggedIn, permissions, user_permission } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const pathName = location.pathname.split('/').filter(Boolean);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('login', {
        state: {
          from: pathName[pathName.length - 1]
        },
        replace: true
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, navigate, location]);

  if (!!user_permission) {
    if (Object.keys(permissions).length > 0) {
      if (location.pathname.substring(1) === 'apps' || !isUserAuthorized(pathName, user_permission, permissions)) {
        return children;
      } else {
        return <UnauthorisedPage />;
      }
    }
    return <>Loading....</>;
  }
  return children;
};

export default AuthGuard;
