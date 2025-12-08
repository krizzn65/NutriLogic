"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from '@iconify/react'
import { login, fetchMe } from '../../lib/auth';
import api from '../../lib/api';

export default function AuthSwitch() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const navigate = useNavigate();

  // Sign Up form states
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    phone: '',
    posyandu_id: '',
    rt: '',
    rw: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [signUpError, setSignUpError] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [posyandus, setPosyandus] = useState([]);
  const [isPosyanduDropdownOpen, setIsPosyanduDropdownOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({}); // Track which fields have errors

  // Fetch posyandus list on mount
  useEffect(() => {
    const fetchPosyandus = async () => {
      try {
        const response = await api.get('/posyandus');
        setPosyandus(response.data.data || response.data || []);
      } catch (err) {
        console.error('Failed to fetch posyandus:', err);
      }
    };
    fetchPosyandus();
  }, []);

  useEffect(() => {
    const container = document.querySelector(".auth-container");
    if (!container) return;
    if (isSignUp) container.classList.add("sign-up-mode");
    else container.classList.remove("sign-up-mode");
  }, [isSignUp]);

  // Password validation function
  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return 'Password minimal 8 karakter.';
    }
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return 'Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka.';
    }
    return null;
  };

  // Email validation function
  const validateEmail = (email) => {
    // RFC 5322 compliant email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return 'Format email tidak valid.';
    }
    
    // Additional checks for common errors
    if (email.includes('..')) {
      return 'Email tidak boleh mengandung titik ganda berturut-turut.';
    }
    
    if (email.startsWith('.') || email.endsWith('.')) {
      return 'Email tidak boleh diawali atau diakhiri dengan titik.';
    }
    
    return null;
  };

  // Phone validation function
  const validatePhone = (phone) => {
    // Indonesian phone number format
    const phoneRegex = /^(08|62)\d{8,13}$/;
    
    if (!phoneRegex.test(phone)) {
      return 'Format nomor telepon tidak valid. Gunakan format 08xxxxxxxxxx atau 62xxxxxxxxxx.';
    }
    
    return null;
  };

  // Handle sign up form submission
  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignUpError('');
    setFieldErrors({}); // Clear previous field errors

    // Validate required fields
    if (!signUpData.name || !signUpData.email || !signUpData.phone || !signUpData.posyandu_id || !signUpData.rt || !signUpData.rw || !signUpData.address || !signUpData.password || !signUpData.confirmPassword) {
      setSignUpError('Semua field wajib diisi.');
      return;
    }

    // Validate email format
    const emailError = validateEmail(signUpData.email);
    if (emailError) {
      setSignUpError(emailError);
      setFieldErrors({ email: true });
      return;
    }

    // Validate phone format
    const phoneError = validatePhone(signUpData.phone);
    if (phoneError) {
      setSignUpError(phoneError);
      setFieldErrors({ phone: true });
      return;
    }

    // Validate password
    const passwordError = validatePassword(signUpData.password);
    if (passwordError) {
      setSignUpError(passwordError);
      setFieldErrors({ password: true });
      return;
    }

    // Check password match
    if (signUpData.password !== signUpData.confirmPassword) {
      setSignUpError('Password dan konfirmasi password tidak cocok.');
      setFieldErrors({ confirmPassword: true });
      return;
    }

    setSignUpLoading(true);

    try {
      await api.post('/register', {
        name: signUpData.name,
        email: signUpData.email,
        phone: signUpData.phone,
        posyandu_id: signUpData.posyandu_id,
        rt: signUpData.rt,
        rw: signUpData.rw,
        address: signUpData.address,
        password: signUpData.password,
        password_confirmation: signUpData.confirmPassword,
        role: 'ibu'
      });

      // Auto login after registration
      await login(signUpData.email, signUpData.password);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.';
      
      // Parse validation errors from backend
      const errors = err.response?.data?.errors;
      if (errors) {
        // Mark fields with errors
        const errFields = {};
        Object.keys(errors).forEach(field => {
          errFields[field] = true;
        });
        setFieldErrors(errFields);
        
        // Show specific field errors
        const fieldErrors = Object.values(errors).flat();
        setSignUpError(fieldErrors.join(' '));
      } else {
        setSignUpError(errorMessage);
      }
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <motion.div
      className="auth-page"
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #FFFFFFFF 0%, #FFFFFFFF 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Outfit:wght@100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Poppins', 'Montserrat', 'Outfit', sans-serif;
        }

        .back-button {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1000;
          background: white;
          color: #00BFEF;
          border: 2px solid #00BFEF;
          padding: 10px 20px;
          border-radius: 50px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .back-button:hover {
          background: #00BFEF;
          color: white;
          transform: translateX(-5px);
          box-shadow: 0 4px 12px rgba(0, 191, 239, 0.3);
        }

        .auth-container {
          position: relative;
          width: 100%;
          max-width: 900px;
          height: 750px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }
        
        @media (max-width: 870px) {
          .auth-container {
            height: auto;
            min-height: 750px;
            max-height: none;
          }
        }
        
        @media (max-width: 570px) {
          .auth-container {
            height: auto;
            min-height: 800px;
            border-radius: 15px;
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
          }
        }

        .forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 5rem;
          transition: all 0.2s 0.7s;
          overflow-y: auto;
          overflow-x: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
          max-height: 100%;
        }

        form.sign-up-form {
          opacity: 0;
          z-index: 1;
          padding-top: 1rem;
          padding-bottom: 1rem;
        }

        form.sign-in-form {
          z-index: 2;
        }

        .title {
          font-size: 2.2rem;
          color: #444;
          margin-bottom: 8px;
          font-weight: 700;
        }
        
        .sign-up-form .title {
          margin-bottom: 5px;
          font-size: 2rem;
        }

        .input-field {
          max-width: 380px;
          width: 100%;
          background-color: #f0f0f0;
          margin: 10px 0;
          height: 55px;
          border-radius: 55px;
          display: grid;
          grid-template-columns: 15% 1fr auto;
          padding: 0 0.4rem;
          position: relative;
          transition: 0.3s;
          overflow: hidden; /* Clip the rectangular input corners */
          border: 2px solid transparent;
        }
        
        .sign-up-form .input-field {
          margin: 7px 0;
          height: 50px;
        }
        
        .sign-up-form .input-field.textarea-field {
          min-height: 80px;
        }
        
        .input-field.small-field {
          max-width: 182px;
          margin: 10px 4px;
          grid-template-columns: 20% 1fr;
          padding: 0 0.6rem;
        }
        
        .sign-up-form .input-field.small-field {
          margin: 7px 4px;
          height: 50px;
        }
        
        .input-field.small-field i {
          line-height: 50px;
        }
        
        .input-field.small-field input {
          padding-left: 8px;
        }
        
        .rt-rw-container {
          display: flex;
          gap: 8px;
          width: 100%;
          max-width: 380px;
        }
        
        .input-field.textarea-field {
          height: auto;
          min-height: 90px;
          border-radius: 20px;
          grid-template-columns: 15% 1fr;
          align-items: start;
          padding: 0.8rem 0.4rem;
        }
        
        .input-field.textarea-field textarea {
          background: none;
          outline: none;
          border: none;
          font-weight: 500;
          font-size: 1rem;
          color: #333;
          width: 100%;
          resize: none;
          font-family: 'Poppins', 'Montserrat', 'Outfit', sans-serif;
        }
        
        .input-field.textarea-field textarea::placeholder {
          color: #aaa;
          font-weight: 400;
        }
        
        .input-field.textarea-field i {
          padding-top: 5px;
        }

        .input-field.error {
          border-color: #FF3B30;
          background-color: #fff5f5;
        }

        .input-field.password-field {
          grid-template-columns: 15% 1fr 15%;
        }

        .password-toggle {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #888;
          padding: 0;
          transition: color 0.3s;
        }

        .password-toggle:hover {
          color: #00BFEF;
        }

        .password-toggle svg {
          width: 20px;
          height: 20px;
        }

        .input-field:focus-within {
          background-color: #e8e8e8;
          box-shadow: 0 0 0 2px #00BFEF;
        }

        .input-field i {
          text-align: center;
          line-height: 55px;
          color: #666;
          transition: 0.5s;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .input-field i svg {
          width: 20px;
          height: 20px;
        }

        .input-field input {
          background: none;
          outline: none;
          border: none;
          line-height: 1;
          font-weight: 500;
          font-size: 1rem;
          color: #333;
          color: #333;
          width: 100%;
          border-radius: 55px; /* Ensure autofill background is rounded */
        }

        .input-field input::placeholder {
          color: #aaa;
          font-weight: 400;
        }

        /* Fix for browser autofill background */
        .input-field input:-webkit-autofill,
        .input-field input:-webkit-autofill:hover, 
        .input-field input:-webkit-autofill:focus, 
        .input-field input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #f0f0f0 inset !important;
          -webkit-text-fill-color: #333 !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        .input-field:focus-within input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #e8e8e8 inset !important;
        }

        .btn {
          width: 150px;
          background-color: #00BFEF;
          border: none;
          outline: none;
          height: 49px;
          border-radius: 49px;
          color: #fff;
          text-transform: uppercase;
          font-weight: 600;
          margin: 10px 0;
          cursor: pointer;
          transition: 0.5s;
          font-size: 0.9rem;
        }

        .btn:hover {
          background-color: #0ADFDD;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
        }

        .left-panel {
          pointer-events: all;
          padding: 3rem 17% 2rem 12%;
        }

        .right-panel {
          pointer-events: none;
          padding: 3rem 12% 2rem 17%;
        }

        .panel .content {
          color: #fff;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
        }

        .panel h3 {
          font-weight: 600;
          line-height: 1;
          font-size: 1.5rem;
          margin-bottom: 10px;
        }

        .panel p {
          font-size: 0.95rem;
          padding: 0.7rem 0;
        }

        .btn.transparent {
          margin: 0;
          background: none;
          border: 2px solid #fff;
          width: 130px;
          height: 41px;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .btn.transparent:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .right-panel .content {
          transform: translateX(800px);
        }

        .auth-container:before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(-45deg, #00BFEF 0%, #006AA6 100%);
          transition: 1.8s ease-in-out;
          border-radius: 0;
          z-index: 6;
        }

        .auth-container.sign-up-mode:before {
          transform: translate(100%, -50%);
          right: 52%;
        }

        .auth-container.sign-up-mode .left-panel .content {
          transform: translateX(-800px);
        }

        .auth-container.sign-up-mode .signin-signup {
          left: 25%;
        }

        .auth-container.sign-up-mode form.sign-up-form {
          opacity: 1;
          z-index: 2;
        }

        .auth-container.sign-up-mode form.sign-in-form {
          opacity: 0;
          z-index: 1;
        }

        .auth-container.sign-up-mode .right-panel .content {
          transform: translateX(0%);
        }

        .auth-container.sign-up-mode .left-panel {
          pointer-events: none;
        }

        .auth-container.sign-up-mode .right-panel {
          pointer-events: all;
        }

        .forgot-password {
          font-size: 0.85rem;
          color: #006AA6;
          text-decoration: none;
          margin: 10px 0 15px;
          cursor: pointer;
          transition: 0.3s;
          align-self: flex-end;
        }

        .forgot-password:hover {
          color: #00BFEF;
          text-decoration: underline;
        }

        .social-text {
          padding: 0.7rem 0;
          font-size: 1rem;
          color: #666;
        }

        .social-media {
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        .social-icon {
          height: 46px;
          width: 46px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 50%;
          color: #667eea;
          font-size: 1.2rem;
          transition: 0.3s;
          cursor: pointer;
        }

        .social-icon:hover {
          border-color: #764ba2;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .social-icon svg {
          transition: 0.3s;
        }

        @media (max-width: 870px) {
          .back-button {
            position: absolute;
            top: 10px;
            left: 10px;
            padding: 8px 16px;
            font-size: 0.85rem;
          }
          
          .signin-signup {
            width: 100%;
            top: 95%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }
          .signin-signup,
          .auth-container.sign-up-mode .signin-signup {
            left: 50%;
          }
          
          form {
            padding: 0 2rem;
          }
          
          .title {
            font-size: 1.8rem;
            margin-bottom: 15px;
          }
          
          .panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }
          .panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2rem 6%;
            grid-column: 1 / 2;
          }
          .right-panel {
            grid-row: 3 / 4;
          }
          .left-panel {
            grid-row: 1 / 2;
          }
          .panel .content {
            padding-right: 10%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
          }
          .panel h3 {
            font-size: 1.1rem;
          }
          .panel p {
            font-size: 0.7rem;
            padding: 0.4rem 0;
          }
          .btn.transparent {
            width: 100px;
            height: 38px;
            font-size: 0.7rem;
          }
          .auth-container:before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }
          .auth-container.sign-up-mode:before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
          }
          .auth-container.sign-up-mode .left-panel .content {
            transform: translateY(-300px);
          }
          .auth-container.sign-up-mode .right-panel .content {
            transform: translateY(0px);
          }
          .right-panel .content {
            transform: translateY(300px);
          }
          .auth-container.sign-up-mode .signin-signup {
            top: 5%;
            transform: translate(-50%, 0);
          }
        }

        @media (max-width: 570px) {
          .back-button {
            padding: 6px 14px;
            font-size: 0.75rem;
            top: 8px;
            left: 8px;
          }
          
          form {
            padding: 0 1.2rem;
          }
          
          .title {
            font-size: 1.6rem;
            margin-bottom: 12px;
          }
          
          .input-field {
            height: 50px;
            margin: 7px 0;
          }
          
          .input-field input {
            font-size: 0.9rem;
          }
          
          .btn {
            height: 45px;
            width: 130px;
            font-size: 0.85rem;
            margin: 8px 0;
          }
          
          .panel {
            padding: 1.5rem 5%;
          }
          
          .panel .content {
            padding: 0.3rem 0.5rem;
            padding-right: 5%;
          }
          
          .panel h3 {
            font-size: 0.95rem;
            margin-bottom: 5px;
          }
          
          .panel p {
            font-size: 0.6rem;
            padding: 0.25rem 0;
            line-height: 1.3;
          }
          
          .btn.transparent {
            width: 90px;
            height: 32px;
            font-size: 0.65rem;
          }
          
          .forgot-password {
            font-size: 0.8rem;
            margin: 8px 0 12px;
          }
        }
      `}</style>

      <motion.button
        onClick={() => navigate('/')}
        className="back-button"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>←</span>
        <span>Kembali</span>
      </motion.button>

      <motion.div
        className="auth-container"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }}
      >
        <div className="forms-container">
          <div className="signin-signup">
            {/* Sign In Form */}
            <form
              className="sign-in-form"
              autoComplete="off"
              onSubmit={async (e) => {
                e.preventDefault();
                setError('');
                setLoading(true);

                try {
                  // Login user
                  await login(identifier, password);

                  // Fetch user data from API
                  const user = await fetchMe();

                  // Redirect based on role
                  if (user.role === 'ibu') {
                    navigate('/dashboard');
                  } else if (user.role === 'kader' || user.role === 'admin') {
                    navigate('/dashboard');
                  } else {
                    navigate('/dashboard');
                  }
                } catch (err) {
                  // Handle error with lockout information
                  const errorMessage = err.response?.data?.message || 'Login gagal. Periksa kembali nomor telepon/nama dan password Anda.';
                  const statusCode = err.response?.status;
                  
                  // Show lockout warning if account is locked (429 status)
                  if (statusCode === 429) {
                    const lockedUntil = err.response?.data?.locked_until;
                    setError(`🔒 ${errorMessage}`);
                  } else {
                    setError(errorMessage);
                  }
                } finally {
                  setLoading(false);
                }
              }}
            >
              <h2 className="title">Sign in</h2>
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{
                      width: '100%',
                      maxWidth: '380px',
                      marginBottom: '15px',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      padding: '12px 16px',
                      background: 'rgba(255, 59, 48, 0.1)',
                      border: '1px solid rgba(255, 59, 48, 0.2)',
                      borderRadius: '12px',
                      color: '#FF3B30',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 12px rgba(255, 59, 48, 0.1)'
                    }}>
                      <Icon icon="solar:danger-circle-bold-duotone" style={{ fontSize: '1.25rem', flexShrink: 0 }} />
                      <span>{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="input-field">
                <i><Icon icon="mdi:account-circle" /></i>
                <input
                  type="text"
                  placeholder="No. Telepon / Nama Lengkap"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value.trim())}
                  required
                  disabled={loading}
                />
              </div>
              <div className="input-field password-field">
                <i><Icon icon="material-symbols:lock" /></i>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.trim())}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} />
                </button>
              </div>
              <a href="#" className="forgot-password color" onClick={(e) => {
                e.preventDefault();
                navigate('/forgot-password');
              }}>Lupa Password?</a>
              <input
                type="submit"
                value={loading ? "Loading..." : "Login"}
                className="btn solid"
                disabled={loading}
              />
            </form>

            {/* Sign Up Form */}
            <form
              className="sign-up-form"
              autoComplete="off"
              onSubmit={handleSignUp}
            >
              <h2 className="title">Daftar</h2>
              <AnimatePresence mode="wait">
                {signUpError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{
                      width: '100%',
                      maxWidth: '380px',
                      marginBottom: '10px',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      padding: '10px 14px',
                      background: 'rgba(255, 59, 48, 0.1)',
                      border: '1px solid rgba(255, 59, 48, 0.2)',
                      borderRadius: '12px',
                      color: '#FF3B30',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <Icon icon="solar:danger-circle-bold-duotone" style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                      <span>{signUpError}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Nama Lengkap */}
              <div className={`input-field ${fieldErrors.name ? 'error' : ''}`}>
                <i><Icon icon="mdi:account" /></i>
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  autoComplete="name"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value.trim() })}
                  required
                  disabled={signUpLoading}
                />
              </div>

              {/* Email */}
              <div className={`input-field ${fieldErrors.email ? 'error' : ''}`}>
                <i><Icon icon="mdi:email" /></i>
                <input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value.trim() })}
                  required
                  disabled={signUpLoading}
                />
              </div>

              {/* No Telepon */}
              <div className={`input-field ${fieldErrors.phone ? 'error' : ''}`}>
                <i><Icon icon="fluent:phone-16-filled" /></i>
                <input
                  type="tel"
                  placeholder="No. Telepon (08xxxxxxxxxx)"
                  autoComplete="tel"
                  value={signUpData.phone}
                  onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value.trim() })}
                  required
                  disabled={signUpLoading}
                />
              </div>

              {/* Lokasi Posyandu Dropdown */}
              <div className={`input-field ${fieldErrors.posyandu_id ? 'error' : ''}`} style={{ cursor: 'pointer', overflow: 'visible' }}>
                <i><Icon icon="mdi:hospital-building" /></i>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    position: 'relative'
                  }}
                  onClick={() => !signUpLoading && setIsPosyanduDropdownOpen(!isPosyanduDropdownOpen)}
                >
                  <span style={{
                    flex: 1,
                    color: signUpData.posyandu_id ? '#333' : '#aaa',
                    fontSize: '1rem',
                    fontWeight: signUpData.posyandu_id ? 500 : 400
                  }}>
                    {signUpData.posyandu_id
                      ? posyandus.find(p => p.id === parseInt(signUpData.posyandu_id))?.name || 'Pilih Posyandu'
                      : 'Pilih Lokasi Posyandu'}
                  </span>
                  <Icon
                    icon="mdi:chevron-down"
                    style={{
                      fontSize: '1.5rem',
                      color: '#666',
                      transition: 'transform 0.3s',
                      transform: isPosyanduDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      marginRight: '10px'
                    }}
                  />
                </div>
                <AnimatePresence>
                  {isPosyanduDropdownOpen && (
                    <>
                      <div
                        style={{
                          position: 'fixed',
                          inset: 0,
                          zIndex: 10
                        }}
                        onClick={() => setIsPosyanduDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'white',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          zIndex: 20,
                          marginTop: '5px'
                        }}
                      >
                        {posyandus.length === 0 ? (
                          <div style={{ padding: '12px 16px', color: '#999', fontSize: '0.9rem' }}>
                            Memuat data posyandu...
                          </div>
                        ) : (
                          posyandus.map((posyandu) => (
                            <div
                              key={posyandu.id}
                              onClick={() => {
                                setSignUpData({ ...signUpData, posyandu_id: posyandu.id });
                                setIsPosyanduDropdownOpen(false);
                              }}
                              style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'background 0.2s',
                                background: parseInt(signUpData.posyandu_id) === posyandu.id ? '#e6f7ff' : 'white',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                              onMouseLeave={(e) => e.currentTarget.style.background = parseInt(signUpData.posyandu_id) === posyandu.id ? '#e6f7ff' : 'white'}
                            >
                              <span style={{
                                color: parseInt(signUpData.posyandu_id) === posyandu.id ? '#00BFEF' : '#333',
                                fontWeight: parseInt(signUpData.posyandu_id) === posyandu.id ? 600 : 400,
                                fontSize: '0.9rem'
                              }}>
                                {posyandu.name}
                              </span>
                              {parseInt(signUpData.posyandu_id) === posyandu.id && (
                                <Icon icon="mdi:check" style={{ color: '#00BFEF', fontSize: '1.2rem' }} />
                              )}
                            </div>
                          ))
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* RT & RW - Horizontal */}
              <div className="rt-rw-container">
                <div className={`input-field small-field ${fieldErrors.rt ? 'error' : ''}`}>
                  <i><Icon icon="mdi:home-group" /></i>
                  <input
                    type="text"
                    placeholder="RT"
                    autoComplete="off"
                    value={signUpData.rt}
                    onChange={(e) => setSignUpData({ ...signUpData, rt: e.target.value.trim() })}
                    required
                    disabled={signUpLoading}
                    maxLength={5}
                  />
                </div>
                <div className={`input-field small-field ${fieldErrors.rw ? 'error' : ''}`}>
                  <i><Icon icon="mdi:home-city" /></i>
                  <input
                    type="text"
                    placeholder="RW"
                    autoComplete="off"
                    value={signUpData.rw}
                    onChange={(e) => setSignUpData({ ...signUpData, rw: e.target.value.trim() })}
                    required
                    disabled={signUpLoading}
                    maxLength={5}
                  />
                </div>
              </div>

              {/* Alamat */}
              <div className={`input-field textarea-field ${fieldErrors.address ? 'error' : ''}`}>
                <i><Icon icon="mdi:map-marker" /></i>
                <textarea
                  placeholder="Alamat Lengkap"
                  autoComplete="street-address"
                  value={signUpData.address}
                  onChange={(e) => setSignUpData({ ...signUpData, address: e.target.value })}
                  required
                  disabled={signUpLoading}
                  rows={3}
                />
              </div>

              {/* Password */}
              <div className={`input-field password-field ${fieldErrors.password ? 'error' : ''}`}>
                <i><Icon icon="material-symbols:lock" /></i>
                <input
                  type={showSignUpPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="new-password"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value.trim() })}
                  required
                  disabled={signUpLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  disabled={signUpLoading}
                >
                  <Icon icon={showSignUpPassword ? "mdi:eye-off" : "mdi:eye"} />
                </button>
              </div>

              {/* Konfirmasi Password */}
              <div className={`input-field password-field ${fieldErrors.confirmPassword ? 'error' : ''}`}>
                <i><Icon icon="material-symbols:lock-outline" /></i>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Konfirmasi Password"
                  autoComplete="new-password"
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value.trim() })}
                  required
                  disabled={signUpLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={signUpLoading}
                >
                  <Icon icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"} />
                </button>
              </div>

              {/* Password hint */}
              <p style={{
                fontSize: '0.7rem',
                color: '#888',
                maxWidth: '380px',
                textAlign: 'center',
                marginTop: '-5px',
                marginBottom: '5px'
              }}>
                Min. 8 karakter, mengandung huruf besar, huruf kecil, dan angka
              </p>

              <input
                type="submit"
                value={signUpLoading ? "Memproses..." : "Daftar"}
                className="btn"
                disabled={signUpLoading}
              />
            </form>
          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>Belum Daftar?</h3>
              <p>Bergabunglah dengan keluarga besar NutriLogic demi masa depan buah hati yang lebih sehat dan bebas stunting!</p>
              <button
                type="button"
                className="btn transparent"
                onClick={(e) => {
                  e.preventDefault();
                  setIsSignUp(true);
                }}
              >
                Daftar
              </button>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="content">
              <h3>Sudah Punya Akun?</h3>
              <p>Selamat datang kembali! Masuk untuk melanjutkan perjalanan sehat bersama NutriLogic.</p>
              <button
                type="button"
                className="btn transparent"
                onClick={(e) => {
                  e.preventDefault();
                  setIsSignUp(false);
                }}
              >
                Masuk
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
