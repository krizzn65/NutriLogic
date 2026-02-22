"use client";
import React, { useRef, useState, useEffect, memo } from 'react'
import { assets } from '../../assets/assets'
import { TimelineContent } from '../ui/timeline-animation'
import { VerticalCutReveal } from '../ui/vertical-cut-reveal'
import { Heart, Baby, Brain, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { FlowButton } from '../ui/flow-button'

const images = [assets.gmb_1, assets.gmb_2, assets.gmb_3, assets.gmb_4]

const SLIDE_DURATION = 5000

const ImageSlideshow = memo(() => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [prevImageIndex, setPrevImageIndex] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progressKey, setProgressKey] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setPrevImageIndex(currentImageIndex)
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
      setIsAnimating(true)
      setProgressKey((k) => k + 1)
    }, SLIDE_DURATION)
    return () => clearInterval(timer)
  }, [currentImageIndex])

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: "100 / 40",
        clipPath: "url(#clip-inverted)",
      }}
    >
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="clip-inverted" clipPathUnits="objectBoundingBox">
            <path d="M0.0998072 1H0.422076H0.749756C0.767072 1 0.774207 0.961783 0.77561 0.942675V0.807325C0.777053 0.743631 0.791844 0.731953 0.799059 0.734076H0.969813C0.996268 0.730255 1.00088 0.693206 0.999875 0.675159V0.0700637C0.999875 0.0254777 0.985045 0.00477707 0.977629 0H0.902473C0.854975 0 0.890448 0.138535 0.850165 0.138535H0.0204424C0.00408849 0.142357 0 0.180467 0 0.199045V0.410828C0 0.449045 0.0136283 0.46603 0.0204424 0.469745H0.0523086C0.0696245 0.471019 0.0735527 0.497877 0.0733523 0.511146V0.915605C0.0723903 0.983121 0.090588 1 0.0998072 1Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Previous image - slides out to the right */}
      <AnimatePresence>
        {prevImageIndex !== null && isAnimating && (
          <motion.img
            key={`prev-${prevImageIndex}`}
            src={images[prevImageIndex]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ x: "0%" }}
            animate={{ x: "100%" }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onAnimationComplete={() => setIsAnimating(false)}
          />
        )}
      </AnimatePresence>

      {/* Current image - slides in from the left */}
      <motion.img
        key={`current-${currentImageIndex}`}
        src={images[currentImageIndex]}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        initial={prevImageIndex !== null ? { x: "-100%" } : { x: "0%" }}
        animate={{ x: "0%" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* Carousel indicator with progress */}
      <div className="absolute bottom-4 left-[12%] flex items-center gap-2 z-10">
        {images.map((_, index) => (
          <div
            key={index}
            className="relative h-[3px] rounded-full overflow-hidden"
            style={{
              width: currentImageIndex === index ? 32 : 16,
              backgroundColor: "rgba(255,255,255,0.3)",
              transition: "width 0.4s ease-in-out",
            }}
          >
            {currentImageIndex === index && (
              <motion.div
                key={`progress-${progressKey}`}
                className="absolute inset-y-0 left-0 rounded-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: SLIDE_DURATION / 1000,
                  ease: "linear",
                }}
              />
            )}
            {currentImageIndex !== index && index < currentImageIndex && (
              <div className="absolute inset-0 rounded-full bg-white/60" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
})

ImageSlideshow.displayName = 'ImageSlideshow'

const AboutUs = () => {
  const heroRef = useRef(null)

  const revealVariants = {
    visible: (i) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.15,
        duration: 0.35,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  }

  const scaleVariants = {
    visible: (i) => ({
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.15,
        duration: 0.35,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      opacity: 0,
    },
  }

  return (
    <section className="font-montserrat py-20 px-6 bg-[#f9f9f9]" id="About" ref={heroRef}>
      <div className="max-w-[1400px] mx-auto">
        <div className="relative">
          {/* Header with social icons */}
          <div className="flex justify-between items-center mb-8 w-[85%] absolute lg:top-4 md:top-0 sm:-top-2 -top-3 z-10">
            <div className="flex items-center gap-2 text-xl">
              <span className="text-[#00BFEF] animate-spin">✱</span>
              <TimelineContent
                as="span"
                animationNum={0}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-sm font-medium text-gray-600"
              >
                WHO WE ARE
              </TimelineContent>
            </div>
            <div className="flex gap-3">
              <TimelineContent
                as="div"
                animationNum={0}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="md:w-8 md:h-8 sm:w-6 w-5 sm:h-6 h-5 border border-[#00BFEF]/20 bg-[#00BFEF]/10 rounded-lg flex items-center justify-center"
              >
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00BFEF]" />
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={1}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="md:w-8 md:h-8 sm:w-6 w-5 sm:h-6 h-5 border border-[#00BFEF]/20 bg-[#00BFEF]/10 rounded-lg flex items-center justify-center"
              >
                <Baby className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00BFEF]" />
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={2}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="md:w-8 md:h-8 sm:w-6 w-5 sm:h-6 h-5 border border-[#00BFEF]/20 bg-[#00BFEF]/10 rounded-lg flex items-center justify-center"
              >
                <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00BFEF]" />
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={3}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="md:w-8 md:h-8 sm:w-6 w-5 sm:h-6 h-5 border border-[#00BFEF]/20 bg-[#00BFEF]/10 rounded-lg flex items-center justify-center"
              >
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00BFEF]" />
              </TimelineContent>
            </div>
          </div>

          <TimelineContent
            as="figure"
            animationNum={4}
            timelineRef={heroRef}
            customVariants={scaleVariants}
            className="relative group"
          >
            <ImageSlideshow />
          </TimelineContent>

          {/* Stats */}
          <div className="flex flex-wrap lg:justify-start justify-between items-center py-3 text-sm">
            <TimelineContent
              as="div"
              animationNum={5}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="flex gap-4 items-center"
            >
              <div className="flex items-center gap-2 mb-2 sm:text-base text-xs">
                <span className="text-[#00BFEF] font-bold">20+</span>
                <span className="text-gray-600">mitra posyandu</span>
                <span className="text-gray-300">|</span>
              </div>
              <div className="flex items-center gap-2 mb-2 sm:text-base text-xs">
                <span className="text-[#00BFEF] font-bold">1000+</span>
                <span className="text-gray-600">balita terpantau</span>
              </div>
              {/* Mobile only: inline small stats */}
              <div className="flex lg:hidden items-center gap-2 mb-2 text-xs">
                <span className="text-gray-300">|</span>
                <span className="text-[#00BFEF] font-bold">24/7</span>
                <span className="text-gray-600">layanan</span>
                <span className="text-gray-300">|</span>
                <span className="text-[#00BFEF] font-bold">100%</span>
                <span className="text-gray-600">digital</span>
              </div>
            </TimelineContent>
            {/* Desktop only: large positioned stats */}
            <div className="hidden lg:flex lg:absolute right-0 bottom-24 lg:flex-col lg:items-start lg:gap-1">
              <TimelineContent
                as="div"
                animationNum={6}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="flex lg:text-5xl items-center gap-3 mb-1"
              >
                <span className="text-[#00BFEF] font-semibold">100%</span>
                <span className="text-gray-600 uppercase">digital</span>
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={7}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="flex items-center gap-2 mb-1 lg:text-2xl"
              >
                <span className="text-[#00BFEF] font-bold">24/7</span>
                <span className="text-gray-600">akses layanan</span>
              </TimelineContent>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-8">
          <div className="md:col-span-2">
            <h1 className="sm:text-4xl md:text-5xl text-xl !leading-[110%] font-semibold text-gray-900 mb-4 md:mb-8">
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.1}
                staggerFrom="first"
                reverse={true}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 30,
                  delay: 1,
                }}
              >
                Optimalkan Tumbuh Kembang Balita Dengan Monitoring Terintegrasi AI.
              </VerticalCutReveal>
            </h1>

            <TimelineContent
              as="div"
              animationNum={9}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="grid md:grid-cols-2 gap-4 md:gap-8 text-gray-600"
            >
              <TimelineContent
                as="div"
                animationNum={10}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="sm:text-base text-sm"
              >
                <p className="leading-relaxed text-justify">
                  NutriLogic mengintegrasikan Kecerdasan Buatan (AI) canggih
                  untuk memberikan pemantauan status gizi balita yang akurat
                  dan real-time. Algoritma cerdas kami menganalisis pola
                  pertumbuhan untuk mendeteksi tanda awal stunting.
                </p>
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={11}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="sm:text-base text-sm"
              >
                <p className="leading-relaxed text-justify">
                  Setiap anak berhak tumbuh sehat. NutriLogic hadir untuk
                  membantu orang tua dan kader posyandu memantau perkembangan
                  gizi balita secara digital, memberikan rekomendasi nutrisi
                  yang tepat berdasarkan data.
                </p>
              </TimelineContent>
            </TimelineContent>
          </div>

          <div className="md:col-span-1">
            <div className="text-center md:text-right mt-2 md:mt-0">
              <TimelineContent
                as="div"
                animationNum={12}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-[#00BFEF] text-xl md:text-2xl font-bold mb-1 md:mb-2"
              >
                NUTRILOGIC
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={13}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-gray-600 text-xs md:text-sm mb-4 md:mb-8"
              >
                Monitoring Gizi | Deteksi Stunting
              </TimelineContent>

              <TimelineContent
                as="div"
                animationNum={14}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="mb-4 md:mb-6"
              >
                <p className="text-gray-900 font-medium text-sm md:text-base mb-3 md:mb-4">
                  Siap memantau tumbuh kembang balita Anda secara optimal?
                </p>
              </TimelineContent>

              <TimelineContent
                as="div"
                animationNum={15}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="flex justify-center md:justify-end"
              >
                <FlowButton
                  text="PELAJARI LEBIH LANJUT"
                  onClick={() => {
                    const element = document.querySelector('#Fitur')
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                />
              </TimelineContent>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutUs

