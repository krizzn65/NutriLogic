import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import Navbar from './Navbar'
import { assets } from '../../assets/assets'

const Header = () => {
  const navigate = useNavigate()
  const statsRef = useRef(null)
  const [count1, setCount1] = useState(0) // Counter for 20+
  const [count2, setCount2] = useState(0) // Counter for 18
  const [hasAnimated, setHasAnimated] = useState(false)

  // Count-up animation effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true)

            // Start count-up after the fade-in animation delay (800ms)
            setTimeout(() => {
              // Animate counter 1 (20+)
              const duration1 = 2000 // 2 seconds
              const steps1 = 20
              const increment1 = duration1 / steps1

              let current1 = 0
              const timer1 = setInterval(() => {
                current1++
                setCount1(current1)
                if (current1 >= 20) {
                  clearInterval(timer1)
                }
              }, increment1)

              // Animate counter 2 (18)
              const duration2 = 1800 // 1.8 seconds
              const steps2 = 18
              const increment2 = duration2 / steps2

              let current2 = 0
              const timer2 = setInterval(() => {
                current2++
                setCount2(current2)
                if (current2 >= 18) {
                  clearInterval(timer2)
                }
              }, increment2)

              return () => {
                clearInterval(timer1)
                clearInterval(timer2)
              }
            }, 800) // Match the animation delay
          }
        })
      },
      { threshold: 0.1 }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current)
      }
    }
  }, [hasAnimated])

  return (
    <div
      className='relative min-h-screen mb-4 w-full overflow-hidden font-poppins'
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

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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

        .animate-fade-in-left {
          animation: fadeInLeft 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-scale {
          animation: fadeInScale 0.8s ease-out forwards;
          opacity: 0;
        }

        .glassmorphism-stats {
          background: rgba(255, 255, 255, 0.10);
          backdrop-filter: blur(4px) saturate(180%);
          -webkit-backdrop-filter: blur(4px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
        }
      `}</style>

      {/* Background Image - Full Width */}
      <div
        className='absolute inset-0 bg-cover bg-center'
        style={{ backgroundImage: `url(${assets.header_img})` }}
      />

      {/* Navbar */}
      <div className='relative z-20'>
        <Navbar />
      </div>

      {/* Main Content */}
      <div className='relative z-10 min-h-screen flex flex-col'>
        {/* Content Container */}
        <div className='flex-1 flex items-center'>
          <div className='px-6 md:pl-[150px] lg:pl-[230px] md:pr-12 lg:pr-20 xl:pr-32 w-full'>
            <div className='max-w-5xl'>
              {/* Main Heading */}
              <h1 className='font-poppins text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white animate-fade-in-left'
                style={{ animationDelay: '200ms' }}>
                <div>Cegah Stunting, Ciptakan</div>
                <div>Generasi Emas Dengan</div>
                <div>NutriLogic.</div>
              </h1>

              {/* Subheading */}
              <p className='font-poppins mt-6 md:mt-8 text-base md:text-lg lg:text-xl text-white/95 leading-relaxed font-medium animate-fade-in-left'
                style={{ animationDelay: '400ms' }}>
                Platform Terpadu Untuk Gizi Anak, Edukasi Keluarga, Dan Akses Mudah Ke Layanan Kesehatan Demi Masa Depan Yang Lebih Cerah
              </p>

              {/* CTA Button */}
              <div className='mt-8 md:mt-10 animate-fade-in-scale' style={{ animationDelay: '600ms' }}>
                <button
                  onClick={() => navigate('/auth')}
                  className='font-poppins bg-white text-gray-800 px-8 md:px-10 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg shadow-[0_0_20px_rgba(255,255,255,0.6)] hover:shadow-[0_0_30px_rgba(255,255,255,0.8)] hover:scale-105 transition-all duration-300'
                >
                  Cek Status Gizi Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Card - Single Transparent Card */}
        <div className='absolute bottom-0 right-0 w-full md:w-auto' ref={statsRef}>
          <div
            className='glassmorphism-stats animate-fade-in-up w-full md:w-[1415px] h-auto md:h-[200px] rounded-t-2xl md:rounded-t-none md:rounded-tl-[13px]'
            style={{
              animationDelay: '800ms',
            }}
          >
            <div className='h-full flex flex-wrap md:flex-nowrap items-center justify-between px-4 py-6 md:py-0 md:px-40 gap-4 md:gap-0'>
              {/* Stat 1 */}
              <div className='text-center text-white'>
                <h3 className='font-poppins text-4xl md:text-5xl lg:text-6xl font-extrabold mb-2'>
                  {count1}{count1 >= 20 ? '+' : ''}
                </h3>
                <p className='font-poppins text-sm md:text-base font-medium opacity-90'>Posyandu Setempat</p>
              </div>

              {/* Stat 2 */}
              <div className='text-center text-white'>
                <h3 className='font-poppins text-4xl md:text-5xl lg:text-6xl font-extrabold mb-2'>{count2}</h3>
                <p className='font-poppins text-sm md:text-base font-medium opacity-90'>Dusun Terdaftar</p>
              </div>

              {/* Stat 3 */}
              <div className='text-center text-white'>
                <h3 className='font-poppins text-4xl md:text-5xl lg:text-6xl font-extrabold mb-2'>AI</h3>
                <p className='font-poppins text-sm md:text-base font-medium opacity-90'>Integrasi</p>
              </div>

              {/* Stat 4 */}
              <div className='text-center text-white'>
                <div className='flex justify-center mb-2'>
                  <Icon icon="bxs:chart" className='w-10 h-10 md:w-12 md:h-12' />
                </div>
                <p className='font-poppins text-sm md:text-base font-medium opacity-90'>Monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
