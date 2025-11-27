"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import SlideButton from "../slide-button";

export function ServerErrorPage() {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <section
            className="bg-white font-poppins min-h-screen flex items-center justify-center">
            <div className="container mx-auto">
                <div className="flex justify-center">
                    <div className="w-full sm:w-10/12 md:w-8/12 text-center">
                        <div
                            className="bg-[url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)] h-[250px] sm:h-[350px] md:h-[400px] bg-center bg-no-repeat bg-contain"
                            aria-hidden="true">
                            <h1
                                className="text-center text-black text-6xl sm:text-7xl md:text-8xl pt-6 sm:pt-8 font-poppins font-bold">
                                500
                            </h1>
                        </div>

                        <div className="mt-[-50px]">
                            <h3 className="text-2xl text-black sm:text-3xl font-bold mb-4 font-poppins">
                                Internal Server Error
                            </h3>
                            <p className="mb-6 text-black sm:mb-5 font-poppins">
                                Kami sedang bekerja untuk memperbaiki masalah ini. Silakan coba lagi nanti.
                            </p>

                            <div className="flex justify-center">
                                <SlideButton
                                    onComplete={handleRefresh}
                                    className="my-5"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
