import * as React from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { Eye, EyeOff, Wifi } from "lucide-react"
import { cn } from "@/lib/utils"

const PERSPECTIVE = 1000
const CARD_ANIMATION_DURATION = 0.6
const INITIAL_DELAY = 0.2

export default function CreditCard({
  cardNumber = "4532 1234 5678 9010",
  cardHolder = "ANKIT VERMA",
  expiryDate = "12/28",
  cvv = "123",
  variant = "gradient",
  className,
  labelName = "CARD HOLDER",
  labelExpiry = "EXPIRES",
  brandText = "VISA",
  brandLogo,
  chipImage
}) {
  const [isFlipped, setIsFlipped] = React.useState(false)
  const [isClicked, setIsClicked] = React.useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [10, -10])
  const rotateY = useTransform(x, [-100, 100], [-10, 10])

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(event.clientX - centerX)
    y.set(event.clientY - centerY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const variantStyles = {
    gradient: "bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-500",
    dark: "bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900",
    glass: "bg-white/15 dark:bg-white/10 backdrop-blur-xl border border-white/20",
  }

  return (
    <div
      className={cn("flex items-center justify-center relative w-full h-full", className)}>
      <div className="relative">
        <motion.div
          className="relative w-[500px] h-[315px]"
          style={{ perspective: PERSPECTIVE }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: CARD_ANIMATION_DURATION }}>
          <motion.div
            className="relative w-full h-full cursor-pointer"
            style={{
              transformStyle: "preserve-3d",
              rotateX,
              rotateY: isFlipped ? 180 : rotateY,
            }}
            animate={{
              scale: isClicked ? 0.95 : 1,
            }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => {
              setIsClicked(true)
              setTimeout(() => setIsClicked(false), 200)
              setTimeout(() => setIsFlipped(!isFlipped), 100)
            }}>
            {/* Front of card */}
            <motion.div
              className={cn(
                "absolute inset-0 rounded-2xl p-8 shadow-2xl",
                variantStyles[variant],
                "backface-hidden"
              )}
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden"
              }}>
              {/* Card shimmer effect */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "linear",
                  }} />
              </div>

              {/* Card content */}
              <div className="relative h-full flex flex-col justify-between text-white">
                {/* Top section */}
                <div className="flex justify-between items-start">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: INITIAL_DELAY }}
                    className="flex items-center gap-4">
                    {chipImage ? (
                      <img src={chipImage} alt="Chip" className="w-20 h-20 rounded-full object-cover shadow-sm" />
                    ) : (
                      <div className="w-12 h-9 rounded bg-gradient-to-br from-amber-600 to-yellow-700 shadow-inner" />
                    )}
                  </motion.div>
                </div>

                {/* Card number */}
                <motion.div
                  className="text-2xl font-mono tracking-wider"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}>
                  {cardNumber}
                </motion.div>

                {/* Bottom section */}
                <div className="flex justify-between items-end">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}>
                    <div className="text-xs opacity-70 mb-1">{labelName}</div>
                    <div className="font-medium text-sm tracking-wide">{cardHolder}</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}>
                    <div className="text-xs opacity-70 mb-1">{labelExpiry}</div>
                    <div className="font-medium text-sm">{expiryDate}</div>
                  </motion.div>

                  <motion.div
                    className="text-3xl font-bold italic"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.6,
                      type: "spring",
                      stiffness: 200
                    }}>
                    {brandLogo ? (
                      <img src={brandLogo} alt="Brand Logo" className="h-8 w-auto object-contain" />
                    ) : (
                      brandText
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Back of card */}
            <motion.div
              className={cn(
                "absolute inset-0 rounded-2xl shadow-2xl",
                variantStyles[variant],
                "backface-hidden"
              )}
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)"
              }}>
              {/* Magnetic strip */}
              <div className="absolute top-8 left-0 right-0 h-12 bg-black/80" />

              {/* Card info */}
              <div
                className="absolute bottom-8 left-8 right-8 text-white text-xs space-y-2 opacity-70">
                <p>Kartu Identitas Anak - Posyandu NutriLogic</p>
                <p>Hubungi Kader jika kartu ini hilang</p>
                <p className="text-[10px]">
                  Harap membawa kartu ini setiap kali melakukan kunjungan ke Posyandu untuk pencatatan pertumbuhan anak.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Click ripple effect */}
          {isClicked && (
            <motion.div
              className="absolute inset-0 rounded-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.5 }}>
              <div
                className="h-full w-full rounded-2xl border-2 border-white/50 dark:border-white/30" />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}