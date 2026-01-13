// src/utils/timezone.js

/**
 * Obtiene la zona horaria del navegador del usuario
 * @returns {string} Zona horaria en formato IANA (ej: "America/Bogota")
 */
export const getBrowserTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota';
  } catch (error) {
    console.error('Error obteniendo timezone del navegador:', error);
    return 'America/Bogota';
  }
};

/**
 * Lista de zonas horarias comunes en Latinoamérica
 * Para mostrar en un selector si se desea
 */
export const TIMEZONES_LATAM = [
  { value: 'America/Bogota', label: 'Colombia (GMT-5)' },
  { value: 'America/Mexico_City', label: 'México (GMT-6)' },
  { value: 'America/Lima', label: 'Perú (GMT-5)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (GMT-3)' },
  { value: 'America/Santiago', label: 'Chile (GMT-3)' },
  { value: 'America/Caracas', label: 'Venezuela (GMT-4)' },
  { value: 'America/Guayaquil', label: 'Ecuador (GMT-5)' },
  { value: 'America/Panama', label: 'Panamá (GMT-5)' },
  { value: 'America/Costa_Rica', label: 'Costa Rica (GMT-6)' },
  { value: 'America/Guatemala', label: 'Guatemala (GMT-6)' },
  { value: 'America/Managua', label: 'Nicaragua (GMT-6)' },
  { value: 'America/Tegucigalpa', label: 'Honduras (GMT-6)' },
  { value: 'America/El_Salvador', label: 'El Salvador (GMT-6)' },
  { value: 'America/Montevideo', label: 'Uruguay (GMT-3)' },
  { value: 'America/La_Paz', label: 'Bolivia (GMT-4)' },
  { value: 'America/Asuncion', label: 'Paraguay (GMT-4)' },
  { value: 'America/Havana', label: 'Cuba (GMT-5)' },
  { value: 'America/Santo_Domingo', label: 'República Dominicana (GMT-4)' },
  { value: 'America/Puerto_Rico', label: 'Puerto Rico (GMT-4)' },
  { value: 'America/Sao_Paulo', label: 'Brasil - São Paulo (GMT-3)' }
];

/**
 * Valida si una zona horaria es válida según IANA
 * @param {string} timezone - Zona horaria a validar
 * @returns {boolean}
 */
export const isValidTimeZone = (timezone) => {
  if (!timezone) return false;
  
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Formatea una fecha ISO según la zona horaria del usuario
 * @param {string} isoDate - Fecha en formato ISO
 * @param {string} timezone - Zona horaria IANA
 * @returns {string} Fecha formateada
 */
export const formatDateInTimeZone = (isoDate, timezone = 'America/Bogota') => {
  if (!isoDate) return 'No especificada';
  
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return isoDate;
  }
};

/**
 * Obtiene el offset de una zona horaria en formato legible
 * @param {string} timezone - Zona horaria IANA
 * @returns {string} Offset (ej: "GMT-5")
 */
export const getTimeZoneOffset = (timezone) => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    
    const parts = formatter.formatToParts(now);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName');
    
    return timeZoneName ? timeZoneName.value : '';
  } catch (error) {
    return '';
  }
};
