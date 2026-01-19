// src/utils/wompi_widget.js

const WOMPI_SCRIPT_SRC = 'https://checkout.wompi.co/widget.js';
const WOMPI_PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY;

let wompiScriptPromise = null;

export function loadWompiScript() {
  if (window.WidgetCheckout) return Promise.resolve(true);

  if (wompiScriptPromise) return wompiScriptPromise;

  wompiScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${WOMPI_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = WOMPI_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      console.log('✅ Script Wompi cargado');
      resolve(true);
    };
    script.onerror = () => {
      console.error('❌ Error cargando script Wompi');
      reject(new Error('No se pudo cargar el script de Wompi'));
    };
    document.body.appendChild(script);
  });

  return wompiScriptPromise;
}

/**
 * Abre el widget de Wompi
 * @param {Object} checkoutData - Datos del checkout desde backend
 */
export async function openWompiWidget(checkoutData) {
  console.log('🚀 openWompiWidget llamado con:', checkoutData);

  if (!checkoutData) {
    console.error('❌ checkoutData es null/undefined');
    throw new Error('checkoutData es requerido');
  }

  // ✅ Validar que exista la publicKey en .env
  if (!WOMPI_PUBLIC_KEY) {
    console.error('❌ VITE_WOMPI_PUBLIC_KEY no configurada en .env');
    alert('Error: Configura VITE_WOMPI_PUBLIC_KEY en el archivo .env');
    return;
  }

  await loadWompiScript();

  if (!window.WidgetCheckout) {
    throw new Error('WidgetCheckout no está disponible. Revisa carga de script Wompi.');
  }

  const {
    compraId,
    amount_in_cents,
    currency,
    reference,
    signature_integrity
  } = checkoutData;

  // Validaciones
  if (!compraId) {
    console.error('❌ compraId faltante');
    throw new Error('compraId es requerido');
  }

  if (!amount_in_cents) {
    console.error('❌ amount_in_cents faltante');
    throw new Error('amount_in_cents es requerido');
  }

  console.log('✅ Datos validados:');
  console.log('  - publicKey (del .env):', WOMPI_PUBLIC_KEY);
  console.log('  - amount_in_cents:', amount_in_cents);
  console.log('  - reference:', reference);
  console.log('  - compraId:', compraId);

  // ✅ Crear widget con publicKey del .env
  const widget = new window.WidgetCheckout({
    currency: currency || 'COP',
    amountInCents: Number(amount_in_cents),
    reference: reference || compraId,
    publicKey: WOMPI_PUBLIC_KEY, // ✅ DESDE .ENV
    ...(signature_integrity ? { signature: { integrity: signature_integrity } } : {})
  });

  console.log('✅ Widget creado correctamente');

  // ✅ Redirects dinámicos (localhost en dev, producción en prod)
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const baseUrl = isDev ? 'http://localhost:5173' : window.location.origin;

  const redirects = {
    success: `${baseUrl}/pago-exitoso?compraId=${compraId}`,
    pending: `${baseUrl}/pago-pendiente?compraId=${compraId}`,
    failure: `${baseUrl}/pago-fallido?compraId=${compraId}`
  };

  console.log('📍 Redirects configurados:', redirects);

  widget.open((result) => {
    console.log('🎯 Widget cerrado, callback ejecutado:', result);

    const status = result?.transaction?.status;
    console.log('📊 Status de transacción:', status);

    // APPROVED → success
    if (status === 'APPROVED') {
      console.log('✅ APPROVED → redirigiendo a success');
      window.location.href = redirects.success;
      return;
    }

    // DECLINED, ERROR, VOIDED → failure
    if (status === 'DECLINED' || status === 'ERROR' || status === 'VOIDED') {
      console.log('❌ Rechazado → redirigiendo a failure');
      window.location.href = redirects.failure;
      return;
    }

    // ✅ PENDING o sin status → pending (polling determinará estado final)
    console.log('⏳ PENDING o sin status → redirigiendo a pending');
    window.location.href = redirects.pending;
  });

  console.log('🎬 Widget abierto, esperando interacción del usuario...');
}
