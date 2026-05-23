import axios from 'axios';

const ENV_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';

const FALLBACK_BACKEND_ORIGIN =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:3000';

export const BACKEND_ORIGIN = (ENV_API_BASE_URL || FALLBACK_BACKEND_ORIGIN).replace(/\/+$/, '');
export const API_BASE_URL = BACKEND_ORIGIN;

export function resolveBackendFileUrl(filePath) {
  if (!filePath) return '';
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const normalized = filePath.startsWith('/file/')
    ? filePath
    : `/file/${filePath.replace(/^\/+/, '')}`;

  return `${BACKEND_ORIGIN}${normalized}`;
}

const IS_DEV = import.meta.env.DEV;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 800;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const uploadApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 0,
  headers: {
    Accept: 'application/json',
  },
});

function getToken() {
  return localStorage.getItem('token');
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function translateError(error) {
  const status = error?.response?.status;
  const serverMsg = error?.response?.data?.message;

  if (!status) {
    if (error?.code === 'ECONNABORTED') {
      return "So'rov muddati tugadi. Internet aloqangizni tekshiring.";
    }
    return "Server bilan ulanib bo'lmadi. Internet aloqangizni tekshiring.";
  }

  switch (status) {
    case 400:
      return serverMsg || "Noto'g'ri so'rov. Ma'lumotlarni tekshiring.";
    case 401:
      return 'Sessiya muddati tugadi. Qayta kiring.';
    case 403:
      return "Bu amalni bajarishga ruxsatingiz yo'q.";
    case 404:
      return serverMsg || "So'ralgan ma'lumot topilmadi.";
    case 409:
      return serverMsg || "Bunday ma'lumot allaqachon mavjud.";
    case 422:
      return serverMsg || "Kiritilgan ma'lumotlar noto'g'ri.";
    case 429:
      return "Juda ko'p so'rov yuborildi. Biroz kuting.";
    case 500:
      return "Server xatosi yuz berdi. Keyinroq urinib ko'ring.";
    case 502:
    case 503:
    case 504:
      return "Server vaqtincha ishlamayapti. Keyinroq urinib ko'ring.";
    default:
      return serverMsg || `Xatolik yuz berdi (${status}).`;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestInterceptor(config) {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  config._retryCount = config._retryCount ?? 0;

  if (IS_DEV) {
    const { method, url, params, data } = config;
    console.groupCollapsed(
      `%c↑ ${method?.toUpperCase()} ${url}`,
      'color:#3b82f6;font-weight:700;',
    );
    if (params) console.log('params', params);
    if (data) console.log('body', data);
    console.groupEnd();
  }

  return config;
}

api.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
uploadApi.interceptors.request.use(
  requestInterceptor,
  (error) => Promise.reject(error),
);

function responseSuccess(response) {
  if (IS_DEV) {
    console.log(
      `%c↓ ${response.status} ${response.config.url}`,
      'color:#10b981;font-weight:700;',
      response.data,
    );
  }
  return response;
}

async function responseError(error) {
  const config = error.config;
  const status = error?.response?.status;

  if (IS_DEV) {
    console.groupCollapsed(
      `%c✖ ${status ?? 'NET'} ${config?.url ?? ''}`,
      'color:#ef4444;font-weight:700;',
    );
    console.error(error?.response?.data ?? error.message);
    console.groupEnd();
  }

  const isNetworkError = !error.response;
  const isServerError = status >= 500 && status < 600;
  const canRetry =
    config &&
    (isNetworkError || isServerError) &&
    config._retryCount < MAX_RETRIES &&
    !config._isUpload;

  if (canRetry) {
    config._retryCount += 1;
    const wait = RETRY_DELAY_MS * config._retryCount;
    if (IS_DEV) {
      console.warn(`↩ Retrying (${config._retryCount}/${MAX_RETRIES}) in ${wait}ms...`);
    }
    await delay(wait);
    return api(config);
  }

  if (status === 401) {
    clearSession();
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  error.userMessage = translateError(error);
  return Promise.reject(error);
}

api.interceptors.response.use(responseSuccess, responseError);
uploadApi.interceptors.response.use(responseSuccess, responseError);

export const get = (url, config) => api.get(url, config);
export const post = (url, data, config) => api.post(url, data, config);
export const put = (url, data, config) => api.put(url, data, config);
export const patch = (url, data, config) => api.patch(url, data, config);
export const del = (url, config) => api.delete(url, config);

export default api;
