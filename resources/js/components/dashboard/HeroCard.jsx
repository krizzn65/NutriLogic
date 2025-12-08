import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';

export default function HeroCard({ userName }) {
    const navigate = useNavigate();
    return (
        <div className="relative w-full rounded-[20px] md:rounded-[24px] overflow-visible bg-gradient-to-r from-[#4481EB] to-[#04BEFE] shadow-lg shadow-blue-200/50 text-white">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <div className="absolute bottom-0 left-16 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

            <div className="relative flex flex-row items-end justify-between gap-3 pl-4 pr-4 pt-4 pb-0 md:p-5 md:pb-0">
                <div className="flex-1 pb-10 md:pb-5">
                    <h2 className="text-xl md:text-2xl font-bold mb-2 leading-tight">
                        Selamat Datang, <br /> {userName}!
                    </h2>
                    <p className="text-blue-50 text-sm md:text-base mb-4 max-w-xs">
                        Pantau tumbuh kembang buah hati Anda dengan mudah dan akurat bersama NutriLogic.
                    </p>

                    <button
                        onClick={() => navigate('/dashboard/anak')}
                        className="bg-white text-[#4481EB] px-5 py-2 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                        Lihat Detail
                    </button>
                </div>

                {/* Illustration */}
                <div className="flex items-end justify-end w-32 md:w-40 md:h-20 shrink-0 relative md:z-10">
                    <img
                        src={assets.ibu_anak}
                        alt="Ibu dan Anak"
                        className="w-full h-auto object-contain object-bottom drop-shadow-2xl"
                    />
                </div>
            </div>
        </div>
    );
}
