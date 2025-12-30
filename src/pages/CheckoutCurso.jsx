// src/pages/CheckoutCurso.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import cursosService from '../services/cursos_service';
import comprasService from '../services/compras_service';
import '../styles/Checkout.css';

const CheckoutCurso = () => {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  // Verificar si está autenticado
  const token = localStorage.getItem('token');
  const [esNuevoUsuario, setEsNuevoUsuario] = useState(!token);

  // Formulario de usuario nuevo
  const [datosUsuario, setDatosUsuario] = useState({
    email: '',
    nombre: '',
    apellido: '',
    telefono: '',
    password: '',
    confirmarPassword: ''
  });

  const [erroresUsuario, setErroresUsuario] = useState({});

  useEffect(() => {
    cargarCurso();
  }, [cursoId]);

  const cargarCurso = async () => {
    try {
      setLoading(true);
      const resultado = await cursosService.obtenerCurso(cursoId);
      
      if (resultado.success) {
        setCurso(resultado.data.curso);
      } else {
        setError(resultado.message);
      }
    } catch (err) {
      console.error('Error al cargar curso:', err);
      setError('Error al cargar el curso');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUsuario = (e) => {
    const { name, value } = e.target;
    setDatosUsuario(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo
    if (erroresUsuario[name]) {
      setErroresUsuario(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarFormulario = () => {
    if (!esNuevoUsuario) return true;

    const errores = {};

    if (!datosUsuario.email || !datosUsuario.email.includes('@')) {
      errores.email = 'Email inválido';
    }

    if (!datosUsuario.nombre.trim()) {
      errores.nombre = 'El nombre es obligatorio';
    }

    if (!datosUsuario.apellido.trim()) {
      errores.apellido = 'El apellido es obligatorio';
    }

    if (!datosUsuario.telefono.trim()) {
      errores.telefono = 'El teléfono es obligatorio';
    }

    if (datosUsuario.password.length < 6) {
      errores.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (datosUsuario.password !== datosUsuario.confirmarPassword) {
      errores.confirmarPassword = 'Las contraseñas no coinciden';
    }

    setErroresUsuario(errores);
    return Object.keys(errores).length === 0;
  };

  const handleComprar = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      setMensaje({ tipo: 'error', texto: 'Por favor corrige los errores del formulario' });
      return;
    }

    setProcesando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const estudianteData = esNuevoUsuario ? {
        email: datosUsuario.email,
        nombre: datosUsuario.nombre,
        apellido: datosUsuario.apellido,
        telefono: datosUsuario.telefono,
        password: datosUsuario.password
      } : null;

      const resultado = await comprasService.comprarCurso(cursoId, estudianteData);

      if (resultado.success) {
        setMensaje({ 
          tipo: 'exito', 
          texto: '¡Compra realizada exitosamente! Redirigiendo...' 
        });

        // Si es nuevo usuario, guardar token
        if (esNuevoUsuario && resultado.data.token) {
          localStorage.setItem('token', resultado.data.token);
        }

        setTimeout(() => {
          navigate('/estudiante/mis-cursos');
        }, 2000);
      } else {
        setMensaje({ tipo: 'error', texto: resultado.message });
      }
    } catch (err) {
      console.error('Error al procesar compra:', err);
      setMensaje({ tipo: 'error', texto: 'Error al procesar la compra' });
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error || !curso) {
    return (
      <div className="checkout-container">
        <div className="error-mensaje">
          <h3>❌ Error</h3>
          <p>{error || 'Curso no encontrado'}</p>
          <button onClick={() => navigate('/cursos')}>Volver a Cursos</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button className="btn-volver" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <h1>Finalizar Compra</h1>
      </div>

      <div className="checkout-content">
        {/* Resumen del curso */}
        <div className="checkout-resumen">
          <h2>📚 Resumen de Compra</h2>
          
          <div className="curso-info-checkout">
            <h3>{curso.nombre}</h3>
            <p className="curso-descripcion">{curso.descripcion}</p>
            
            <div className="detalles-grid">
              <div className="detalle-item">
                <span className="detalle-label">⏱️ Duración:</span>
                <span className="detalle-valor">{curso.duracion_horas} horas</span>
              </div>

              <div className="detalle-item">
                <span className="detalle-label">📚 Asignatura:</span>
                <span className="detalle-valor">{curso.asignatura?.nombre}</span>
              </div>

              {curso.profesor && (
                <div className="detalle-item">
                  <span className="detalle-label">👨‍🏫 Profesor:</span>
                  <span className="detalle-valor">
                    {curso.profesor.nombre} {curso.profesor.apellido}
                  </span>
                </div>
              )}

              {curso.fecha_inicio && (
                <div className="detalle-item">
                  <span className="detalle-label">📅 Inicio:</span>
                  <span className="detalle-valor">
                    {cursosService.formatearFecha(curso.fecha_inicio)}
                  </span>
                </div>
              )}
            </div>

            <div className="precio-total">
              <span>Total a Pagar:</span>
              <strong>{cursosService.formatearPrecio(curso.precio)}</strong>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="checkout-formulario">
          <form onSubmit={handleComprar}>
            {mensaje.texto && (
              <div className={`mensaje ${mensaje.tipo}`}>
                {mensaje.texto}
              </div>
            )}

            {esNuevoUsuario ? (
              <>
                <h2>👤 Tus Datos</h2>
                <p className="form-ayuda">
                  Crea tu cuenta para acceder al curso
                </p>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={datosUsuario.email}
                    onChange={handleChangeUsuario}
                    placeholder="tu@email.com"
                    disabled={procesando}
                    className={erroresUsuario.email ? 'input-error' : ''}
                  />
                  {erroresUsuario.email && (
                    <span className="error">{erroresUsuario.email}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={datosUsuario.nombre}
                      onChange={handleChangeUsuario}
                      placeholder="Juan"
                      disabled={procesando}
                      className={erroresUsuario.nombre ? 'input-error' : ''}
                    />
                    {erroresUsuario.nombre && (
                      <span className="error">{erroresUsuario.nombre}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Apellido *</label>
                    <input
                      type="text"
                      name="apellido"
                      value={datosUsuario.apellido}
                      onChange={handleChangeUsuario}
                      placeholder="Pérez"
                      disabled={procesando}
                      className={erroresUsuario.apellido ? 'input-error' : ''}
                    />
                    {erroresUsuario.apellido && (
                      <span className="error">{erroresUsuario.apellido}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Teléfono *</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={datosUsuario.telefono}
                    onChange={handleChangeUsuario}
                    placeholder="+573001234567"
                    disabled={procesando}
                    className={erroresUsuario.telefono ? 'input-error' : ''}
                  />
                  {erroresUsuario.telefono && (
                    <span className="error">{erroresUsuario.telefono}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Contraseña *</label>
                    <input
                      type="password"
                      name="password"
                      value={datosUsuario.password}
                      onChange={handleChangeUsuario}
                      placeholder="Mínimo 6 caracteres"
                      disabled={procesando}
                      className={erroresUsuario.password ? 'input-error' : ''}
                    />
                    {erroresUsuario.password && (
                      <span className="error">{erroresUsuario.password}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Confirmar Contraseña *</label>
                    <input
                      type="password"
                      name="confirmarPassword"
                      value={datosUsuario.confirmarPassword}
                      onChange={handleChangeUsuario}
                      placeholder="Repite tu contraseña"
                      disabled={procesando}
                      className={erroresUsuario.confirmarPassword ? 'input-error' : ''}
                    />
                    {erroresUsuario.confirmarPassword && (
                      <span className="error">{erroresUsuario.confirmarPassword}</span>
                    )}
                  </div>
                </div>

                <div className="ya-tienes-cuenta">
                  <p>
                    ¿Ya tienes cuenta? 
                    <button 
                      type="button" 
                      onClick={() => navigate('/login')}
                      className="btn-link"
                    >
                      Inicia sesión
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2>✅ Estás Listo</h2>
                <p className="form-ayuda">
                  Confirma tu compra para acceder al curso inmediatamente
                </p>
              </>
            )}

            <button 
              type="submit" 
              className="btn-comprar-final"
              disabled={procesando}
            >
              {procesando ? (
                <>
                  <div className="spinner-small"></div>
                  Procesando...
                </>
              ) : (
                <>💳 Confirmar Compra - {cursosService.formatearPrecio(curso.precio)}</>
              )}
            </button>

            <p className="aviso-pago">
              🔒 Pago seguro. Recibirás un email de confirmación.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCurso;
