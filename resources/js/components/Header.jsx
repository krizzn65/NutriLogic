import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { assets } from '../assets/assets'

const Header = () => {
  const navigate = useNavigate()
  return (
    <div
      className='min-h-screen mb-4 bg-cover bg-center flex items-center w-full overflow-hidden'
      style={{ backgroundImage: `url(${assets.header_img})` }}
      id='Home'
    >
      <Navbar />
      <div className='container text-center mx-auto py-4 px-6 md:px-20 lg:px-32 text-white'>
        <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-[60px] font-semibold leading-tight max-w-[900px] max-h-[900px] mx-auto pt-5'>
          Cegah Stunting, Ciptakan <br className='hidden md:block' />
          Generasi Emas dengan <br className='hidden md:block' />
          NutriLogic.
        </h1>
        <p className='mt-6 text-base md:text-lg max-w-xl mx-auto font-medium text-gray-200'>
          Platform terpadu untuk gizi anak, edukasi keluarga, dan akses mudah ke layanan kesehatan demi masa depan yang lebih cerah
        </p>
        <div className='space-x-6 mt-12 font-semibold cursor-pointer hover:scale-105 transition-all duration-300'>
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
