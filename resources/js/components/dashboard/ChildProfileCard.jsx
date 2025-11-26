import React from 'react';
import { getStatusColor, formatAge } from "../../lib/utils";
import { assets } from '../../assets/assets';

export default function ChildProfileCard({ child }) {
    if (!child) return null;

    const status = child.latest_nutritional_status;
    const isAtRisk = status.is_at_risk;

    return (
        <div className="relative overflow-hidden bg-[#4481EB] rounded-xl md:rounded-[30px] p-3 md:p-6 text-white shadow-lg shadow-blue-200 h-full flex flex-col justify-between">
            {/* Background Circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2 md:mb-4">
                    <div>
                        <p className="text-blue-100 text-[10px] md:text-sm font-medium mb-0.5 md:mb-1">Status Anak</p>
                        <h3 className="text-lg md:text-2xl font-bold">{child.full_name}</h3>
                    </div>
                    <div className="flex-shrink-0">
                        <img
                            src={assets.kepala_bayi}
                            alt="Ibu dan Anak"
                            className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-lg"
                        />
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center space-y-3 md:space-y-5">
                    <div className="flex justify-between items-center text-xs md:text-base border-b border-white/10 pb-2 md:pb-3 last:border-0 last:pb-0">
                        <span className="text-blue-100">Usia</span>
                        <span className="font-semibold">{formatAge(child.age_in_months)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs md:text-base border-b border-white/10 pb-2 md:pb-3 last:border-0 last:pb-0">
                        <span className="text-blue-100">Gender</span>
                        <span className="font-semibold">{child.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs md:text-base">
                        <span className="text-blue-100">Status Gizi</span>
                        <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold ${isAtRisk ? 'bg-red-400/20 text-red-100 border border-red-200/20' : 'bg-green-400/20 text-green-100 border border-green-200/20'
                            }`}>
                            {status.status === 'tidak_diketahui' ? 'Belum Ada Data' : status.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 md:gap-3 mt-2 md:mt-4">
                    <button className="flex-1 bg-white text-blue-600 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm hover:bg-blue-50 transition-colors shadow-sm">
                        Detail
                    </button>
                    <button className="flex-1 bg-white/20 backdrop-blur-md text-white py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm hover:bg-white/30 transition-colors border border-white/20">
                        Riwayat
                    </button>
                </div>
            </div>
        </div>
    );
}
