// src/services/api.js
export const API_BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL || 'https://api.parcheacademico.com/api';

export const getToken = () => localStorage.getItem('token');

export const buildQuery = (params = {}) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    sp.append(k, v);
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
};

export const apiFetch = async (path, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // ignore
  }

  if (!res.ok) {
    return {
      success: false,
      status: res.status,
      message: data?.message || 'Error de servidor',
      data,
    };
  }

  return data || { success: true };
};
