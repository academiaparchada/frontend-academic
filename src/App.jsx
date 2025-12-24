// src/App.jsx
import { Header } from './components/header';
import { Footer } from './components/footer';
import './styles/App.css';

function App() {
  return (
    <div className="pa-page">
      <Header />

      <main className="pa-main">
        <section className="pa-hero">
          <div className="pa-hero__card">
            <p className="pa-hero__title">
              CLASES ONLINE<br />
              PERSONALIZADAS<br />
              DE MATEMÁTICAS<br />
              FÍSICA QUÍMICA<br />
              E INGLÉS
            </p>
            <p className="pa-hero__subtitle">
              DE COLEGIO A NIVEL<br />
              UNIVERSITARIO
            </p>
          </div>
        </section>

        <section className="pa-middle" />
      </main>

      <Footer />
    </div>
  );
}

export default App;
