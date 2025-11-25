"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();

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
                404
              </h1>
            </div>

            <div className="mt-[-50px]">
              <h3 className="text-2xl text-black sm:text-3xl font-bold mb-4 font-poppins">
                Hmmmm Sepertinya kamu tersesat
              </h3>
              <p className="mb-6 text-black sm:mb-5 font-poppins">
                Halaman yang kamu cari tidak tersedia!
              </p>

              <Button
                variant="default"
                onClick={() => navigate("/")}
                className="my-5">
                Kembali ke Beranda
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
