import React from 'react'
import { AdvancedMap } from '../interactive-map'
import { ActivityChartCard } from '../activity-chart-card'
import { RoadmapCard } from '../roadmap-card'
import { cn } from "@/lib/utils"
import { Icon } from '@iconify/react'

const Problem = () => {
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

  const stuntingData = [
    {
      title: 'Stunting Indonesia',
      value: '19.8%',
      description: 'Prevalensi stunting nasional masih di atas standar WHO (20%)',
      chartData: [
        { day: '2020', value: 26.9 },
        { day: '2021', value: 24.4 },
        { day: '2022', value: 21.6 },
        { day: '2023', value: 21.5 },
        { day: '2024', value: 19.8 }
      ]
    },
    {
      title: 'Stunting Jawa Timur',
      value: '19.2%',
      description: 'Berada sedikit di bawah rata-rata nasional',
      chartData: [
        { day: '2020', value: 25.6 },
        { day: '2021', value: 23.5 },
        { day: '2022', value: 19.2 },
        { day: '2023', value: 17.7 },
        { day: '2024', value: 14.7 }
      ]
    },
    {
      title: 'Stunting Rambipuji',
      value: '765',
      description: 'Total kasus stunting di Kecamatan Rambipuji',
      chartData: [
        { day: '2020', value: 678 },
        { day: '2021', value: 610 },
        { day: '2022', value: 549 },
        { day: '2023', value: 699 },
        { day: '2024', value: 720 }
      ]
    }
  ]

  // Area polygon Kecamatan Rambipuji (koordinat aktual dari GeoJSON) dengan warna merah
  const rambipujiPolygon = [{
    id: 'rambipuji-area',
    positions: [
      [-8.1986, 113.6286],
      [-8.1986, 113.6210],
      [-8.1924, 113.6186],
      [-8.1910, 113.6110],
      [-8.1870, 113.6086],
      [-8.1840, 113.6014],
      [-8.1820, 113.6006],
      [-8.1828, 113.5910],
      [-8.1800, 113.5894],
      [-8.1796, 113.5842],
      [-8.1818, 113.5850],
      [-8.1818, 113.5866],
      [-8.1840, 113.5882],
      [-8.1846, 113.5874],
      [-8.1868, 113.5894],
      [-8.1936, 113.5862],
      [-8.1954, 113.5878],
      [-8.1986, 113.5862],
      [-8.2018, 113.5814],
      [-8.2090, 113.5798],
      [-8.2096, 113.5774],
      [-8.2120, 113.5790],
      [-8.2182, 113.5782],
      [-8.2244, 113.5734],
      [-8.2234, 113.5702],
      [-8.2274, 113.5662],
      [-8.2306, 113.5654],
      [-8.2346, 113.5670],
      [-8.2356, 113.5654],
      [-8.2356, 113.5590],
      [-8.2374, 113.5582],
      [-8.2370, 113.5558],
      [-8.2394, 113.5534],
      [-8.2394, 113.5518],
      [-8.2400, 113.5526],
      [-8.2394, 113.5518],
      [-8.2418, 113.5502],
      [-8.2454, 113.5534],
      [-8.2454, 113.5550],
      [-8.2486, 113.5542],
      [-8.2542, 113.5574],
      [-8.2538, 113.5582],
      [-8.2550, 113.5606],
      [-8.2538, 113.5630],
      [-8.2550, 113.5638],
      [-8.2522, 113.5670],
      [-8.2538, 113.5670],
      [-8.2558, 113.5646],
      [-8.2578, 113.5606],
      [-8.2590, 113.5606],
      [-8.2658, 113.5558],
      [-8.2674, 113.5518],
      [-8.2734, 113.5494],
      [-8.2758, 113.5510],
      [-8.2758, 113.5526],
      [-8.2764, 113.5518],
      [-8.2764, 113.5542],
      [-8.2806, 113.5622],
      [-8.2926, 113.5726],
      [-8.2922, 113.5734],
      [-8.2954, 113.5798],
      [-8.2946, 113.5966],
      [-8.2866, 113.5990],
      [-8.2866, 113.6014],
      [-8.2734, 113.6046],
      [-8.2722, 113.6070],
      [-8.2722, 113.6110],
      [-8.2594, 113.6126],
      [-8.2586, 113.5910],
      [-8.2510, 113.5910],
      [-8.2518, 113.5966],
      [-8.2434, 113.6222],
      [-8.2262, 113.6222],
      [-8.2262, 113.6270],
      [-8.2246, 113.6262],
      [-8.2242, 113.6238],
      [-8.2190, 113.6246],
      [-8.2178, 113.6278],
      [-8.2190, 113.6318],
      [-8.2178, 113.6366],
      [-8.2134, 113.6382],
      [-8.2098, 113.6374],
      [-8.2086, 113.6358],
      [-8.2050, 113.6366],
      [-8.2050, 113.6350],
      [-8.2014, 113.6334],
      [-8.2010, 113.6342],
      [-8.1998, 113.6326],
      [-8.1946, 113.6358],
      [-8.1986, 113.6286]
    ],
    style: { color: '#dc2626', fillColor: '#ef4444', weight: 3, fillOpacity: 0.4 },
    popup: '<div style="padding: 12px; min-width: 320px; font-family: system-ui, -apple-system, sans-serif;"><h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: bold; color: #1f2937; border-bottom: 3px solid #ef4444; padding-bottom: 10px;">KECAMATAN RAMBIPUJI</h3><div style="margin-bottom: 16px; line-height: 1.8;"><p style="margin: 0 0 6px 0; font-size: 15px; color: #1f2937;"><strong>Stunting :</strong> <span style="color: #dc2626; font-weight: bold;">765 Jiwa</span></p><p style="margin: 0 0 6px 0; font-size: 15px; color: #1f2937;"><strong>Resiko Stunting :</strong> <span style="color: #ea580c; font-weight: bold;">710 Jiwa</span></p><p style="margin: 0 0 6px 0; font-size: 15px; color: #1f2937;"><strong>Rumah Tidak Layak Huni :</strong> <span style="color: #7c3aed; font-weight: bold;">0 Rumah</span></p></div><div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px; margin-bottom: 16px; border-radius: 4px;"><p style="margin: 0 0 8px 0; font-size: 16px; color: #991b1b; font-weight: bold;">Miskin Extreme :</p><p style="margin: 0 0 4px 0; font-size: 14px; color: #7c2d12;"><strong>Desil 1 :</strong> 1.854 Jiwa</p><p style="margin: 0; font-size: 14px; color: #7c2d12;"><strong>Desil 2 :</strong> 2.637 Jiwa</p></div><div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; margin-bottom: 16px; border-radius: 4px;"><p style="margin: 0 0 4px 0; font-size: 14px; color: #1e40af;"><strong>Bantuan Stunting :</strong> 40 Jiwa</p><p style="margin: 0; font-size: 14px; color: #1e40af;"><strong>Pembangunan Jamban :</strong> 120 Jamban</p></div><div style="margin-top: 12px; padding: 8px; background: #fef9c3; border-radius: 4px; border: 1px solid #facc15;"><p style="margin: 0; font-size: 12px; color: #854d0e;">💡 <strong>Catatan:</strong> Data Kecamatan Rambipuji tahun 2024</p></div></div>'
  }]

  const stuntingStats = [
    {
      label: 'Prevalensi Stunting Nasional',
      value: '21.6%',
      year: '2023',
      description: 'Angka stunting di Indonesia masih di atas standar WHO (20%)'
    },
    {
      label: 'Prevalensi Stunting Jawa Timur',
      value: '19.2%',
      year: '2023',
      description: 'Jawa Timur berada sedikit di bawah rata-rata nasional'
    },
    {
      label: 'Prevalensi Stunting Kab. Jember',
      value: '22.8%',
      year: '2023',
      description: 'Kabupaten Jember masih menghadapi tantangan stunting yang tinggi'
    },
    {
      label: 'Kasus Stunting Kec. Rambipuji',
      value: '211',
      year: '2024',
      description: 'Total kasus stunting di 5 desa utama Kecamatan Rambipuji'
    }
  ]

  return (
    <div ref={sectionRef} className='py-24 lg:py-32 font-montserrat px-6 md:px-[150px] lg:px-[230px]' style={{ backgroundColor: '#F3F4F6' }} id='Problem'>
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
      <div className="w-full">
        {/* Header */}
        <div className={`mb-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
            Data Stunting
          </h2>
          <div className="flex items-center gap-2 text-gray-500">
            <Icon icon="mdi:layers-outline" className="w-5 h-5" />
            <span className="text-sm md:text-base font-medium uppercase tracking-wide">Ringkasan Wilayah</span>
          </div>
        </div>

        {/* Chart Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6 mb-8">
          {stuntingData.map((stat, index) => (
            <div
              key={index}
              className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: `${200 + index * 100}ms` }}
            >
              <ActivityChartCard
                title={stat.title}
                totalValue={stat.value}
                data={stat.chartData}
                className="bg-white h-full w-full"
                description={stat.description}
              />
            </div>
          ))}
        </div>

        {/* Info Text with Icon */}
        <div className={`mb-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '600ms' }}>
          <div className="flex items-start gap-3 text-gray-600">
            <Icon icon="mdi:information-outline" className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm md:text-base leading-relaxed">
              Peta Interaktif Menampilkan Wilayah Kecamatan Rambipuji, Kabupaten Jember Dengan Data Stunting Terkini.
            </p>
          </div>
        </div>

        {/* Map and CTA Section */}
        <div className={`flex flex-col lg:flex-row gap-6 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '700ms' }}>
          {/* Map - 60% */}
          <div
            className="w-full lg:w-[60%] h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl shadow-lg bg-gray-100 relative"
            onWheel={(e) => e.stopPropagation()}
          >
            <style>{`
              .leaflet-container {
                cursor: default !important;
              }
              .leaflet-grab {
                cursor: default !important;
              }
              .leaflet-dragging .leaflet-grab {
                cursor: default !important;
              }
              /* Popup tetap bisa diklik */
              .leaflet-popup {
                z-index: 1001 !important;
              }
            `}</style>
            <AdvancedMap
              center={[-8.1986, 113.6286]}
              zoom={11}
              markers={[]}
              polygons={rambipujiPolygon}
              enableClustering={false}
              enableSearch={false}
              enableControls={false}
              scrollWheelZoom={false}
              dragging={false}
              doubleClickZoom={false}
              touchZoom={false}
              zoomControl={false}
              boxZoom={false}
              keyboard={false}
              tap={false}
              trackResize={false}
              onMapClick={() => { }}
              style={{ height: '100%', width: '100%' }}
            />
          </div>

          {/* CTA Box - 40% - Split into 2 cards */}
          <div className="w-full lg:w-[40%] h-[400px] md:h-[500px] lg:h-[600px] flex flex-col gap-4">
            {/* Card 1: Data Sebagai Bukti */}
            <div className="flex-1 bg-gradient-to-br from-[#00BFEF] to-[#0088c2] rounded-2xl shadow-lg p-6 md:p-8 flex flex-col justify-center">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight mb-4">
                Data Sebagai Bukti<br />
                Urgensi Penanganan Stunting
              </h3>
              <p className="text-sm md:text-base lg:text-lg text-white/90 leading-relaxed">
                Data stunting yang tersaji menjadi bukti nyata bahwa masalah ini memerlukan penanganan serius dan terstruktur. Dengan 765 kasus stunting di Kecamatan Rambipuji, diperlukan solusi digital yang tepat untuk monitoring, analisis mendalam, dan intervensi cepat.
              </p>
            </div>

            {/* Card 2: Target Penurunan Stunting dengan Roadmap */}
            <div className="flex-1 bg-gradient-to-br from-[#0088c2] to-[#006aa6] rounded-2xl shadow-lg p-6 md:p-8 flex flex-col">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight mb-4">
                Target Penurunan Stunting
              </h3>
              <p className="text-sm md:text-base text-white/90 leading-relaxed mb-4">
                Roadmap penurunan prevalensi stunting dengan dukungan NutriLogic
              </p>
              <div className="flex-1 flex items-center">
                <RoadmapCard
                  title=""
                  description=""
                  items={[
                    {
                      quarter: "2023",
                      title: "21.5%",
                      description: "Selesai",
                      status: "done"
                    },
                    {
                      quarter: "2024",
                      title: "19.8%",
                      description: "Selesai",
                      status: "done"
                    },
                    {
                      quarter: "2025",
                      title: "16%",
                      description: "Progress",
                      status: "in-progress"
                    },
                    {
                      quarter: "2026",
                      title: "14%",
                      description: "Goal",
                      status: "upcoming"
                    }
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Problem
