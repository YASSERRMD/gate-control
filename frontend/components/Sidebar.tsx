import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Sidebar() {
    const router = useRouter();
    const isActive = (path: string) => router.pathname === path;

    const navSections = [
        {
            title: 'Overview',
            items: [
                { path: '/', label: 'Dashboard', icon: 'fa-chart-line' }
            ]
        },
        {
            title: 'Gateway Config',
            items: [
                { path: '/routes', label: 'Routes', icon: 'fa-route' },
                { path: '/services', label: 'Services', icon: 'fa-server' },
                { path: '/environments', label: 'Environments', icon: 'fa-layer-group' }
            ]
        },
        {
            title: 'Policies & Security',
            items: [
                { path: '/authentication', label: 'Authentication', icon: 'fa-key' },
                { path: '/rate-limiting', label: 'Rate Limiting', icon: 'fa-tachometer-alt' },
                { path: '/caching', label: 'Caching', icon: 'fa-database' },
                { path: '/qos', label: 'QoS & Circuit Breaker', icon: 'fa-shield-alt' },
                { path: '/load-balancing', label: 'Load Balancing', icon: 'fa-balance-scale' }
            ]
        },
        {
            title: 'Change Management',
            items: [
                { path: '/change-requests', label: 'Change Requests', icon: 'fa-tasks' },
                { path: '/publish-history', label: 'Publish History', icon: 'fa-history' }
            ]
        },
        {
            title: 'Validation & Testing',
            items: [
                { path: '/validator', label: 'Config Validator', icon: 'fa-check-circle' },
                { path: '/route-tester', label: 'Route Tester', icon: 'fa-vial' },
                { path: '/diff-viewer', label: 'Diff Viewer', icon: 'fa-code-branch' }
            ]
        },
        {
            title: 'Operations',
            items: [
                { path: '/gateway-health', label: 'Gateway Health', icon: 'fa-heartbeat' },
                { path: '/rollback', label: 'Rollback', icon: 'fa-undo' },
                { path: '/audit-logs', label: 'Audit Logs', icon: 'fa-clipboard-list' },
                { path: '/metrics', label: 'Metrics', icon: 'fa-chart-bar' }
            ]
        },
        {
            title: 'Administration',
            items: [
                { path: '/users', label: 'User Management', icon: 'fa-users' },
                { path: '/roles', label: 'Roles & Permissions', icon: 'fa-user-shield' },
                { path: '/settings', label: 'Settings', icon: 'fa-cog' }
            ]
        }
    ];

    return (
        <aside className="sidebar">
            <div className="logo">
                <div className="logo-content">
                    <h1>
                        <div className="logo-icon">
                            <i className="fas fa-network-wired"></i>
                        </div>
                        Ocelot Admin
                    </h1>
                    <p>Gateway Control Center</p>
                </div>
            </div>

            <div className="menu">
                {navSections.map((section) => (
                    <div key={section.title} className="menu-section">
                        <div className="menu-section-title">{section.title}</div>
                        {section.items.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                            >
                                <i className={`fas ${item.icon}`}></i>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                ))}
            </div>
        </aside>
    );
}
