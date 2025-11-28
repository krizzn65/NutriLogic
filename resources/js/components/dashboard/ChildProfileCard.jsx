import React from 'react';
import { formatAge } from "../../lib/utils";
import { Ruler, Weight, CreditCard } from 'lucide-react';
import { assets } from '../../assets/assets';

export default function ChildProfileCard({ child, onClick, onShowCard }) {
    if (!child) return null;

    return (
        <div
            onClick={onClick}
            className="group bg-white hover:bg-blue-600 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:scale-[1.02] hover:border-blue-600 transition-all duration-300 ease-out cursor-pointer relative overflow-hidden border border-gray-100"
        >
            <div className="relative z-10 flex flex-col h-full">
                {/* Header: Avatar & Status */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-full bg-blue-50 group-hover:bg-white/20 p-1 shadow-inner transition-colors">
                            <img
                                src={child.gender === 'L' ? assets.kepala_bayi : child.gender === 'P' ? assets.kepala_bayi_cewe : `https://api.dicebear.com/9.x/adventurer/svg?seed=${child.full_name}&backgroundColor=b6e3f4`}
                                alt={child.full_name}
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 group-hover:text-white transition-colors line-clamp-1">
                                {child.full_name}
                            </h3>
                            <p className="text-sm text-gray-500 group-hover:text-blue-100 font-medium mt-1 transition-colors">
                                {formatAge(child.age_in_months)} • {child.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="px-3 py-1 bg-green-50 text-green-600 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/20 text-xs font-bold rounded-full flex items-center gap-1.5 border border-green-100 transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 group-hover:bg-white animate-pulse" />
                            Sehat
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onShowCard && onShowCard(child);
                            }}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 group-hover:bg-white group-hover:text-blue-600 group-hover:border-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm"
                        >
                            <CreditCard className="w-3.5 h-3.5" />
                            Kartu Anak
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div className="bg-gray-50/80 group-hover:bg-white/10 rounded-2xl p-4 flex flex-col items-start gap-1 transition-colors">
                        <div className="flex items-center gap-2 text-gray-400 group-hover:text-blue-200 mb-1 transition-colors">
                            <Weight className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Berat</span>
                        </div>
                        <span className="text-lg font-bold text-gray-800 group-hover:text-white transition-colors">
                            {child.weight ? `${child.weight} kg` : '-'}
                        </span>
                    </div>
                    <div className="bg-gray-50/80 group-hover:bg-white/10 rounded-2xl p-4 flex flex-col items-start gap-1 transition-colors">
                        <div className="flex items-center gap-2 text-gray-400 group-hover:text-blue-200 mb-1 transition-colors">
                            <Ruler className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Tinggi</span>
                        </div>
                        <span className="text-lg font-bold text-gray-800 group-hover:text-white transition-colors">
                            {child.height ? `${child.height} cm` : '-'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
