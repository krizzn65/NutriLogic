import React, { useState, useEffect, useRef } from 'react'
import RadialOrbitalTimeline from '../ui/radial-orbital-timeline'
import { Icon } from '@iconify/react'
import {
  Activity,
  Brain,
  Users,
  MessageCircle,
  Award,
  Shield
} from 'lucide-react'

const Fitur = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState(0)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  // Data fitur NutriLogic dengan analisis mendalam
  const features = [
    {
      id: 1,
      icon: Activity,
      title: 'Monitoring Pertumbuhan Real-Time',
      status: 'completed',
      date: 'Core Feature',
      energy: 95,
      relatedIds: [2, 6],
      content: 'Sistem monitoring pertumbuhan anak secara real-time dengan grafik interaktif',
      description: {
        overview: 'Fitur monitoring pertumbuhan real-time memungkinkan orang tua dan kader posyandu untuk memantau perkembangan anak secara kontinyu dengan visualisasi data yang mudah dipahami.',
        benefits: [
          'Deteksi dini gangguan pertumbuhan melalui grafik Z-Score WHO',
          'Notifikasi otomatis jika ada penyimpangan dari kurva pertumbuhan normal',
          'Riwayat lengkap pengukuran berat badan, tinggi badan, dan lingkar kepala',
          'Perbandingan dengan standar WHO untuk anak seusia'
        ],
        techDetails: 'Menggunakan algoritma WHO Child Growth Standards dengan perhitungan Z-Score untuk tinggi/umur, berat/umur, dan berat/tinggi. Data divisualisasikan dalam grafik interaktif yang dapat di-zoom dan di-filter berdasarkan periode waktu.',
        userImpact: 'Orang tua dapat melihat perkembangan anak mereka kapan saja melalui dashboard mobile-friendly, sementara kader posyandu mendapat overview semua anak dalam wilayah mereka untuk prioritisasi intervensi.'
      }
    },
    {
      id: 2,
      icon: Brain,
      title: 'Rekomendasi Nutrisi AI',
      status: 'completed',
      date: 'AI-Powered',
      energy: 88,
      relatedIds: [1, 3],
      content: 'Rekomendasi menu dan nutrisi berbasis AI yang dipersonalisasi',
      description: {
        overview: 'Sistem AI yang menganalisis kondisi anak dan memberikan rekomendasi menu makanan yang disesuaikan dengan kebutuhan nutrisi spesifik, usia, dan kondisi kesehatan anak.',
        benefits: [
          'Menu harian yang disesuaikan dengan kebutuhan kalori dan nutrisi anak',
          'Alternatif bahan makanan lokal yang terjangkau dan mudah didapat',
          'Panduan porsi yang tepat sesuai usia dan berat badan anak',
          'Resep lengkap dengan cara memasak yang mudah dipahami'
        ],
        techDetails: 'Menggunakan machine learning model yang dilatih dengan data nutrisi Indonesia dan panduan gizi seimbang Kemenkes. AI mempertimbangkan faktor seperti usia, berat badan, tinggi badan, riwayat kesehatan, dan preferensi makanan lokal.',
        userImpact: 'Orang tua mendapat panduan praktis menu sehari-hari tanpa perlu konsultasi berulang. Sistem juga memberikan edukasi tentang pentingnya setiap nutrisi untuk pertumbuhan anak.'
      }
    },
    {
      id: 3,
      icon: Users,
      title: 'Kolaborasi Orang Tua & Kader',
      status: 'completed',
      date: 'Collaboration',
      energy: 92,
      relatedIds: [2, 4],
      content: 'Platform kolaborasi antara orang tua dan kader posyandu',
      description: {
        overview: 'Sistem terintegrasi yang menghubungkan orang tua dengan kader posyandu untuk koordinasi yang lebih baik dalam pemantauan dan penanganan stunting.',
        benefits: [
          'Komunikasi langsung antara orang tua dan kader melalui chat terenkripsi',
          'Sharing data pertumbuhan anak secara aman dan terkontrol',
          'Penjadwalan kunjungan posyandu dan reminder otomatis',
          'Laporan perkembangan yang dapat diakses oleh kedua belah pihak'
        ],
        techDetails: 'Menggunakan role-based access control (RBAC) untuk memastikan privasi data. Kader dapat melihat data anak dalam wilayahnya, sementara orang tua hanya dapat mengakses data anak mereka sendiri. Sistem notifikasi push untuk reminder dan update penting.',
        userImpact: 'Meningkatkan partisipasi orang tua dalam program posyandu dan memudahkan kader dalam melakukan follow-up. Mengurangi kasus anak yang terlewat dari monitoring karena sistem reminder otomatis.'
      }
    },
    {
      id: 4,
      icon: MessageCircle,
      title: 'Konsultasi Virtual',
      status: 'completed',
      date: 'Telemedicine',
      energy: 85,
      relatedIds: [3, 5],
      content: 'Layanan konsultasi dengan tenaga kesehatan secara virtual',
      description: {
        overview: 'Fitur telemedicine yang memungkinkan orang tua berkonsultasi dengan tenaga kesehatan profesional tanpa harus datang ke fasilitas kesehatan.',
        benefits: [
          'Konsultasi dengan ahli gizi dan dokter anak bersertifikat',
          'Jadwal konsultasi yang fleksibel sesuai kebutuhan',
          'Riwayat konsultasi tersimpan untuk referensi di masa depan',
          'Resep digital dan rekomendasi tindak lanjut'
        ],
        techDetails: 'Integrasi dengan sistem video call yang aman dan terenkripsi end-to-end. Fitur screen sharing untuk menunjukkan grafik pertumbuhan anak. Sistem antrian virtual untuk mengoptimalkan waktu tunggu.',
        userImpact: 'Akses ke tenaga kesehatan profesional menjadi lebih mudah, terutama untuk keluarga di daerah terpencil. Mengurangi biaya transportasi dan waktu yang terbuang untuk konsultasi rutin.'
      }
    },
    {
      id: 5,
      icon: Award,
      title: 'Gamifikasi & Reward',
      status: 'completed',
      date: 'Engagement',
      energy: 78,
      relatedIds: [4, 6],
      content: 'Sistem poin dan badge untuk meningkatkan engagement',
      description: {
        overview: 'Sistem gamifikasi yang memberikan reward kepada orang tua yang aktif dalam program pemantauan dan pencegahan stunting.',
        benefits: [
          'Poin untuk setiap aktivitas positif (kunjungan posyandu, update data, dll)',
          'Badge achievement untuk milestone tertentu',
          'Leaderboard komunitas untuk motivasi positif',
          'Reward yang dapat ditukar dengan voucher kesehatan atau produk bayi'
        ],
        techDetails: 'Sistem poin berbasis aktivitas dengan algoritma yang mencegah gaming the system. Badge dirancang dengan kriteria yang mendorong perilaku sehat. Integrasi dengan merchant lokal untuk program reward.',
        userImpact: 'Meningkatkan partisipasi aktif orang tua dalam program posyandu hingga 60%. Menciptakan komunitas yang saling mendukung dalam pencegahan stunting.'
      }
    },
    {
      id: 6,
      icon: Shield,
      title: 'Data Security & Privacy',
      status: 'completed',
      date: 'Security',
      energy: 98,
      relatedIds: [1, 3],
      content: 'Keamanan data dan privasi tingkat enterprise',
      description: {
        overview: 'Sistem keamanan berlapis yang melindungi data sensitif kesehatan anak dengan standar internasional.',
        benefits: [
          'Enkripsi end-to-end untuk semua data kesehatan',
          'Compliance dengan regulasi perlindungan data kesehatan',
          'Audit trail lengkap untuk setiap akses data',
          'Backup otomatis dan disaster recovery'
        ],
        techDetails: 'Menggunakan AES-256 encryption untuk data at rest dan TLS 1.3 untuk data in transit. Implementasi OAuth 2.0 untuk autentikasi. Regular security audit dan penetration testing. Data center di Indonesia untuk compliance dengan UU PDP.',
        userImpact: 'Orang tua dapat tenang bahwa data kesehatan anak mereka aman dan hanya dapat diakses oleh pihak yang berwenang. Kader posyandu dapat bekerja dengan sistem yang reliable dan aman.'
      }
    }
  ]

  // Convert features to timeline data format
  const timelineData = features.map(feature => ({
    id: feature.id,
    icon: feature.icon,
    title: feature.title,
    status: feature.status,
    date: feature.date,
    energy: feature.energy,
    relatedIds: feature.relatedIds,
    content: feature.content
  }))

  const currentFeature = features[selectedFeature]

  return (
    <div
      ref={sectionRef}
      className='py-16 lg:py-24 font-montserrat px-6 md:px-[150px] lg:px-[230px] bg-gradient-to-br from-gray-50 to-gray-100'
      id='Fitur'
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

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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

        .animate-fade-in-right {
          animation: fadeInRight 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      <div className="w-full">
        {/* Header */}
        <div className={`mb-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Fitur Unggulan
          </h2>
          <div className="flex items-center gap-2 text-gray-500">
            <Icon icon="mdi:star-circle-outline" className="w-4 h-4" />
            <span className="text-xs md:text-sm font-medium uppercase tracking-wide">
              Teknologi Untuk Generasi Sehat
            </span>
          </div>
        </div>

        {/* Main Content: Timeline + Feature Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 lg:items-start">
          {/* Left: Radial Orbital Timeline */}
          <div className={`${isVisible ? 'animate-fade-in-left' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl overflow-hidden flex items-center justify-center h-[450px] lg:h-[700px]">
                <RadialOrbitalTimeline timelineData={timelineData} />
              </div>
            </div>
          </div>

          {/* Right: Feature Description */}
          <div className={`${isVisible ? 'animate-fade-in-right' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>
            <div className="space-y-5">
              {/* Feature Selector Tabs */}
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <button
                    key={feature.id}
                    onClick={() => setSelectedFeature(index)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${selectedFeature === index
                      ? 'bg-[#00BFEF] text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    {feature.title}
                  </button>
                ))}
              </div>

              {/* Feature Detail Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6 space-y-5" style={{ minHeight: '600px' }}>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00BFEF] to-[#0088c2] flex items-center justify-center text-white">
                      {React.createElement(currentFeature.icon, { size: 24 })}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {currentFeature.title}
                      </h3>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${currentFeature.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                        }`}>
                        {currentFeature.status === 'completed' ? 'Available' : 'Coming Soon'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Overview */}
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Overview</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {currentFeature.description.overview}
                  </p>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Manfaat Utama</h4>
                  <ul className="space-y-2">
                    {currentFeature.description.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Icon
                          icon="mdi:check-circle"
                          className="w-4 h-4 text-[#00BFEF] flex-shrink-0 mt-0.5"
                        />
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technical Details */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Icon icon="mdi:cog-outline" className="w-4 h-4" />
                    Detail Teknis
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {currentFeature.description.techDetails}
                  </p>
                </div>

                {/* User Impact */}
                <div className="border-l-4 border-[#00BFEF] pl-4">
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Dampak untuk Pengguna</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {currentFeature.description.userImpact}
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Fitur
