// src/App.jsx
import { Outlet } from 'react-router-dom';
import { Header } from './components/header';
import { Footer } from './components/footer';
import './styles/App.css';

function App() {
  return (
    <div className="pa-page">
      <Header />

      <main className="pa-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default App;
