import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const Navbar = () => {
   const navigate = useNavigate()
   const [showMobileMenu, setShowMobileMenu] = useState(false)
   const [isScrolled, setIsScrolled] = useState(false)

  // Efek ketika scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Disable scroll saat mobile menu aktif
  useEffect(() => {
    document.body.style.overflow = showMobileMenu ? 'hidden' : 'auto'
  }, [showMobileMenu])

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
        isScrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div
        className={`container mx-auto flex justify-between items-center px-6 md:px-20 lg:px-32 transition-all duration-300 ease-in-out ${
          isScrolled
            ? 'md:bg-white/90 md:backdrop-blur-md md:shadow-lg md:rounded-full md:text-gray-800 py-3'
            : 'bg-transparent text-white py-4'
        }`}
      >
        {/* ====== Logo Section ====== */}
        <div className="relative flex items-center h-8">
          {/* Logo default (awal & mobile) */}
          <img
            src={assets.logo}
            alt="logo"
            className={`h-8 w-auto transition-opacity duration-300 ${
              isScrolled ? 'opacity-0 md:opacity-0' : 'opacity-100'
            }`}
          />

          {/* Logo scroll (tampil hanya di desktop pas scroll) */}
          <img
            src={assets.logo_scroll}
            alt="logo scroll"
            className={`h-8 w-auto absolute top-0 left-0 transition-opacity duration-300 hidden md:block ${
              isScrolled ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        {/* ====== Desktop Menu ====== */}
        <ul className="hidden md:flex gap-7 font-medium transition-colors duration-200">
  {['Home', 'Problem', 'Fitur', 'Penggunaan', 'Testimonial'].map((item) => (
    <button
      key={item}
      onClick={(e) => {
        e.preventDefault()
        document
          .querySelector(`#${item}`)
          ?.scrollIntoView({ behavior: 'smooth' })
      }}
      className="cursor-pointer hover:text-[#6FE0FF] transition-colors duration-150"
    >
      {item}
    </button>
  ))}
</ul>

        {/* ====== Tombol Sign Up (desktop only) ====== */}
        <button
          onClick={() => navigate('/auth')}
          className={`hidden md:block px-8 py-2 rounded-full cursor-pointer hover:scale-105 transition-all duration-300 font-semibold ${
            isScrolled
              ? 'bg-white text-gray-700 hover:bg-white/90'
              : 'bg-white text-gray-700 hover:bg-white/90'
          }`}
        >
          Login
        </button>

        {/* ====== Menu Icon Mobile ====== */}
        <img
          onClick={() => setShowMobileMenu(true)}
          src={assets.menu_icon}
          alt="menu"
          className={`md:hidden w-7 cursor-pointer hover:scale-110 transition-all duration-300 
            ${
              isScrolled
                ? 'filter brightness-0 saturate-100 invert-[23%] sepia-0 hue-rotate-[200deg] brightness-[98%] contrast-[92%]' // abu tua #3A3A3A
                : 'invert brightness-0' // putih
            }`}
        />
      </div>

      {/* ====== Backdrop Overlay ====== */}
      <div
        className={`md:hidden fixed inset-0 bg-black transition-all duration-500 ease-in-out ${
          showMobileMenu ? 'opacity-60 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setShowMobileMenu(false)}
      />

      {/* ====== Mobile Menu ====== */}
      <div
        className={`md:hidden fixed right-0 top-0 bottom-0 bg-gradient-to-br from-white to-gray-50 backdrop-blur-lg transition-all duration-500 ease-out z-50 shadow-2xl ${
          showMobileMenu ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <div className="flex justify-end p-6">
          <div
            onClick={() => setShowMobileMenu(false)}
            className={`cursor-pointer p-2 rounded-full hover:text-[#6FE0FF] transition-all duration-300 ${
              showMobileMenu
                ? 'opacity-100 scale-100 rotate-0'
                : 'opacity-0 scale-50 rotate-180'
            }`}
          >
            <img src={assets.cross_icon} className="w-6" alt="close" />
          </div>
        </div>

        <ul className="flex flex-col items-center gap-3 mt-10 px-5 text-lg font-medium">
   {['Home', 'Problem', 'Fitur', 'Penggunaan', 'Testimonial'].map((item, i) => (
    <button
      key={item}
      onClick={(e) => {
        e.preventDefault()
        setShowMobileMenu(false)
        setTimeout(() => {
          document
            .querySelector(`#${item}`)
            ?.scrollIntoView({ behavior: 'smooth' })
        }, 300) // biar tunggu animasi menu close dulu
      }}
      className={`px-6 py-3 rounded-full inline-block w-48 text-center hover:text-[#6FE0FF] hover:bg-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-300 ${
        showMobileMenu
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-20'
      }`}
      style={{
        transitionDelay: showMobileMenu ? `${(i + 1) * 80}ms` : '0ms',
      }}
    >
      {item}
    </button>
  ))}
</ul>

        <div
          className={`absolute bottom-10 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500 ${
            showMobileMenu ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
          style={{ transitionDelay: '400ms' }}
        />
      </div>
    </div>
  )
}

export default Navbar