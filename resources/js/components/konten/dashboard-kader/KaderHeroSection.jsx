import React from "react";

export default function KaderHeroSection() {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-white/15 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold border border-white/30 tracking-wide uppercase">
                            Selamat Datang
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
                        Halo, Kader Posyandu!
                    </h2>
                    <p className="text-blue-100 text-lg leading-relaxed opacity-90 max-w-2xl">
                        Siap memantau tumbuh kembang anak hari ini? Cek
                        ringkasan di bawah untuk melihat area yang perlu
                        perhatian segera.
                    </p>
                </div>
                <div className="hidden md:block text-right opacity-80">
                    <p className="text-sm font-medium uppercase tracking-wider mb-1">
                        Hari ini
                    </p>
                    <p className="text-2xl font-bold">
                        {new Date().toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                    </p>
                </div>
            </div>
        </div>
    );
}
