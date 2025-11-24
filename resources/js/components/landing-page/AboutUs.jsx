import React from 'react'
import { assets } from '../../assets/assets'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'

const AboutUs = () => {
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1 })

  return (
    <div className='font-poppins min-h-screen flex items-center w-full bg-white overflow-hidden' id='About'>
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 3.5s ease-in-out infinite; }
      `}</style>

      <section ref={sectionRef} className='w-full px-6 md:px-[150px] lg:px-[230px] py-24 lg:py-32'>
        <div className='w-full flex flex-col lg:flex-row items-center gap-20 lg:gap-32'>

          {/* Left Column: Text Content */}
          <div className={`w-full lg:w-1/2 text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <span className='inline-block px-5 py-2 rounded-full bg-[#00BFEF]/10 text-[#00BFEF] text-base font-bold mb-8 tracking-wide'>
              Tentang Kami
            </span>

            <h2 className='font-poppins text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight mb-8'>
              Optimalkan Tumbuh <br />
              Kembang Balita <br />
              Dengan <br />
              <span className='text-[#00BFEF] whitespace-nowrap'>Monitoring Terintegrasi AI</span>
            </h2>

            <p className='font-poppins text-gray-600 text-xl lg:text-2xl leading-relaxed mb-12 max-w-2xl'>
              NutriLogic mengintegrasikan Kecerdasan Buatan (AI) canggih untuk memberikan pemantauan status gizi balita yang akurat dan real-time. Algoritma cerdas kami menganalisis pola pertumbuhan untuk mendeteksi tanda awal stunting, memastikan setiap anak mendapatkan perawatan tepat demi masa depan emas.
            </p>

            <div className='flex flex-wrap gap-6'>
              <button className='font-poppins px-10 py-5 bg-[#00BFEF] text-white text-lg rounded-full font-bold shadow-xl shadow-[#00BFEF]/30 hover:bg-[#009ec7] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300'>
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>

          {/* Right Column: Illustration & Floating Cards */}
          <div className={`w-full lg:w-1/2 relative h-[600px] sm:h-[700px] flex items-center justify-center transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>

            {/* Central Image Collage (2x2 Grid) */}
            <div className='relative z-10 w-[400px] sm:w-[500px] lg:w-[600px] aspect-square grid grid-cols-2 gap-4 sm:gap-6 p-4'>
              {/* Image 1 (Top Left) */}
              <div className='w-full h-full rounded-[2rem] overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-500'>
                <img src={assets.gmb_1} alt="Nutrition 1" className='w-full h-full object-cover' />
              </div>
              {/* Image 2 (Top Right) */}
              <div className='w-full h-full rounded-[2rem] overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-500'>
                <img src={assets.gmb_2} alt="Nutrition 2" className='w-full h-full object-cover' />
              </div>
              {/* Image 3 (Bottom Left) */}
              <div className='w-full h-full rounded-[2rem] overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-500'>
                <img src={assets.gmb_3} alt="Nutrition 3" className='w-full h-full object-cover' />
              </div>
              {/* Image 4 (Bottom Right) */}
              <div className='w-full h-full rounded-[2rem] overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-500'>
                <img src={assets.gmb_4} alt="Nutrition 4" className='w-full h-full object-cover' />
              </div>

              {/* Decorative Circle */}
              <div className='absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00BFEF]/10 rounded-full blur-3xl opacity-50'></div>
            </div>

            {/* Floating Card 1: Posyandu Stats (Top Left) */}
            <div className='absolute top-0 sm:top-10 -left-4 sm:-left-12 bg-white p-6 rounded-3xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] z-20 animate-float-slow max-w-[240px]'>
              <div className='flex items-center gap-4'>
                <div className='w-14 h-14 rounded-full bg-[#00BFEF]/10 flex items-center justify-center text-[#00BFEF]'>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                  <p className='text-2xl font-bold text-slate-900'>20+</p>
                  <p className='text-sm text-gray-500 font-medium'>Mitra Posyandu</p>
                </div>
              </div>
            </div>

            {/* Floating Card 2: Digital Stats (Bottom Left) */}
            <div className='absolute bottom-10 sm:bottom-20 left-0 sm:-left-8 bg-white p-6 rounded-3xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] z-20 animate-float-medium max-w-[240px]'>
              <div className='flex items-center gap-4'>
                <div className='w-14 h-14 rounded-full bg-[#00BFEF]/10 flex items-center justify-center text-[#00BFEF]'>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className='text-2xl font-bold text-slate-900'>100%</p>
                  <p className='text-sm text-gray-500 font-medium'>Sistem Digital</p>
                </div>
              </div>
            </div>

            {/* Floating Card 3: Access Stats (Right) */}
            <div className='absolute top-1/2 -right-4 sm:-right-16 transform -translate-y-1/2 bg-white p-6 rounded-3xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] z-20 animate-float-fast max-w-[240px]'>
              <div className='flex items-center gap-4'>
                <div className='w-14 h-14 rounded-full bg-[#00BFEF]/10 flex items-center justify-center text-[#00BFEF]'>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className='text-2xl font-bold text-slate-900'>24/7</p>
                  <p className='text-sm text-gray-500 font-medium'>Akses Layanan</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutUs
