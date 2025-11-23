import React from 'react'

const Penggunaan = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const sectionRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div ref={sectionRef} className='py-16 font-montserrat' style={{ backgroundColor: '#F3F4F6' }} id='Penggunaan'>
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

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
      <div className='container mx-auto px-6 md:px-20 lg:px-32'>
        <div className='text-center mb-12'>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>
            Cara Penggunaan
          </h2>
          <p className={`text-gray-600 max-w-2xl mx-auto text-lg ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>
            Mulai gunakan NutriLogic dalam beberapa langkah mudah
          </p>
        </div>
        {/* Add penggunaan content here */}
      </div>
    </div>
  )
}

export default Penggunaan
