export const formatUsd = (value) =>
  new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));

export const formatBs = (value) =>
  new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
