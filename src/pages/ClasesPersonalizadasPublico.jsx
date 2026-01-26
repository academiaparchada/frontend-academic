// src/pages/ClasesPersonalizadasPublico.jsx
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

  useEffect(() => {
    cargarClases();
    cargarCategorias();
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

      const resultado = await clasesPersonalizadasService.listarClases();

      console.log('Resultado completo:', resultado);

      if (resultado.success) {
        setClases(resultado.data.clases || []);
        console.log('Clases cargadas:', resultado.data.clases);
      } else {
        setError(resultado.message || 'Error al cargar las clases');
        console.error('Error en la respuesta:', resultado.message);
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

  const clasesPorCategoria = useMemo(() => {
    const map = new Map();

    const getCategoriaId = (clase) =>
      clase?.categoria?.id || clase?.categoria_id || null;

    const getCategoriaNombre = (clase) =>
      clase?.categoria?.nombre || null;

    clases.forEach((clase) => {
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
        <header className="clases-header">
          <h1>Clases Personalizadas</h1>
          <p>Clases individuales adaptadas a tus necesidades</p>
        </header>

        {clasesPorCategoria.map((seccion) => (
          <section key={seccion.id || seccion.nombre} className="categoria-seccion">
            <div className="categoria-header">
              <h2 className="categoria-titulo">{seccion.nombre}</h2>
            </div>

            <div className="clases-grid">
              {seccion.clases.map((clase) => (
                <div key={clase.id} className="clase-card">
                  {/* IMAGEN / FALLBACK */}
                  {clase.imagen_url ? (
                    <div className="clase-imagen">
                      <img
                        src={clase.imagen_url}
                        alt={`Imagen de ${clase.asignatura?.nombre || 'clase personalizada'}`}
                        loading="lazy"
                        onError={(e) => {
                          // si falla la carga, ocultar imagen y dejar que el layout siga normal
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="clase-icon">📚</div>
                  )}

                  <h3>{clase.asignatura?.nombre || 'Asignatura'}</h3>

                  <div className="clase-info">
                    <div className="info-item">
                      <span className="icon">⏱️</span>
                      <span>{clase.duracion_horas} hora(s)</span>
                    </div>

                    <div className="info-item">
                      <span className="icon">👥</span>
                      <span>Individual</span>
                    </div>

                    <div className="info-item">
                      <span className="icon">🎯</span>
                      <span>Virtual</span>
                    </div>
                  </div>

                  <div className="precio-container">
                    <span className="precio-label">Precio por clase</span>
                    <span className="precio-valor">
                      {clasesPersonalizadasService.formatearPrecio(clase.precio)}
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
              ))}
            </div>
          </section>
        ))}

        {clases.length === 0 && (
          <div className="sin-clases">
            <h3>📝 No hay clases disponibles</h3>
            <p>Pronto agregaremos nuevas materias</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ClasesPersonalizadasPublico;
