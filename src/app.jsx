// src/app.jsx
import { Header } from './components/header';
import { Footer } from './components/footer';
import './styles/app.css';

function App() {
  return (
    <div className="page">
      <Header />

      <main className="main">
        <section className="hero">
          <div className="hero_card">
            <p className="hero_title">
              CLASES ONLINE<br />
              PERSONALIZADAS<br />
              DE MATEMÁTICAS<br />
              FÍSICA QUÍMICA<br />
              E INGLÉS
            </p>
            <p className="hero_subtitle">
              DE COLEGIO A NIVEL<br />
              UNIVERSITARIO
            </p>
          </div>
        </section>

        <section className="middle" />
      </main>

      <Footer />
    </div>
  );
}

export default App;
