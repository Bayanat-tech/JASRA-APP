// action - state management
import { REGISTER, LOGIN, LOGOUT } from './actions';

// types
import { AuthProps, AuthActionProps } from 'types/auth';

// initial state
export const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null,
  permissions: {},
  user_permission: {},
  permissionBasedMenuTree: []
};

// ==============================|| AUTH REDUCER ||============================== //

const auth = (state: AuthProps = initialState, action: AuthActionProps): AuthProps => {
  switch (action.type) {
    case REGISTER: {
      const { user } = action.payload!;
      return {
        ...state,
        user
      };
    }
    case LOGIN: {
      const { user, permissions, user_permission, permissionBasedMenuTree } = action.payload!;
      return {
        ...state,
        isLoggedIn: true,
        isInitialized: true,
        user,
        permissions,
        user_permission,
        permissionBasedMenuTree
      } as AuthProps;
    }
    case LOGOUT: {
      return {
        ...state,
        isInitialized: true,
        isLoggedIn: false,
        user: null,
        permissions: {},
        user_permission: {},
        permissionBasedMenuTree: []
      };
    }
    default: {
      return { ...state };
    }
  }
};

export default auth;
