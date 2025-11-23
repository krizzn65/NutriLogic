import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { assets } from '../../assets/assets'

const Header = () => {
  const navigate = useNavigate()
  return (
    <div
      className='min-h-screen mb-4 bg-cover bg-center flex items-center w-full overflow-hidden font-montserrat'
      style={{ backgroundImage: `url(${assets.header_img})` }}
      id='Home'
    >
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-scale {
          animation: fadeInScale 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
      <Navbar />
      <div className='container text-center mx-auto py-4 px-6 md:px-20 lg:px-32 text-white'>
        <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-[60px] font-semibold leading-tight max-w-[900px] max-h-[900px] mx-auto pt-5 animate-fade-in-up' style={{ animationDelay: '200ms' }}>
          Cegah Stunting, Ciptakan <br className='hidden md:block' />
          Generasi Emas dengan <br className='hidden md:block' />
          NutriLogic.
        </h1>
        <p className='mt-6 text-base md:text-lg max-w-xl mx-auto font-medium text-gray-200 animate-fade-in-up' style={{ animationDelay: '400ms' }}>
          Platform terpadu untuk gizi anak, edukasi keluarga, dan akses mudah ke layanan kesehatan demi masa depan yang lebih cerah
        </p>
        <div className='space-x-6 mt-12 font-semibold cursor-pointer hover:scale-105 transition-all duration-300 animate-fade-in-scale' style={{ animationDelay: '600ms' }}>
          <button 
            onClick={() => navigate('/auth')} 
            className='border bg-white px-8 py-3 rounded-4xl text-gray-700'
          >
            Cek Status Gizi Sekarang
          </button>
        </div>
      </div>
    </div>
  )
}

export default Header
