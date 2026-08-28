"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

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
      await login(username, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'حصل خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>🏋️ نظام إدارة الجيم</h1>
        <p className="subtitle">تسجيل دخول الكاشير</p>
        {error && <div className="error-msg">{error}</div>}
        <label>اليوزرنيم</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        <label>الباسورد</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? 'جاري الدخول...' : 'دخول'}</button>
      </form>
    </div>
  );
};

export default Login;
