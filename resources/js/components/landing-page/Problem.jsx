import React from 'react'
import { AdvancedMap } from '../interactive-map'
import { ActivityChartCard } from '../activity-chart-card'
import { cn } from "@/lib/utils"

const Problem = () => {

  const stuntingData = [
    {
      title: 'Stunting Indonesia',
      value: '21.6%',
      description: 'Prevalensi stunting nasional masih di atas standar WHO (20%)',
      chartData: [
        { day: '2019', value: 27.7 },
        { day: '2020', value: 26.9 },
        { day: '2021', value: 24.4 },
        { day: '2022', value: 21.6 },
        { day: '2023', value: 21.5 }
      ]
    },
    {
      title: 'Stunting Jawa Timur',
      value: '19.2%',
      description: 'Berada sedikit di bawah rata-rata nasional',
      chartData: [
        { day: '2019', value: 23.0 },
        { day: '2020', value: 21.9 },
        { day: '2021', value: 20.1 },
        { day: '2022', value: 19.2 },
        { day: '2023', value: 18.9 }
      ]
    },
    {
      title: 'Stunting Rambipuji',
      value: '765',
      description: 'Total kasus stunting di Kecamatan Rambipuji',
      chartData: [
        { day: 'Jan', value: 820 },
        { day: 'Mar', value: 795 },
        { day: 'Jun', value: 780 },
        { day: 'Sep', value: 765 },
        { day: 'Des', value: 750 }
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
    <div className='py-8 pt-24' id='Problem'>
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black text-center mb-8">
          Data Stunting
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-6 mb-12 justify-center items-stretch">
          {stuntingData.map((stat, index) => (
            <div key={index} className="flex-1 max-w-md">
              <ActivityChartCard
                title={stat.title}
                totalValue={stat.value + (stat.suffix || '')}
                data={stat.chartData}
                className="bg-white h-full"
                description={stat.description}
              />
            </div>
          ))}
        </div>

        <div className="mb-6">
          <p className="text-sm md:text-base lg:text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed text-center">
            Peta interaktif menampilkan wilayah Kecamatan Rambipuji, Kabupaten Jember dengan data stunting terkini. 
            Klik pada area merah untuk melihat informasi detail tentang kondisi stunting di wilayah ini.
          </p>
        </div>
        
        <div className='w-full h-[600px] overflow-hidden rounded-2xl shadow-2xl bg-gray-100'>
          <AdvancedMap
            center={[-8.1986, 113.6286]}
            zoom={12}
            markers={[]}
            polygons={rambipujiPolygon}
            enableClustering={false}
            enableSearch={false}
            enableControls={true}
            onMapClick={() => {}}
            style={{ height: '100%', width: '100%' }}
          />
        </div>
      </div>
    </div>
  )
}

export default Problem
