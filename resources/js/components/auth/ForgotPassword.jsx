"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from '@iconify/react';
import api from '../../lib/api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: phone input, 2: token+password input
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [debugToken, setDebugToken] = useState(''); // TEMPORARY: for testing
  const navigate = useNavigate();

  // Password validation
  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Password minimal 8 karakter.';
    if (!/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/\d/.test(pwd)) {
      return 'Password harus mengandung huruf besar, huruf kecil, dan angka.';
    }
    return null;
  };

  // Step 1: Request reset token via SMS/WA
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/forgot-password', { phone });
      setSuccess(response.data.message);
      setDebugToken(response.data.debug_token || ''); // TEMPORARY
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim kode reset password.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with token
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate token is 6 digits
    if (!/^[0-9]{6}$/.test(token)) {
      setError('Kode harus 6 digit angka.');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/reset-password', {
        phone,
        token,
        password,
        password_confirmation: confirmPassword,
      });
      setSuccess('Password berhasil direset! Redirecting...');
      setTimeout(() => navigate('/auth'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        fontFamily: 'Poppins, sans-serif',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.button
        onClick={() => navigate('/auth')}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          background: 'white',
          color: '#00BFEF',
          border: '2px solid #00BFEF',
          padding: '10px 20px',
          borderRadius: '50px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
        whileHover={{ scale: 1.05, background: '#00BFEF', color: 'white' }}
      >
        <span>←</span>
        <span>Kembali</span>
      </motion.button>

      <motion.div
        style={{
          width: '100%',
          maxWidth: '450px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          padding: '40px',
        }}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <h2 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px', textAlign: 'center', fontWeight: 700 }}>
          {step === 1 ? 'Lupa Password' : 'Reset Password'}
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center', marginBottom: '30px' }}>
          {step === 1
            ? 'Masukkan nomor telepon Anda untuk menerima kode reset via SMS/WA'
            : 'Masukkan kode 6 digit dan password baru Anda'}
        </p>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                padding: '12px 16px',
                background: 'rgba(255, 59, 48, 0.1)',
                border: '1px solid rgba(255, 59, 48, 0.2)',
                borderRadius: '12px',
                color: '#FF3B30',
                fontSize: '0.85rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Icon icon="solar:danger-circle-bold-duotone" style={{ fontSize: '1.25rem' }} />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                padding: '12px 16px',
                background: 'rgba(52, 199, 89, 0.1)',
                border: '1px solid rgba(52, 199, 89, 0.2)',
                borderRadius: '12px',
                color: '#34C759',
                fontSize: '0.85rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Icon icon="solar:check-circle-bold-duotone" style={{ fontSize: '1.25rem' }} />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {step === 1 ? (
          <form onSubmit={handleRequestReset}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px', display: 'block' }}>
                Nomor Telepon
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f0f0f0',
                borderRadius: '12px',
                padding: '12px 16px',
                gap: '10px',
              }}>
                <Icon icon="fluent:phone-16-filled" style={{ fontSize: '1.2rem', color: '#666' }} />
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={loading}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '1rem',
                    color: '#333',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#ccc' : '#00BFEF',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: '0.3s',
              }}
            >
              {loading ? 'Mengirim...' : 'Kirim Kode Reset'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            {debugToken && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: '12px',
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  fontSize: '0.8rem',
                  color: '#856404',
                }}
              >
                <strong>DEBUG TOKEN:</strong> {debugToken}
                <br />
                <small>(Copy token ini untuk testing. Hapus di production!)</small>
              </motion.div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px', display: 'block' }}>
                Kode Reset (6 Digit)
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f0f0f0',
                borderRadius: '12px',
                padding: '12px 16px',
                gap: '10px',
              }}>
                <Icon icon="mdi:key" style={{ fontSize: '1.2rem', color: '#666' }} />
                <input
                  type="text"
                  placeholder="Masukkan 6 digit kode"
                  value={token}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only numbers
                    if (value.length <= 6) setToken(value);
                  }}
                  maxLength={6}
                  required
                  disabled={loading}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '1.2rem',
                    color: '#333',
                    letterSpacing: '0.3em',
                    textAlign: 'center',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px', display: 'block' }}>
                Password Baru
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f0f0f0',
                borderRadius: '12px',
                padding: '12px 16px',
                gap: '10px',
              }}>
                <Icon icon="material-symbols:lock" style={{ fontSize: '1.2rem', color: '#666' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password baru"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '1rem',
                    color: '#333',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
                >
                  <Icon icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'} style={{ fontSize: '1.2rem' }} />
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px', display: 'block' }}>
                Konfirmasi Password
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f0f0f0',
                borderRadius: '12px',
                padding: '12px 16px',
                gap: '10px',
              }}>
                <Icon icon="material-symbols:lock-outline" style={{ fontSize: '1.2rem', color: '#666' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Konfirmasi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '1rem',
                    color: '#333',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
                >
                  <Icon icon={showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'} style={{ fontSize: '1.2rem' }} />
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '20px' }}>
              Min. 8 karakter, mengandung huruf besar, huruf kecil, dan angka
            </p>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#ccc' : '#00BFEF',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Mereset...' : 'Reset Password'}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
