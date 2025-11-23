import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

export const Home: React.FC = () => {
    return (
        <div className="home-container">
            <h1 className="home-title">CSP Visualizer</h1>
            <p className="home-subtitle">Experience the beauty of constraint satisfaction</p>

            <div className="cards-container">
                <Link to="/nqueens" className="game-card-link">
                    <div className="game-card">
                        <span className="card-icon">♛</span>
                        <h2 className="card-title">N-Queens</h2>
                        <span className="card-desc">Place queens without conflict</span>
                    </div>
                </Link>

                <Link to="/kenken" className="game-card-link">
                    <div className="game-card">
                        <span className="card-icon">🔢</span>
                        <h2 className="card-title">KenKen</h2>
                        <span className="card-desc">Math logic puzzles</span>
                    </div>
                </Link>
            </div>
        </div>
    );
};
