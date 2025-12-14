import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet } from '../lib/api';

interface Settings {
    general: {
        systemName: string;
        defaultEnvironment: string;
        timezone: string;
        dateFormat: string;
    };
    notifications: {
        emailEnabled: boolean;
        slackEnabled: boolean;
        slackWebhook: string;
        notifyOnApproval: boolean;
        notifyOnPublish: boolean;
        notifyOnFailure: boolean;
    };
    security: {
        sessionTimeout: number;
        requireMfa: boolean;
        passwordMinLength: number;
        passwordRequireSpecialChars: boolean;
    };
    gateway: {
        defaultTimeout: number;
        maxRetries: number;
        enableMetrics: boolean;
        metricsRetentionDays: number;
    };
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings | null>(null);

    useEffect(() => {
        apiGet<Settings>('/settings').then(setSettings).catch(console.error);
    }, []);

    if (!settings) return <Layout title="Settings" subtitle="System configuration"><div>Loading...</div></Layout>;

    return (
        <Layout title="System Settings" subtitle="Configure system preferences and behavior">
            <div className="grid">
                <div className="card">
                    <h3>General Settings</h3>
                    <div className="form-group">
                        <label>System Name</label>
                        <input value={settings.general.systemName} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Default Environment</label>
                        <input value={settings.general.defaultEnvironment} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Timezone</label>
                        <input value={settings.general.timezone} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Date Format</label>
                        <input value={settings.general.dateFormat} readOnly />
                    </div>
                </div>

                <div className="card">
                    <h3>Notification Settings</h3>
                    <div className="form-group">
                        <label>
                            <input type="checkbox" checked={settings.notifications.emailEnabled} readOnly />
                            Email Notifications Enabled
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <input type="checkbox" checked={settings.notifications.slackEnabled} readOnly />
                            Slack Notifications Enabled
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <input type="checkbox" checked={settings.notifications.notifyOnApproval} readOnly />
                            Notify on Approval
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <input type="checkbox" checked={settings.notifications.notifyOnPublish} readOnly />
                            Notify on Publish
                        </label>
                    </div>
                </div>

                <div className="card">
                    <h3>Security Settings</h3>
                    <div className="form-group">
                        <label>Session Timeout (seconds)</label>
                        <input type="number" value={settings.security.sessionTimeout} readOnly />
                    </div>
                    <div className="form-group">
                        <label>
                            <input type="checkbox" checked={settings.security.requireMfa} readOnly />
                            Require Multi-Factor Authentication
                        </label>
                    </div>
                    <div className="form-group">
                        <label>Password Minimum Length</label>
                        <input type="number" value={settings.security.passwordMinLength} readOnly />
                    </div>
                </div>

                <div className="card">
                    <h3>Gateway Settings</h3>
                    <div className="form-group">
                        <label>Default Timeout (seconds)</label>
                        <input type="number" value={settings.gateway.defaultTimeout} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Max Retries</label>
                        <input type="number" value={settings.gateway.maxRetries} readOnly />
                    </div>
                    <div className="form-group">
                        <label>
                            <input type="checkbox" checked={settings.gateway.enableMetrics} readOnly />
                            Enable Metrics Collection
                        </label>
                    </div>
                    <div className="form-group">
                        <label>Metrics Retention (days)</label>
                        <input type="number" value={settings.gateway.metricsRetentionDays} readOnly />
                    </div>
                    <button className="btn-primary">Save Settings</button>
                </div>
            </div>
        </Layout>
    );
}
