import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { NQueensPage } from './pages/NQueens';
import { KenKenPage } from './pages/KenKen';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav style={{ padding: '1rem', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem', color: '#333' }}>FAI-App</Link>
          <div>
            <Link to="/" style={{ marginRight: '1rem', textDecoration: 'none', color: '#666' }}>Home</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nqueens" element={<NQueensPage />} />
          <Route path="/kenken" element={<KenKenPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
