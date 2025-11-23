import React, { useState } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

// --- Data for the image accordion ---
const accordionItems = [
  {
    id: 1,
    title: 'Posyandu',
    imageUrl: '/gmb_1.png',
  },
  {
    id: 2,
    title: 'Edukasi Kesehatan',
    imageUrl: '/header_img.png',
  },
  {
    id: 3,
    title: 'Pelayanan Posyandu',
    imageUrl: '/gmb_1.png',
  },
  {
    id: 4,
    title: 'Teknologi Digital',
    imageUrl: '/header_img.png',
  },
  {
    id: 5,
    title: 'Komunitas Sehat',
    imageUrl: '/gmb_1.png',
  },
];

// --- Accordion Card Component (Redesigned) ---
const AccordionCard = ({ item, isActive, onMouseEnter, index, isVisible }) => {
  return (
    <div
      className={`
        relative overflow-hidden cursor-pointer
        transition-all duration-700 ease-in-out
        h-[300px] sm:h-[400px] md:h-[500px] lg:h-[650px]
        rounded-2xl shadow-lg
        ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}
        ${isActive ? 'w-[200px] sm:w-[300px] md:w-[400px] lg:w-[600px]' : 'w-[50px] sm:w-[60px] md:w-[80px] lg:w-[100px]'}
      `}
      style={{
        backgroundImage: `url(${item.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        animationDelay: `${index * 150}ms`,
      }}
      onMouseEnter={onMouseEnter}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      
      {/* Title */}
      <div
        className={`
          absolute text-white font-bold whitespace-nowrap
          transition-all duration-300 ease-in-out
          text-sm sm:text-base md:text-lg lg:text-2xl
          drop-shadow-lg
          ${
            isActive
              ? 'bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 rotate-0'
              : 'bottom-16 sm:bottom-20 md:bottom-24 lg:bottom-32 left-1/2 -translate-x-1/2 rotate-90'
          }
        `}
      >
        {item.title}
      </div>
    </div>
  );
};


// --- Main AboutUs Component ---
const AboutUs = () => {
  const [activeIndex, setActiveIndex] = useState(4);
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  const handleItemHover = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className="font-montserrat min-h-screen flex items-center w-full" style={{ backgroundColor: '#F3F4F6' }} id="About">
      <section ref={sectionRef} className="w-full px-4 sm:px-8 md:px-12 lg:px-20 xl:px-32 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 md:gap-16 lg:gap-20 w-full">
          
          {/* Left Side: Text Content */}
          <div className="w-full lg:w-[45%] text-center lg:text-left">
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 leading-tight tracking-tighter ${isVisible ? 'animate-fade-in-left delay-100' : 'opacity-0'}`}>
              About NutriLogic
            </h1>
            <p className={`mt-6 sm:mt-8 md:mt-10 text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed ${isVisible ? 'animate-fade-in-left delay-300' : 'opacity-0'}`}>
              NutriLogic hadir sebagai solusi digital terintegrasi untuk optimalisasi pemantauan status gizi anak dan kinerja Posyandu.
             Secara khusus, platform ini dirancang untuk mendukung ekosistem kesehatan di Desa Kaliwining, 
              bersinergi langsung dengan 21 Posyandu setempat.
            </p>
            <p className={`mt-4 sm:mt-6 md:mt-8 text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed ${isVisible ? 'animate-fade-in-left delay-500' : 'opacity-0'}`}>
              Kami berkomitmen menjadikan teknologi sebagai jembatan untuk menciptakan generasi yang lebih sehat melalui data yang akurat, pemantauan real-time, dan kemudahan akses bagi para kader maupun orang tua.
            </p>
          </div>

          {/* Right Side: Image Accordion */}
          <div className="w-full lg:w-[55%] flex justify-center lg:justify-end overflow-x-auto">
            <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 min-w-fit">
              {accordionItems.map((item, index) => (
                <AccordionCard
                  key={item.id}
                  item={item}
                  index={index}
                  isActive={index === activeIndex}
                  isVisible={isVisible}
                  onMouseEnter={() => handleItemHover(index)} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
