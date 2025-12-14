import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../lib/DarkModeContext';
import { apiGet, Environment } from '../lib/api';

interface HeaderProps {
    title: string;
    subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
    const { darkMode, toggleDarkMode } = useDarkMode();
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [selectedEnv, setSelectedEnv] = useState('Production');

    useEffect(() => {
        apiGet<Environment[]>('/environments')
            .then(setEnvironments)
            .catch(console.error);
    }, []);

    return (
        <header className="header">
            <div className="header-left">
                <h2>{title}</h2>
                <p>{subtitle}</p>
            </div>
            <div className="header-right">
                <select
                    className="env-selector"
                    value={selectedEnv}
                    onChange={(e) => setSelectedEnv(e.target.value)}
                >
                    {environments.map(env => (
                        <option key={env.id} value={env.name}>{env.name}</option>
                    ))}
                </select>
                <div className="dark-mode-toggle" onClick={toggleDarkMode}>
                    <i className={darkMode ? 'fas fa-sun' : 'fas fa-moon'}></i>
                </div>
                <div className="user-info">
                    <div className="avatar">JD</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>John Doe</div>
                        <div style={{ color: '#7c8db0', fontSize: '12px', fontWeight: 600 }}>Publisher</div>
                    </div>
                </div>
            </div>
        </header>
    );
}
