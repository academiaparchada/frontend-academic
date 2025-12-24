// src/App.jsx
import { Header } from './components/header';
import { Footer } from './components/footer';
import { Login } from './pages/Login';
import './styles/App.css';

function App() {
  return (
    <div className="pa-page">
      <Header />

      <main className="pa-main">
        <Login />
      </main>

      <Footer />
    </div>
  );
}

export default App;
