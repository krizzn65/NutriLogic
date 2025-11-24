import React from "react";

export default function DashboardKaderContent() {
  return (
    <div className="flex flex-1 w-full h-full overflow-auto font-montserrat">
      <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Kader
          </h1>
          <p className="text-gray-600 mt-2">
            Selamat datang Kader! Pantau perkembangan anak-anak di wilayah Anda.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Total Anak", value: "124", change: "+8", color: "bg-blue-500" },
            { title: "Stunting", value: "12", change: "-2", color: "bg-red-500" },
            { title: "Gizi Baik", value: "98", change: "+5", color: "bg-green-500" },
            { title: "Perlu Perhatian", value: "14", change: "+1", color: "bg-yellow-500" }
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <div className={`w-12 h-12 ${stat.color} rounded-lg mb-4 flex items-center justify-center`}>
                <span className="text-white text-xl font-bold">{i + 1}</span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-2">{stat.change} dari bulan lalu</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 mt-4">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistik Stunting</h2>
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h2>
            <div className="space-y-3">
              {[
                { name: "Ahmad Fauzi", action: "Data baru ditambahkan", time: "5 menit lalu" },
                { name: "Siti Aminah", action: "Pemeriksaan rutin", time: "15 menit lalu" },
                { name: "Budi Santoso", action: "Update status gizi", time: "1 jam lalu" },
                { name: "Rina Putri", action: "Imunisasi lengkap", time: "2 jam lalu" },
                { name: "Dodi Wijaya", action: "Konsultasi gizi", time: "3 jam lalu" }
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">{activity.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{activity.name}</div>
                    <div className="text-sm text-gray-500">{activity.action}</div>
                  </div>
                  <div className="text-xs text-gray-400">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
