import React, { createContext, useEffect, useReducer } from 'react';

// third-party
import { Chance } from 'chance';
import jwtDecode from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT } from 'store/reducers/actions';
import authReducer from 'store/reducers/auth';

// project import
import Loader from 'components/Loader';
import { AuthProps, JWTContextType } from 'types/auth';
import { KeyedObject } from 'types/root';
import { default as axios } from 'utils/axios';
import AuthServicesInstance from 'service/service.auth';
import useConfig from 'hooks/useConfig';
import { ThemeDirection } from 'types/config';
// import { I18n } from 'types/config';

const chance = new Chance();

// constant
const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null,
  user_permission: {},
  permissions: {},
  permissionBasedMenuTree: []
};

//----for change lang------

const verifyToken: (st: string) => boolean = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }
  const decoded: KeyedObject = jwtDecode(serviceToken);

  /**log
   * Property 'exp' does not exist on type '<T = unknown>(token: string, options?: JwtDecodeOptions | undefined) => T'.
   */
  return decoded.exp > Date.now() / 1000;
};

const setSession = (serviceToken?: string | null) => {
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
    axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
  } else {
    localStorage.removeItem('serviceToken');
    delete axios.defaults.headers.common.Authorization;
  }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext<JWTContextType | null>(null);

export const JWTProvider = ({ children }: { children: React.ReactElement }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { onChangeLocalization, onChangeDirection } = useConfig();

  const ChangeDirection = (language: string) => {
    onChangeLocalization(language as string);
    if (language === 'ar') {
      onChangeDirection(ThemeDirection.RTL);
      return;
    }
    onChangeDirection(ThemeDirection.LTR);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const serviceToken = window.localStorage.getItem('serviceToken');

        if (serviceToken && verifyToken(serviceToken)) {
          setSession(serviceToken);
          // const permissionsResponse = await AuthServicesInstance.getPermissions();

          const meData = await AuthServicesInstance.getMe();

          if (meData?.success) {
            const { user, permissions, user_permission, permissionBasedMenuTree } = meData?.data;
            ChangeDirection(meData?.data.user?.lang_pref ?? 'en');

            // const permissions = permissionsResponse.data;
            dispatch({
              type: LOGIN,
              payload: {
                isLoggedIn: true,
                user,
                permissions,
                user_permission,
                permissionBasedMenuTree
              }
            });
          }
        } else {
          dispatch({
            type: LOGOUT
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: LOGOUT
        });
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axios.post('/api/auth/login', { email, password });
    const { token } = response.data.data;
    setSession(token);
    // const permissionsResponse = await AuthServicesInstance.getPermissions();
    const meData = await AuthServicesInstance.getMe();

    if (meData?.success) {
      const { user, permissions, user_permission, permissionBasedMenuTree } = meData?.data;
      ChangeDirection(user?.lang_pref ?? 'en');
      dispatch({
        type: LOGIN,
        payload: {
          isLoggedIn: true,
          user: user,
          permissions,
          user_permission,
          permissionBasedMenuTree
        }
      });
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    // todo: this flow need to be recode as it not verified
    const id = chance.bb_pin();
    const response = await axios.post('/api/register', {
      id,
      email,
      password,
      firstName,
      lastName
    });
    let users = response.data;

    if (window.localStorage.getItem('users') !== undefined && window.localStorage.getItem('users') !== null) {
      const localUsers = window.localStorage.getItem('users');
      users = [
        ...JSON.parse(localUsers!),
        {
          id,
          email,
          password,
          name: `${firstName} ${lastName}`
        }
      ];
    }

    window.localStorage.setItem('users', JSON.stringify(users));
  };

  const logout = () => {
    setSession(null);
    dispatch({ type: LOGOUT });
  };

  const resetPassword = async (email: string) => {};

  const updateProfile = () => {};

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return <JWTContext.Provider value={{ ...state, login, logout, register, resetPassword, updateProfile }}>{children}</JWTContext.Provider>;
};

export default JWTContext;
