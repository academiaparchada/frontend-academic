import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import clasesPersonalizadasService from '../services/clases_personalizadas_service';
import comprasService from '../services/compras_service';
import '../styles/ClasesPublico.css';

const ClasesPersonalizadasPublico = () => {
  const navigate = useNavigate();
  const [clases, setClases] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // búsqueda + filtro por sección
  const [busqueda, setBusqueda] = useState('');
  const [seccionSeleccionada, setSeccionSeleccionada] = useState('todas'); // 'todas' | categoriaId | 'sin_categoria'

  // Función para truncar texto con límite de caracteres
  const truncarTexto = (texto, limite = 150) => {
    if (!texto) return '';
    const textoLimpio = String(texto).trim();
    if (textoLimpio.length <= limite) return textoLimpio;
    return textoLimpio.substring(0, limite).trim() + '...';
  };

  useEffect(() => {
    cargarClases();
    cargarCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const res = await fetch('https://api.parcheacademico.com/api/categorias');
      const data = await res.json();

      if (res.ok && data?.success) {
        setCategorias(Array.isArray(data?.data?.categorias) ? data.data.categorias : []);
      } else {
        setCategorias([]);
      }
    } catch (e) {
      setCategorias([]);
    } finally {
      setLoadingCategorias(false);
    }
  };

  const cargarClases = async () => {
    try {
      setLoading(true);
      setError(null);

      const resultado = await clasesPersonalizadasService.listarTodasClases();

      if (resultado.success) {
        setClases(resultado.data.clases || []);
      } else {
        setError(resultado.message || 'Error al cargar las clases');
      }
    } catch (err) {
      console.error('Error al cargar clases:', err);
      setError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleComprarClase = (clase) => {
    navigate(`/checkout/clase/${clase.id}`);
  };

  const handleComprarPaquete = (clase) => {
    navigate(`/checkout/paquete/${clase.id}`);
  };

  // NUEVO: normalización para búsqueda (quita tildes/acentos, etc.)
  const normalizar = (str) => {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // diacríticos [web:53]
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // NUEVO: Levenshtein (para tolerar errores de tipeo) [web:52]
  const levenshtein = (a, b) => {
    if (a === b) return 0;
    if (!a) return b.length;
    if (!b) return a.length;

    const m = a.length;
    const n = b.length;
    const dp = new Array(n + 1);

    for (let j = 0; j <= n; j++) dp[j] = j;

    for (let i = 1; i <= m; i++) {
      let prev = dp[0];
      dp[0] = i;
      for (let j = 1; j <= n; j++) {
        const temp = dp[j];
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[j] = Math.min(
          dp[j] + 1,        // delete
          dp[j - 1] + 1,    // insert
          prev + cost       // replace
        );
        prev = temp;
      }
    }
    return dp[n];
  };

  // NUEVO: matching mejorado
  const coincideBusqueda = (query, target) => {
    const q = normalizar(query);
    if (!q) return true;

    const t = normalizar(target);
    if (!t) return false;

    // 1) match rápido por substring
    if (t.includes(q)) return true;

    // 2) match por tokens (cada token del query debe “encontrarse” en algún token del target)
    const qTokens = q.split(' ').filter(Boolean);
    const tTokens = t.split(' ').filter(Boolean);

    return qTokens.every((qt) => {
      // si el token es muy corto, exigir substring exacto (evita falsos positivos con 1-2 letras)
      if (qt.length <= 2) {
        return tTokens.some((tt) => tt.includes(qt));
      }

      // umbral dinámico: tolera 1-2 errores dependiendo del tamaño del token
      const maxDist = qt.length <= 5 ? 1 : 2;

      return tTokens.some((tt) => {
        if (tt.includes(qt)) return true; // "organ" en "organica"
        const dist = levenshtein(qt, tt);
        return dist <= maxDist;
      });
    });
  };

  // lista de clases filtradas (por nombre + por sección)
  const clasesFiltradas = useMemo(() => {
    const getCategoriaId = (clase) =>
      clase?.categoria?.id || clase?.categoria_id || null;

    return (clases || []).filter((clase) => {
      const nombreAsignatura = String(clase?.asignatura?.nombre || '');

      const pasaBusqueda = coincideBusqueda(busqueda, nombreAsignatura);

      const catId = getCategoriaId(clase);
      const key = catId || 'sin_categoria';

      const pasaSeccion =
        seccionSeleccionada === 'todas' || key === seccionSeleccionada;

      return pasaBusqueda && pasaSeccion;
    });
  }, [clases, busqueda, seccionSeleccionada]);

  // Construir secciones (categorías) a partir de clasesFiltradas
  const clasesPorCategoria = useMemo(() => {
    const map = new Map();

    const getCategoriaId = (clase) =>
      clase?.categoria?.id || clase?.categoria_id || null;

    const getCategoriaNombre = (clase) =>
      clase?.categoria?.nombre || null;

    clasesFiltradas.forEach((clase) => {
      const catId = getCategoriaId(clase);
      const catNombreDirecto = getCategoriaNombre(clase);

      const key = catId || 'sin_categoria';
      if (!map.has(key)) {
        map.set(key, {
          id: catId,
          nombre: catNombreDirecto || null,
          clases: []
        });
      }
      map.get(key).clases.push(clase);
    });

    // Resolver nombres con la lista de categorias (si el item no trae categoria embebida)
    const categoriasById = new Map((categorias || []).map((c) => [c.id, c]));
    const secciones = Array.from(map.values()).map((sec) => {
      if (!sec.nombre && sec.id && categoriasById.has(sec.id)) {
        sec.nombre = categoriasById.get(sec.id).nombre;
      }
      if (!sec.nombre) sec.nombre = 'Otras';
      return sec;
    });

    // Orden: primero categorías del backend, luego "Otras"
    const orden = new Map((categorias || []).map((c, idx) => [c.id, idx]));
    secciones.sort((a, b) => {
      const aRank = a.id && orden.has(a.id) ? orden.get(a.id) : 9999;
      const bRank = b.id && orden.has(b.id) ? orden.get(b.id) : 9999;
      if (aRank !== bRank) return aRank - bRank;
      return a.nombre.localeCompare(b.nombre);
    });

    return secciones;
  }, [clasesFiltradas, categorias]);

  // opciones del select (solo secciones que realmente existen en las clases cargadas)
  const opcionesSeccion = useMemo(() => {
    const getCategoriaId = (clase) =>
      clase?.categoria?.id || clase?.categoria_id || null;

    const categoriasById = new Map((categorias || []).map((c) => [c.id, c.nombre]));

    const keys = new Set();
    (clases || []).forEach((clase) => {
      const catId = getCategoriaId(clase);
      keys.add(catId || 'sin_categoria');
    });

    const opts = [];

    (categorias || []).forEach((c) => {
      if (keys.has(c.id)) {
        opts.push({ value: c.id, label: c.nombre });
      }
    });

    if (keys.has('sin_categoria')) {
      opts.push({ value: 'sin_categoria', label: 'Otras' });
    }

    keys.forEach((k) => {
      if (k !== 'sin_categoria' && !categoriasById.has(k) && !opts.some(o => o.value === k)) {
        opts.push({ value: k, label: 'Otras' });
      }
    });

    return opts;
  }, [clases, categorias]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="clases-publico-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando clases...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="clases-publico-container">
          <div className="error-container">
            <h3>❌ Error</h3>
            <p>{error}</p>
            <button onClick={cargarClases} className="btn-retry">
              Reintentar
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="clases-publico-container">
        <div className="mis-clases-header">
          <div>
            <h1>Clases Personalizadas</h1>
            <p>Clases individuales adaptadas a tus necesidades</p>

            <div className="clases-filtros-publico">
              <input
                type="text"
                className="clases-buscador-input"
                placeholder="Buscar por nombre de asignatura..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

              <select
                className="clases-seccion-select"
                value={seccionSeleccionada}
                onChange={(e) => setSeccionSeleccionada(e.target.value)}
                disabled={loadingCategorias}
              >
                <option value="todas">
                  {loadingCategorias ? 'Cargando secciones...' : 'Todas las secciones'}
                </option>
                {opcionesSeccion.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="header-buttons">
            <button className="btn-volver" onClick={() => navigate('/estudiante/dashboard')}>
              ← Volver
            </button>
          </div>
        </div>

        {clasesPorCategoria.map((seccion) => (
          <section key={seccion.id || seccion.nombre} className="categoria-seccion">
            <div className="categoria-header">
              <h2 className="categoria-titulo">{seccion.nombre}</h2>
            </div>

            <div className="clases-grid">
              {seccion.clases.map((clase) => {
                const descripcionAsignatura =
                  (clase?.descripcion_asignatura && String(clase.descripcion_asignatura).trim()) ||
                  (clase?.asignatura?.descripcion && String(clase.asignatura.descripcion).trim()) ||
                  '';

                return (
                  <div key={clase.id} className="clase-card">
                    {clase.imagen_url ? (
                      <div className="clase-imagen">
                        <img
                          src={clase.imagen_url}
                          alt={`Imagen de ${clase.asignatura?.nombre || 'clase personalizada'}`}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="clase-icon">📚</div>
                    )}

                    <h3>{clase.asignatura?.nombre || 'Asignatura'}</h3>

                    {descripcionAsignatura && (
                      <div className="info-item descripcion-preview">
                        <span>{truncarTexto(descripcionAsignatura, 190)}</span>
                      </div>
                    )}

                    <div className="clase-info">
                      <div className="info-item">
                        <span className="icon">⏱️</span>
                        <span>{clase.duracion_horas} hora(s)</span>
                      </div>

                      <div className="info-item">
                        <span className="icon">👥</span>
                        <span>Individual</span>
                      </div>
                    </div>

                    <div className="precio-container">
                      <span className="precio-label">Precio por clase</span>
                      <span className="precio-valor">
                        {comprasService.formatearPrecio(clase.precio)}
                      </span>
                    </div>

                    <div className="clase-acciones">
                      <button
                        className="btn-comprar-clase"
                        onClick={() => handleComprarClase(clase)}
                      >
                        Comprar 1 Clase
                      </button>
                      <button
                        className="btn-comprar-paquete"
                        onClick={() => handleComprarPaquete(clase)}
                      >
                        📦 Comprar Paquete
                      </button>
                    </div>

                    <p className="ventaja-paquete">
                      💡 Con el paquete puedes agendar tus clases cuando quieras
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {clasesFiltradas.length === 0 && (
          <div className="sin-clases">
            <h3>📝 No hay clases disponibles</h3>
            <p>Prueba con otra búsqueda o cambia la sección.</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ClasesPersonalizadasPublico;
