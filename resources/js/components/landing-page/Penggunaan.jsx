import React from 'react'
import { Timeline } from '@/components/ui/timeline';
import { motion, useScroll, useTransform } from 'framer-motion';

const Penggunaan = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const sectionRef = React.useRef(null);

  // Parallax effect for header
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const headerY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

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

  const usageData = [
    {
      title: "1. Registrasi & Login",
      content: (
        <div>
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-normal mb-6">
            Mulai perjalanan Anda dengan membuat akun. Pilih peran sebagai <strong>Orang Tua</strong> untuk memantau anak Anda, atau <strong>Kader</strong> untuk mengelola data posyandu.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <h4 className="font-semibold text-[#00BFEF] mb-1.5 text-sm">Orang Tua</h4>
              <p className="text-xs text-gray-500">Akses riwayat kesehatan anak dan rekomendasi gizi personal.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <h4 className="font-semibold text-[#00BFEF] mb-1.5 text-sm">Kader Posyandu</h4>
              <p className="text-xs text-gray-500">Kelola data balita dan jadwal kegiatan dengan efisien.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "2. Dashboard Utama",
      content: (
        <div>
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-normal mb-6">
            Setelah login, Anda akan disambut oleh Dashboard interaktif. Lihat ringkasan status gizi, jadwal imunisasi, dan notifikasi penting dalam satu tampilan.
          </p>
          <div className="bg-gradient-to-br from-[#00BFEF]/10 to-white p-4 rounded-xl border border-[#00BFEF]/20">
            <ul className="list-disc list-inside text-xs text-gray-600 space-y-1.5">
              <li>Grafik pertumbuhan real-time</li>
              <li>Status gizi terkini (Normal, Stunting, dll)</li>
              <li>Pengingat jadwal posyandu terdekat</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "3. Pencatatan Data",
      content: (
        <div>
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-normal mb-6">
            Input data pertumbuhan anak secara berkala. Masukkan berat badan, tinggi badan, dan lingkar kepala untuk mendapatkan analisis yang akurat.
          </p>
          <div className="flex gap-2 mb-3">
            <span className="px-2.5 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">Berat Badan</span>
            <span className="px-2.5 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">Tinggi Badan</span>
            <span className="px-2.5 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">Lingkar Kepala</span>
          </div>
          <p className="text-xs text-gray-500 italic">
            *Data dapat diinput oleh Kader saat posyandu atau Orang Tua secara mandiri.
          </p>
        </div>
      ),
    },
    {
      title: "4. Analisis AI & Rekomendasi",
      content: (
        <div>
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-normal mb-6">
            Teknologi AI kami akan menganalisis data yang masuk dan memberikan rekomendasi menu makanan serta aktivitas yang sesuai dengan kebutuhan anak.
          </p>
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-full bg-[#00BFEF] flex items-center justify-center text-white font-bold text-xs">AI</div>
              <div className="text-xs font-semibold text-gray-700">Rekomendasi Hari Ini</div>
            </div>
            <p className="text-xs text-gray-600">"Berdasarkan data terakhir, disarankan meningkatkan asupan protein. Coba menu: Sup Ikan Gabus."</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div ref={sectionRef} className='py-16 lg:py-24 font-montserrat px-6 md:px-[150px] lg:px-[230px] relative overflow-hidden' style={{ backgroundColor: '#ffffffff' }} id='Penggunaan'>
      {/* Parallax Background Elements */}
      <motion.div
        className="absolute top-0 left-0 w-64 h-64 bg-[#00BFEF]/5 rounded-full blur-3xl"
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, 100]) }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-[#0088c2]/5 rounded-full blur-3xl"
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }}
      />

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

      <div className='w-full relative z-10'>
        <motion.div
          className='text-center mb-8'
          style={{ y: headerY, opacity: headerOpacity }}
        >
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>
            Cara Penggunaan
          </h2>
          <p className={`text-gray-600 max-w-2xl mx-auto text-sm md:text-base ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>
            Panduan langkah demi langkah menggunakan NutriLogic untuk pemantauan gizi optimal.
          </p>
        </motion.div>

        <motion.div
          className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
          style={{ animationDelay: '500ms' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <Timeline data={usageData} />
        </motion.div>
      </div>
    </div>
  )
}

export default Penggunaan
