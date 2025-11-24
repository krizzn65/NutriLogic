"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from '@iconify/react'
import { login, fetchMe } from '../../lib/auth';

export default function AuthSwitch() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const container = document.querySelector(".auth-container");
    if (!container) return;
    if (isSignUp) container.classList.add("sign-up-mode");
    else container.classList.remove("sign-up-mode");
  }, [isSignUp]);

  return (
    <div className="auth-page" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #FFFFFFFF 0%, #FFFFFFFF 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
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
          color: #667eea;
          border: 2px solid #667eea;
          padding: 10px 20px;
          border-radius: 50px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .back-button:hover {
          background: #667eea;
          color: white;
          transform: translateX(-5px);
        }

        .auth-container {
          position: relative;
          width: 100%;
          max-width: 900px;
          height: 550px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
          overflow: hidden;
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
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }

        form.sign-up-form {
          opacity: 0;
          z-index: 1;
        }

        form.sign-in-form {
          z-index: 2;
        }

        .title {
          font-size: 2.2rem;
          color: #444;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .input-field {
          max-width: 380px;
          width: 100%;
          background-color: #f0f0f0;
          margin: 10px 0;
          height: 55px;
          border-radius: 55px;
          display: grid;
          grid-template-columns: 15% 85%;
          padding: 0 0.4rem;
          position: relative;
          transition: 0.3s;
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
          width: 100%;
        }

        .input-field input::placeholder {
          color: #aaa;
          font-weight: 400;
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
          border-radius: 50%;
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
          .auth-container {
            min-height: 800px;
            height: 100vh;
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
          .panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }
          .panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2.5rem 8%;
            grid-column: 1 / 2;
          }
          .right-panel {
            grid-row: 3 / 4;
          }
          .left-panel {
            grid-row: 1 / 2;
          }
          .panel .content {
            padding-right: 15%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
          }
          .panel h3 {
            font-size: 1.2rem;
          }
          .panel p {
            font-size: 0.7rem;
            padding: 0.5rem 0;
          }
          .btn.transparent {
            width: 110px;
            height: 35px;
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
          form {
            padding: 0 1.5rem;
          }
          .panel .content {
            padding: 0.5rem 1rem;
          }
        }
      `}</style>

      <button onClick={() => navigate('/')} className="back-button">
        <span>←</span>
        <span>Kembali</span>
      </button>

      <div className="auth-container">
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
                  await login(email, password);
                  
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
                  // Handle error
                  const errorMessage = err.response?.data?.message || 'Login gagal. Silakan coba lagi.';
                  setError(errorMessage);
                } finally {
                  setLoading(false);
                }
              }}
            >
              <h2 className="title">Sign in</h2>
              {error && (
                <div style={{
                  color: '#dc3545',
                  fontSize: '0.85rem',
                  marginBottom: '10px',
                  padding: '8px 12px',
                  backgroundColor: '#f8d7da',
                  borderRadius: '8px',
                  width: '100%',
                  maxWidth: '380px',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}
              <div className="input-field">
                <i><Icon icon="mdi:email" /></i>
                <input 
                  type="email" 
                  placeholder="Email" 
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="input-field">
                <i><Icon icon="material-symbols:lock" /></i>
                <input 
                  type="password" 
                  placeholder="Password" 
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
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
              onSubmit={(e) => {
                e.preventDefault();
                navigate('/dashboard');
              }}
            >
              <h2 className="title">Sign up</h2>
              <div className="input-field">
                <i><Icon icon="mdi:account" /></i>
                <input 
                  type="text" 
                  placeholder="Username" 
                  autoComplete="off"
                  defaultValue=""
                />
              </div>
              <div className="input-field">
                <i><Icon icon="fluent:phone-16-filled" /></i>
                <input 
                  type="phone" 
                  placeholder="085xxxxxxx" 
                  autoComplete="off"
                  defaultValue=""
                />
              </div>
              <div className="input-field">
                <i><Icon icon="material-symbols:lock" /></i>
                <input 
                  type="password" 
                  placeholder="Password" 
                  autoComplete="new-password"
                  defaultValue=""
                />
              </div>
              <input type="submit" value="Sign up" className="btn" />
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
                Sign up
              </button>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="content">
              <h3>One of us?</h3>
              <p>Welcome back! Sign in to continue your journey with us.</p>
              <button 
                type="button"
                className="btn transparent" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsSignUp(false);
                }}
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
