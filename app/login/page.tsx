'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LOGO_BASE64 } from '../../lib/logoData';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
      router.push('/');
    } catch (err: any) {
      if (!err.response) {
        setError('تعذر الاتصال بالسيرفر (جاري إيقاظ الخدمة)... اضغط ENTER للمحاولة مرة أخرى');
      } else {
        setError(err.response?.data?.message || 'اليوزرنيم أو الباسورد غلط');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background Orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />

      <form className="login-card" onSubmit={handleSubmit} autoComplete="off">
        {/* Logo */}
        <div className="login-logo-wrap">
          <div className="login-logo-ring" />
          <div className="login-logo-ring-2" />
          <div className="login-logo-icon">
            <img src={LOGO_BASE64} alt="VACUUM GYM" style={{ width: '84px', height: '84px', objectFit: 'contain' }} />
          </div>
        </div>

        <div className="login-gym-name">VACUUM GYM</div>
        <div className="login-subtitle">نظام إدارة الجيم — تسجيل دخول</div>

        {error && <div className="error-msg">{error}</div>}

        <div className="login-form-group">
          <label>اليوزرنيم</label>
          <input
            className="login-input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
            autoComplete="username"
            placeholder="أدخل اليوزرنيم"
          />
        </div>

        <div className="login-form-group">
          <label>الباسورد</label>
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="أدخل الباسورد"
          />
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spinRing 0.8s linear infinite', display: 'inline-block' }} />
              جاري الدخول...
            </span>
          ) : 'ENTER'}
        </button>

        <div style={{ marginTop: '24px', fontSize: '11px', color: '#2a2a3a', letterSpacing: '1px' }}>VACUUM GYM MANAGEMENT SYSTEM v2.0</div>
      </form>
    </div>
  );
};

export default Login;
