"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { isAuthenticated } from '../../lib/auth';

const AnimatedNavLink = ({ onClick, children, isScrolled }) => {
  const defaultTextColor = isScrolled ? 'text-gray-600' : 'text-gray-200';
  const hoverTextColor = isScrolled ? 'text-gray-900' : 'text-white';
  const textSizeClass = 'text-sm';

  return (
    <button
      onClick={onClick}
      className={`group relative inline-block overflow-hidden h-5 flex items-center ${textSizeClass} focus:outline-none focus:ring-0 active:outline-none`}>
      <div
        className="flex flex-col transition-transform duration-400 ease-out transform group-hover:-translate-y-1/2">
        <span className={defaultTextColor}>{children}</span>
        <span className={hoverTextColor}>{children}</span>
      </div>
    </button>
  );
};

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full');
  const shapeTimeoutRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isOpen) {
      setHeaderShapeClass('rounded-xl');
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass('rounded-full');
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const logoElement = (
    <div className="relative flex items-center h-8">
      <img
        src={isScrolled ? assets.logo_scroll : assets.logo}
        alt="NutriLogic Logo"
        className="h-8 w-auto transition-opacity duration-300"
      />
    </div>
  );

  const navLinksData = [
    { label: 'Home', id: 'Home' },
    { label: 'About', id: 'About' },
    { label: 'Data', id: 'Problem' },
    { label: 'Fitur', id: 'Fitur' },
    { label: 'Penggunaan', id: 'Penggunaan' },
    { label: 'Contact', id: 'Contact' },
  ];

  const handleNavClick = (id) => {
    const element = document.querySelector(`#${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    if (isOpen) {
      setIsOpen(false);
    }
  };

  const isLoggedIn = isAuthenticated();

  const loginButtonElement = (
    <button
      onClick={() => navigate(isLoggedIn ? '/dashboard' : '/auth')}
      className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 w-full sm:w-auto ${isScrolled
        ? 'bg-[#00BFEF] text-white shadow-[0_0_20px_rgba(0,191,239,0.6)] hover:shadow-[0_0_25px_rgba(0,191,239,0.8)] hover:bg-[#009ec7]'
        : 'bg-white text-gray-800 hover:bg-gray-100 shadow-sm hover:shadow-md'
        }`}>
      {isLoggedIn ? 'Dashboard' : 'Login'}
    </button>
  );

  return (
    <header
      className={`fixed z-50
                         flex flex-col backdrop-blur-md
                         transition-all duration-500 ease-in-out
                         ${isScrolled
          ? isOpen
            ? 'top-0 left-0 right-0 w-full bg-white rounded-b-2xl px-4 py-4 shadow-lg items-center pointer-events-auto sm:top-6 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 sm:w-auto sm:rounded-full sm:bg-white/90 sm:px-6 sm:py-3'
            : 'top-0 left-0 w-full bg-transparent shadow-none items-end pr-4 pt-4 pointer-events-none sm:top-6 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 sm:w-auto sm:h-auto sm:rounded-full sm:bg-white/90 sm:px-6 sm:py-3 sm:items-center sm:pr-6 sm:pt-3 sm:pointer-events-auto'
          : 'top-0 left-1/2 transform -translate-x-1/2 w-full rounded-none px-4 sm:px-6 md:px-20 lg:px-32 py-4 border-b border-white/20 bg-white/10 items-center pointer-events-auto'
        }`}>
      <div className={`flex items-center w-full transition-all duration-500
        ${isScrolled && !isOpen ? 'justify-center sm:justify-between' : 'justify-between'}
        ${isScrolled ? 'gap-x-0 sm:gap-x-6 md:gap-x-8' : 'gap-x-4 sm:gap-x-8 md:gap-x-12'}
        `}>
        <div className={`flex items-center ${isScrolled && !isOpen ? 'hidden sm:flex' : 'flex'}`}>
          {logoElement}
        </div>

        <nav className={`hidden sm:flex items-center text-sm transition-all duration-500 ${isScrolled ? 'space-x-4 sm:space-x-6' : 'space-x-6 sm:space-x-8'
          }`}>
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.id} onClick={() => handleNavClick(link.id)} isScrolled={isScrolled}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          {loginButtonElement}
        </div>

        <button
          className={`sm:hidden flex items-center justify-center w-10 h-10 focus:outline-none transition-colors duration-300 pointer-events-auto ${isScrolled ? 'text-gray-800' : 'text-white'
            }`}
          onClick={toggleMenu}
          aria-label={isOpen ? 'Close Menu' : 'Open Menu'}>
          {isOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"><path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"></path></svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"><path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"></path></svg>
          )}
        </button>
      </div>
      <div
        className={`sm:hidden flex flex-col w-full transition-all ease-in-out duration-300 overflow-hidden
                         ${isOpen ? 'max-h-[1000px] opacity-100 pt-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none'}`}>
        <nav className="flex flex-col items-center space-y-4 text-base w-full">
          {navLinksData.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`transition-colors w-full text-center ${isScrolled
                ? 'text-gray-600 hover:text-gray-900'
                : 'text-gray-200 hover:text-white'
                }`}>
              {link.label}
            </button>
          ))}
        </nav>
        <div className="flex flex-col items-center space-y-4 mt-4 w-full">
          {loginButtonElement}
        </div>
      </div>
    </header>
  );
}
