import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontFamily: 'Inter, sans-serif',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '2rem', color: '#2c3e50' }}>CSP Visualizer</h1>
            <p style={{ fontSize: '1.5rem', marginBottom: '3rem', color: '#34495e' }}>Which game do you want to play?</p>

            <div style={{ display: 'flex', gap: '2rem' }}>
                <Link to="/nqueens" style={{ textDecoration: 'none' }}>
                    <div style={{
                        padding: '2rem',
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '200px',
                        transition: 'transform 0.2s'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>♛</span>
                        <h2 style={{ color: '#2c3e50' }}>N-Queens</h2>
                    </div>
                </Link>

                <Link to="/kenken" style={{ textDecoration: 'none' }}>
                    <div style={{
                        padding: '2rem',
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '200px',
                        transition: 'transform 0.2s'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔢</span>
                        <h2 style={{ color: '#2c3e50' }}>KenKen</h2>
                    </div>
                </Link>
            </div>
        </div>
    );
};
