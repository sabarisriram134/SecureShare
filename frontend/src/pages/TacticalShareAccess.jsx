import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import '../styles/TacticalFileSharing.css';

export default function TacticalShareAccess() {
    const { user } = useAuth();
    const { cid } = useParams(); // Route is /tactical-store/:cid
    const navigate = useNavigate();

    const [step, setStep] = useState('request');
    const [fileMeta, setFileMeta] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [emailCode, setEmailCode] = useState('');
    const [smsCode, setSmsCode] = useState('');
    const [password, setPassword] = useState('');
    const [downloadToken, setDownloadToken] = useState('');

    // Fetch file metadata on mount
    useEffect(() => {
        if (!cid) {
            setError('No file identifier provided in the URL.');
            setLoading(false);
            return;
        }

        async function fetchMeta() {
            setLoading(true);
            setError('');
            try {
                // Backend: GET /api/tactical/meta/:cid  → returns flat { fileName, size, accessLevel, owner }
                const res = await api.get('/api/tactical/meta/' + cid);
                setFileMeta(res.data);
            } catch (err) {
                const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to load file information.';
                setError(msg);
            } finally {
                setLoading(false);
            }
        }

        fetchMeta();
    }, [cid]);

    // Step 1 — Request OTP codes be sent to file owner
    const handleRequestAccess = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Backend: POST /api/tactical/request-access  body: { cid }
            await api.post('/api/tactical/request-access', { cid });
            setStep('verify');
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to request access.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Step 2 — Verify OTP(s) + password and receive a one-time download token
    const handleVerifyAccess = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Backend: POST /api/tactical/verify-access  body: { cid, emailCode, smsCode, password }
            const res = await api.post('/api/tactical/verify-access', {
                cid,
                emailCode,
                smsCode,
                password,
            });
            if (res.data && res.data.token) {
                setDownloadToken(res.data.token);
                setStep('download');
            } else {
                setError('Verification did not return a download token. Please try again.');
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || 'Verification failed.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Step 3 — Download using the one-time token
    const handleDownload = async () => {
        setError('');
        setLoading(true);
        try {
            // Backend: GET /api/tactical/download/:token
            const res = await api.get('/api/tactical/download/' + downloadToken, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileMeta?.fileName || 'download');
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                link.remove();
                window.URL.revokeObjectURL(url);
            }, 100);
        } catch (err) {
            setError('Download failed. The secure token may have expired — please verify again.');
            setStep('request');
            setDownloadToken('');
        } finally {
            setLoading(false);
        }
    };

    const getAccessLabel = (level) => {
        switch (level) {
            case 'public': return '🌐 PUBLIC';
            case 'private': return '🔒 PRIVATE';
            case 'restricted': return '🚨 RESTRICTED';
            default: return '❓ UNKNOWN';
        }
    };

    return (
        <div className="tactical-container">
            <div className="tactical-grid"></div>

            <div className="tactical-content">
                {/* Header */}
                <div className="tactical-header" style={{ justifyContent: 'center' }}>
                    <h1 className="tactical-title" style={{ textAlign: 'center' }}>
                        <span className="glow-text">⚡</span> TACTICAL STORE
                    </h1>
                </div>

                {/* Card */}
                <div
                    className="main-content"
                    style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}
                >
                    <div className="protocol-card" style={{ maxWidth: 520, width: '100%' }}>

                        {/* Error banner */}
                        {error && (
                            <div
                                style={{
                                    marginBottom: 16,
                                    padding: '12px 16px',
                                    borderRadius: 6,
                                    background: 'rgba(255,59,48,0.12)',
                                    border: '1px solid #FF3B30',
                                    color: '#FF3B30',
                                    fontSize: 13,
                                    fontFamily: 'JetBrains Mono, monospace',
                                }}
                            >
                                ⚠ {error}
                            </div>
                        )}

                        {/* Title row */}
                        <h3
                            className="protocol-title"
                            style={{ textAlign: 'center', marginBottom: 6, fontSize: 16 }}
                        >
                            {step === 'request' && 'AUTHENTICATION REQUIRED'}
                            {step === 'verify' && 'VERIFY IDENTITY'}
                            {step === 'download' && 'DATA UNLOCKED'}
                        </h3>

                        {/* File metadata */}
                        {fileMeta && (
                            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                <p style={{ color: '#00F0FF', fontSize: 13, margin: '4px 0', fontFamily: 'JetBrains Mono, monospace' }}>
                                    {fileMeta.fileName}
                                    {fileMeta.size ? ` — ${(fileMeta.size / 1024).toFixed(2)} KB` : ''}
                                </p>
                                <span
                                    style={{
                                        display: 'inline-block',
                                        padding: '4px 14px',
                                        borderRadius: 4,
                                        background: 'rgba(255,59,48,0.12)',
                                        border: '1px solid rgba(255,59,48,0.4)',
                                        fontSize: 11,
                                        fontFamily: 'JetBrains Mono, monospace',
                                        color: '#e0e0e0',
                                        letterSpacing: 1,
                                    }}
                                >
                                    {getAccessLabel(fileMeta.accessLevel)}
                                </span>
                            </div>
                        )}

                        {/* Loading state */}
                        {loading && !fileMeta && (
                            <p style={{ textAlign: 'center', color: 'rgba(224,224,224,0.5)', fontSize: 13 }}>
                                Loading file information...
                            </p>
                        )}

                        {/* ── STEP 1: Request Access ── */}
                        {step === 'request' && fileMeta && (
                            <form onSubmit={handleRequestAccess}>
                                {fileMeta.accessLevel === 'public' ? (
                                    <div
                                        style={{
                                            textAlign: 'center',
                                            padding: '16px',
                                            background: 'rgba(0,255,0,0.06)',
                                            border: '1px solid rgba(0,255,0,0.2)',
                                            borderRadius: 6,
                                            color: '#00FF9F',
                                            fontSize: 13,
                                            marginBottom: 16,
                                        }}
                                    >
                                        💚 This is a public file — no OTP required. Click below to proceed.
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            padding: 16,
                                            background: 'rgba(0,240,255,0.07)',
                                            border: '1px solid rgba(0,240,255,0.25)',
                                            borderRadius: 6,
                                            fontSize: 13,
                                            color: '#e0e0e0',
                                            marginBottom: 16,
                                        }}
                                    >
                                        <p style={{ margin: '0 0 10px' }}>
                                            This is a secured Tactical Store payload. Authorization codes will be sent to the file
                                            owner&apos;s registered contacts:
                                        </p>
                                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                                            {(fileMeta.accessLevel === 'private' || fileMeta.accessLevel === 'restricted') && (
                                                <li>
                                                    Email:{' '}
                                                    <strong style={{ color: '#00F0FF' }}>
                                                        {fileMeta.owner?.emailMasked || 'Registered Email'}
                                                    </strong>
                                                </li>
                                            )}
                                            {fileMeta.accessLevel === 'restricted' && (
                                                <li>
                                                    SMS:{' '}
                                                    <strong style={{ color: '#00F0FF' }}>
                                                        {fileMeta.owner?.phoneMasked || 'Registered Phone'}
                                                    </strong>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="action-btn download-btn"
                                    disabled={loading}
                                    style={{ width: '100%', padding: '12px', fontSize: 13, marginTop: 8 }}
                                >
                                    {loading ? 'TRANSMITTING...' : 'REQUEST OWNER AUTHORIZATION'}
                                </button>
                            </form>
                        )}

                        {/* ── STEP 2: Verify OTP(s) + Password ── */}
                        {step === 'verify' && (
                            <form onSubmit={handleVerifyAccess}>
                                {/* Email OTP */}
                                <div style={{ marginBottom: 16 }}>
                                    <label className="meta-label" style={{ display: 'block', marginBottom: 6, fontSize: 11 }}>
                                        EMAIL OTP
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={emailCode}
                                        onChange={(e) => setEmailCode(e.target.value)}
                                        placeholder="6-digit code"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            background: 'rgba(0,0,0,0.5)',
                                            border: '1px solid #00F0FF',
                                            borderRadius: 4,
                                            color: '#FFF',
                                            fontSize: 20,
                                            letterSpacing: 8,
                                            fontFamily: 'JetBrains Mono, monospace',
                                            textAlign: 'center',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>

                                {/* SMS OTP — only for restricted */}
                                {fileMeta?.accessLevel === 'restricted' && (
                                    <div style={{ marginBottom: 16 }}>
                                        <label className="meta-label" style={{ display: 'block', marginBottom: 6, fontSize: 11 }}>
                                            SMS OTP
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={smsCode}
                                            onChange={(e) => setSmsCode(e.target.value)}
                                            placeholder="6-digit code"
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                background: 'rgba(0,0,0,0.5)',
                                                border: '1px solid #00F0FF',
                                                borderRadius: 4,
                                                color: '#FFF',
                                                fontSize: 20,
                                                letterSpacing: 8,
                                                fontFamily: 'JetBrains Mono, monospace',
                                                textAlign: 'center',
                                                boxSizing: 'border-box',
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Password */}
                                <div style={{ marginBottom: 20 }}>
                                    <label className="meta-label" style={{ display: 'block', marginBottom: 6, fontSize: 11 }}>
                                        ACCOUNT PASSWORD
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="File owner's account password"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            background: 'rgba(0,0,0,0.5)',
                                            border: '1px solid #00F0FF',
                                            borderRadius: 4,
                                            color: '#FFF',
                                            fontSize: 14,
                                            fontFamily: 'JetBrains Mono, monospace',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="action-btn download-btn"
                                    disabled={loading}
                                    style={{ width: '100%', padding: '12px', fontSize: 13, marginBottom: 8 }}
                                >
                                    {loading ? 'VERIFYING...' : 'VERIFY & DECRYPT'}
                                </button>

                                <button
                                    type="button"
                                    className="action-btn delete-btn"
                                    onClick={() => { setStep('request'); setError(''); }}
                                    style={{ width: '100%', padding: '10px', fontSize: 12 }}
                                >
                                    ← BACK
                                </button>
                            </form>
                        )}

                        {/* ── STEP 3: Download ── */}
                        {step === 'download' && (
                            <div style={{ textAlign: 'center' }}>
                                <div className="empty-icon" style={{ fontSize: 56, color: '#00F0FF', marginBottom: 12 }}>
                                    🔓
                                </div>
                                <p style={{ color: '#e0e0e0', fontSize: 14, marginBottom: 24 }}>
                                    Verification successful. Your secure tunnel is open.
                                </p>
                                <button
                                    onClick={handleDownload}
                                    className="action-btn download-btn"
                                    disabled={loading}
                                    style={{ width: '100%', padding: '14px', fontSize: 14 }}
                                >
                                    {loading ? 'DOWNLOADING...' : '⬇️ DOWNLOAD ENCRYPTED FILE'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
