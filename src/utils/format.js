// src/utils/format.js
export const formatCOP = (value) => {
  const n = Number(value || 0);
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
};

export const toYMD = (date) => {
  // date: Date
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
