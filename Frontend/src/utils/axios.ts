import axios, { AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken } from './functions';

const axiosServices = axios.create({ baseURL: process.env.REACT_APP_API_URL });
type TAxiosRequestHeadersWithCoords = {
  'x-longitude': string;
  'x-latitude': string;
} & AxiosRequestHeaders;

interface ICustomAxiosRequestConfig extends InternalAxiosRequestConfig<any> {
  locationNeeded?: boolean;
  serviceToken?: string;
}

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //
axiosServices.interceptors.request.use(
  async (config: ICustomAxiosRequestConfig) => {
    if (config.url && !/^https?:\/\//i.test(config.url) && !config.url.startsWith('/')) {
      config.url = `/${config.url}`;
    }

    let additionalHeaders = {};
    if (config.serviceToken) {
      additionalHeaders = {
        Authorization: `Bearer ${config.serviceToken}`
      };
    }

    config.headers = {
      ...config.headers,
      Authorization: !config.serviceToken ? `Bearer ${getAccessToken()}` : `Bearer ${config.serviceToken}`,
      ...additionalHeaders
    } as AxiosRequestHeaders & TAxiosRequestHeadersWithCoords;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401 && !window.location.href.includes('/login')) {
      window.location.pathname = '/login';
    }
    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;
