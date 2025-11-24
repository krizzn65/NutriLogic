"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const handleVerifyCode = async (code) => {
    // Simulate API call to verify code
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful verification
        resolve(true);
      }, 1000);
    });
  };

  const handleResetPassword = async (password) => {
    // Simulate API call to reset password
    return new Promise((resolve) => {
      setTimeout(() => {
        alert('Password berhasil direset!');
        navigate('/auth');
        resolve(true);
      }, 1000);
    });
  };

  const handleCancel = () => {
    navigate('/auth');
  };

  return (
    <motion.div 
      className="forgot-password-page" 
      style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #FFFFFFFF 0%, #FFFFFFFF 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      padding: '20px'
    }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
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

        .forgot-password-container {
          position: relative;
          width: 100%;
          max-width: 550px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          padding: 60px 50px;
        }

        /* Override shadcn styles to match theme */
        .forgot-password-container [class*="rounded-lg"],
        .forgot-password-container > div > div {
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          background: transparent !important;
          max-width: 100% !important;
        }

        .forgot-password-container h1 {
          font-size: 2rem !important;
          color: #444 !important;
          margin-bottom: 10px !important;
          font-weight: 700 !important;
          text-align: center;
        }

        .forgot-password-container p {
          font-size: 0.95rem !important;
          color: #666 !important;
          margin-bottom: 30px !important;
          text-align: center;
        }

        /* OTP Input Container */
        .forgot-password-container div[class*="space-y-2"] {
          margin-bottom: 20px;
        }

        .forgot-password-container div[class*="flex justify-center"] {
          gap: 10px;
          justify-content: center;
        }

        /* OTP Input Styling */
        .forgot-password-container input[type="text"],
        .forgot-password-container input[maxlength="1"] {
          width: 50px !important;
          height: 55px !important;
          background-color: #f0f0f0 !important;
          border: 2px solid transparent !important;
          border-radius: 10px !important;
          color: #333 !important;
          font-size: 1.5rem !important;
          font-weight: 600 !important;
          box-shadow: none !important;
          text-align: center !important;
          padding: 0 !important;
        }

        .forgot-password-container input[type="text"]:focus,
        .forgot-password-container input[maxlength="1"]:focus {
          background-color: #e8e8e8 !important;
          border-color: #00BFEF !important;
          outline: none !important;
          ring: 0 !important;
          box-shadow: none !important;
        }

        .forgot-password-container input[type="text"]:disabled,
        .forgot-password-container input[maxlength="1"]:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Password Input Container */
        .forgot-password-container div[class*="relative"] {
          position: relative;
          width: 100%;
        }

        /* Hide password manager icons */
        .forgot-password-container input[type="password"]::-ms-reveal,
        .forgot-password-container input[type="password"]::-ms-clear {
          display: none !important;
        }

        .forgot-password-container input::-webkit-credentials-auto-fill-button {
          display: none !important;
        }

        /* Hide all SVG icons inside password input except the eye icon */
        .forgot-password-container div[class*="relative"] svg:not([class*="h-5"]) {
          display: none !important;
        }

        /* Password Input Styling */
        .forgot-password-container input[type="password"],
        .forgot-password-container input[type="text"][placeholder*="•"] {
          width: 100% !important;
          background-color: #f0f0f0 !important;
          border: 2px solid transparent !important;
          border-radius: 55px !important;
          height: 55px !important;
          padding: 0 50px 0 20px !important;
          font-size: 1rem !important;
          color: #333 !important;
          box-shadow: none !important;
        }

        .forgot-password-container input[type="password"]:focus,
        .forgot-password-container input[type="text"][placeholder*="•"]:focus {
          background-color: #e8e8e8 !important;
          border-color: #00BFEF !important;
          outline: none !important;
          box-shadow: none !important;
          ring: 0 !important;
        }

        .forgot-password-container input[type="password"]::placeholder,
        .forgot-password-container input[type="text"][placeholder*="•"]::placeholder {
          color: #aaa !important;
          font-weight: 400 !important;
        }

        /* Eye icon button */
        .forgot-password-container button[aria-label*="password"] {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          width: auto !important;
          height: auto !important;
          box-shadow: none !important;
          color: #666 !important;
          z-index: 10;
        }

        .forgot-password-container button[aria-label*="password"]:hover {
          background: transparent !important;
          color: #333 !important;
          transform: translateY(-50%) !important;
        }

        /* Hide the eye icon on the left side */
        .forgot-password-container div[class*="relative"] > button:first-of-type {
          display: none !important;
        }

        .forgot-password-container div[class*="relative"] > button:last-of-type {
          display: flex !important;
        }

        /* Submit & Cancel Buttons */
        .forgot-password-container div[class*="mt-8"] {
          margin-top: 30px !important;
          display: flex;
          justify-content: flex-end;
          gap: 15px;
        }

        .forgot-password-container button[type="submit"] {
          background-color: #00BFEF !important;
          height: 49px !important;
          border-radius: 49px !important;
          border: none !important;
          box-shadow: none !important;
          color: white !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          padding: 0 30px !important;
          min-width: 150px !important;
        }

        .forgot-password-container button[type="submit"]:hover:not(:disabled) {
          background-color: #0ADFDD !important;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 191, 239, 0.4) !important;
        }

        .forgot-password-container button[type="submit"]:disabled {
          background-color: #ccc !important;
          cursor: not-allowed !important;
          transform: none !important;
        }

        .forgot-password-container button[type="button"]:not([aria-label]) {
          border: 2px solid #667eea !important;
          color: #667eea !important;
          background: white !important;
          border-radius: 49px !important;
          height: 49px !important;
          box-shadow: none !important;
          font-weight: 600 !important;
          padding: 0 25px !important;
          min-width: 100px !important;
        }

        .forgot-password-container button[type="button"]:not([aria-label]):hover {
          background-color: #667eea !important;
          color: white !important;
        }

        /* Password requirements styling */
        .forgot-password-container [class*="text-green"] {
          color: #28a745 !important;
        }

        .forgot-password-container [class*="text-muted"] {
          color: #666 !important;
        }

        .forgot-password-container div[class*="text-sm text-green"] {
          color: #28a745 !important;
          font-weight: 500;
        }

        .forgot-password-container div[class*="text-sm text-muted"] {
          color: #666 !important;
        }

        .forgot-password-container p[class*="text-center"] {
          text-align: center;
          margin: 10px 0;
        }

        .forgot-password-container hr {
          border-color: #e0e0e0 !important;
          margin: 25px 0 !important;
          border-top: 1px solid #e0e0e0;
          border-bottom: none;
        }

        .forgot-password-container h2 {
          font-size: 1.2rem !important;
          color: #444 !important;
          font-weight: 600 !important;
          margin-bottom: 15px !important;
        }

        /* Grid for password requirements */
        .forgot-password-container div[class*="grid"] {
          margin-top: 15px;
        }

        @media (max-width: 570px) {
          .forgot-password-container {
            padding: 40px 30px;
          }
        }
      `}</style>

      <button onClick={() => navigate('/auth')} className="back-button">
        <span>←</span>
        <span>Kembali</span>
      </button>

      <div className="forgot-password-container">
        <ResetPasswordForm
          email="085xxxxxxx"
          onVerifyCode={handleVerifyCode}
          onSubmit={handleResetPassword}
          onCancel={handleCancel}
        />
      </div>
    </motion.div>
  );
}
