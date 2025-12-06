import React from 'react';
import { motion } from 'framer-motion';
import { formatAge } from "../../lib/utils";
import { Ruler, Weight, CreditCard, Zap, Circle } from 'lucide-react';
import { assets } from '../../assets/assets';

export default function ChildProfileCard({ child, onClick, onShowCard }) {
    if (!child) return null;

    // Get latest weighing data
    const latestWeighing = child.weighing_logs?.[0];
    const currentWeight = latestWeighing?.weight_kg;
    const currentHeight = latestWeighing?.height_cm;
    const currentMuac = latestWeighing?.muac_cm;
    const currentHeadCircumference = latestWeighing?.head_circumference_cm;

    const handleCardClick = (e) => {
        e.stopPropagation();
        onShowCard?.(child);
    };

    return (
        <div
            onClick={onClick}
            className="group bg-white hover:bg-blue-600 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:scale-[1.02] hover:border-blue-600 transition-all duration-300 ease-out cursor-pointer relative overflow-hidden border border-gray-100 h-full"
        >
            <div className="relative z-10 flex flex-col h-full">
                {/* Header: Avatar & Status */}
                <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-center w-full">
                        <div className="flex gap-3 items-center">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-50 group-hover:bg-white/20 p-0.5 shadow-inner transition-colors">
                                <img
                                    src={child.gender === 'L' ? assets.kepala_bayi : child.gender === 'P' ? assets.kepala_bayi_cewe : `https://api.dicebear.com/9.x/adventurer/svg?seed=${child.full_name}&backgroundColor=b6e3f4`}
                                    alt={child.full_name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="text-base md:text-xl font-bold text-gray-800 group-hover:text-white transition-colors line-clamp-1">
                                    {child.full_name}
                                </h3>
                                <p className="text-[10px] md:text-sm text-gray-500 group-hover:text-blue-100 font-medium mt-0.5 md:mt-1 transition-colors">
                                    {formatAge(child.age_in_months)} • {child.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 md:gap-2">
                            <span className="px-2 py-0.5 md:px-3 md:py-1 bg-green-50 text-green-600 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/20 text-[10px] md:text-xs font-bold rounded-full flex items-center gap-1 md:gap-1.5 border border-green-100 transition-colors">
                                <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-green-500 group-hover:bg-white animate-pulse" />
                                Sehat
                            </span>
                            {/* Card Preview Button */}
                            {onShowCard && (
                                <button
                                    onClick={handleCardClick}
                                    className="p-1.5 md:p-2 bg-blue-50 text-blue-600 group-hover:bg-white/20 group-hover:text-white rounded-lg hover:bg-blue-100 transition-colors"
                                    title="Lihat Kartu Anak"
                                >
                                    <CreditCard className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid - 2x2 Layout */}
                <div className="pt-3 md:pt-4">
                    <div className="bg-gray-50 rounded-2xl p-2 md:p-3 border border-gray-100">
                        <div className="grid grid-cols-2 gap-2">
                            {/* Berat */}
                            <div className="flex flex-col items-center gap-0.5 md:gap-1 p-1.5 md:p-2">
                                <div className="flex items-center gap-1 text-gray-400 mb-0.5">
                                    <Weight className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                    <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider">Berat</span>
                                </div>
                                <span className="text-sm md:text-base font-bold text-gray-800">
                                    {currentWeight ? `${currentWeight}` : '-'} <span className="text-[10px] md:text-xs font-medium text-gray-500">kg</span>
                                </span>
                            </div>

                            {/* Tinggi */}
                            <div className="flex flex-col items-center gap-0.5 md:gap-1 p-1.5 md:p-2">
                                <div className="flex items-center gap-1 text-gray-400 mb-0.5">
                                    <Ruler className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                    <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider">Tinggi</span>
                                </div>
                                <span className="text-sm md:text-base font-bold text-gray-800">
                                    {currentHeight ? `${currentHeight}` : '-'} <span className="text-[10px] md:text-xs font-medium text-gray-500">cm</span>
                                </span>
                            </div>

                            {/* Lila */}
                            <div className="flex flex-col items-center gap-0.5 md:gap-1 p-1.5 md:p-2">
                                <div className="flex items-center gap-1 text-gray-400 mb-0.5">
                                    <Zap className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                    <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider">Lila</span>
                                </div>
                                <span className="text-sm md:text-base font-bold text-gray-800">
                                    {currentMuac ? `${currentMuac}` : '-'} <span className="text-[10px] md:text-xs font-medium text-gray-500">cm</span>
                                </span>
                            </div>

                            {/* Lingkar Kepala */}
                            <div className="flex flex-col items-center gap-0.5 md:gap-1 p-1.5 md:p-2">
                                <div className="flex items-center gap-1 text-gray-400 mb-0.5">
                                    <Circle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                    <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider">L. Kepala</span>
                                </div>
                                <span className="text-sm md:text-base font-bold text-gray-800">
                                    {currentHeadCircumference ? `${currentHeadCircumference}` : '-'} <span className="text-[10px] md:text-xs font-medium text-gray-500">cm</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
