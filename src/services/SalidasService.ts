const API_URL = 'https://unipass.isdapps.uk';

export const getStatsSalidas = async (matriculaPreceptor?: string) => {
  if (matriculaPreceptor) {
    const response = await fetch(`${API_URL}/dashboardPermission/${matriculaPreceptor}`);
    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  } else {
    // Endpoint global para coordinación
    const response = await fetch(`${API_URL}/dashboardPermission`);
    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  }
};

export const getSalidasAlumnos = async (matriculaPreceptor?: string, params?: Record<string, string>) => {
  let url = matriculaPreceptor
    ? `${API_URL}/permissions/filter/${matriculaPreceptor}`
    : `${API_URL}/permissions/filter`;
  if (params) {
    const query = new URLSearchParams(params).toString();
    url += `?${query}`;
  }
  const response = await fetch(url);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};