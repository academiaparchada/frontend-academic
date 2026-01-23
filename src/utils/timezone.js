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
 * Lista de zonas horarias comunes en Latinoamérica (fallback / sugeridas)
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
 * NUEVO: lista "bonita" prioritaria para usuarios en español.
 * Importante: value SIEMPRE es IANA; label es lo que ve el usuario.
 * (Puedes ajustar nombres/regiones sin afectar backend.)
 */
const TIMEZONES_PREFERRED_ES = [
  // LATAM (bonito por país / regiones donde aplica)
  { value: 'America/Bogota', label: 'Colombia' },
  { value: 'America/Mexico_City', label: 'México (Centro)' },
  { value: 'America/Cancun', label: 'México (Sureste)' },
  { value: 'America/Mazatlan', label: 'México (Pacífico)' },
  { value: 'America/Tijuana', label: 'México (Noroeste)' },

  { value: 'America/Guatemala', label: 'Guatemala' },
  { value: 'America/El_Salvador', label: 'El Salvador' },
  { value: 'America/Tegucigalpa', label: 'Honduras' },
  { value: 'America/Managua', label: 'Nicaragua' },
  { value: 'America/Costa_Rica', label: 'Costa Rica' },
  { value: 'America/Panama', label: 'Panamá' },

  { value: 'America/Havana', label: 'Cuba' },
  { value: 'America/Santo_Domingo', label: 'República Dominicana' },
  { value: 'America/Puerto_Rico', label: 'Puerto Rico' },

  { value: 'America/Caracas', label: 'Venezuela' },
  { value: 'America/Lima', label: 'Perú' },
  { value: 'America/Guayaquil', label: 'Ecuador' },
  { value: 'America/La_Paz', label: 'Bolivia' },
  { value: 'America/Asuncion', label: 'Paraguay' },
  { value: 'America/Montevideo', label: 'Uruguay' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina' },
  { value: 'America/Santiago', label: 'Chile' },

  // Brasil (en español; regiones comunes)
  { value: 'America/Sao_Paulo', label: 'Brasil (São Paulo)' },
  { value: 'America/Manaus', label: 'Brasil (Amazonas)' },
  { value: 'America/Cuiaba', label: 'Brasil (Mato Grosso)' },
  { value: 'America/Fortaleza', label: 'Brasil (Nordeste)' },

  // España
  { value: 'Europe/Madrid', label: 'España (Península)' },
  { value: 'Atlantic/Canary', label: 'España (Canarias)' },

  // USA (por zonas)
  { value: 'America/New_York', label: 'Estados Unidos (Este)' },
  { value: 'America/Chicago', label: 'Estados Unidos (Central)' },
  { value: 'America/Denver', label: 'Estados Unidos (Montaña)' },
  { value: 'America/Los_Angeles', label: 'Estados Unidos (Pacífico)' },
  { value: 'America/Anchorage', label: 'Estados Unidos (Alaska)' },
  { value: 'Pacific/Honolulu', label: 'Estados Unidos (Hawái)' },

  // Otros países donde probablemente compren en español
  { value: 'Europe/Lisbon', label: 'Portugal' },
  { value: 'Europe/Paris', label: 'Francia' },
  { value: 'Europe/Rome', label: 'Italia' },
  { value: 'Europe/Berlin', label: 'Alemania' },
  { value: 'Europe/London', label: 'Reino Unido' },

  // Canadá (comunes)
  { value: 'America/Toronto', label: 'Canadá (Este)' },
  { value: 'America/Vancouver', label: 'Canadá (Pacífico)' }
];

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

/**
 * Devuelve todas las timezones IANA soportadas por el runtime (cuando existe),
 * para poblar un selector global sin hardcodear cientos de zonas.
 *
 * Si el navegador no soporta Intl.supportedValuesOf('timeZone'), retorna un fallback.
 * @returns {string[]} Lista de timezones IANA
 */
export const getAllSupportedTimeZones = () => {
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
      const zones = Intl.supportedValuesOf('timeZone');
      if (Array.isArray(zones) && zones.length > 0) {
        return zones;
      }
    }
  } catch (error) {
    console.error('Error obteniendo lista global de timezones:', error);
  }

  const fallback = TIMEZONES_LATAM?.map(t => t.value) || [];
  const browserTZ = getBrowserTimeZone();
  return Array.from(new Set([browserTZ, ...fallback].filter(Boolean)));
};

/**
 * Devuelve lista de opciones para <select>.
 * - Primero: lista bonita (país/región + GMT).
 * - Luego: resto de zonas globales como "America/Chicago (GMT-6)".
 *
 * @returns {{value: string, label: string}[]}
 */
export const getAllTimeZoneOptions = () => {
  const supported = getAllSupportedTimeZones();

  // Preferidas (solo si existen en el runtime)
  const preferred = TIMEZONES_PREFERRED_ES
    .filter(item => supported.includes(item.value))
    .map(item => {
      const offset = getTimeZoneOffset(item.value);
      return {
        value: item.value,
        label: offset ? `${item.label} (${offset})` : item.label
      };
    });

  const preferredValues = new Set(preferred.map(p => p.value));

  // Resto (global)
  const rest = supported
    .filter(tz => !preferredValues.has(tz))
    .map(tz => {
      const offset = getTimeZoneOffset(tz);
      const label = offset ? `${tz} (${offset})` : tz;
      return { value: tz, label };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return [...preferred, ...rest];
};

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
