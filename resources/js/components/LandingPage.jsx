import React from 'react'
import { motion } from 'framer-motion'
import Header from './landing-page/Header'
import AboutUs from './landing-page/AboutUs'
import Problem from './landing-page/Problem'
import Fitur from './landing-page/Fitur'
import Penggunaan from './landing-page/Penggunaan'
import Contact from './landing-page/Contact'
import Footer from './landing-page/Footer'

const LandingPage = () => {
  return (
    <motion.div
      className='w-full min-h-screen font-montserrat'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <style>{`
        @media (max-width: 768px) {
          /* Hide scrollbar for Chrome, Safari and Opera */
          html::-webkit-scrollbar, body::-webkit-scrollbar {
            display: none !important;
            width: 0px !important;
            background: transparent !important;
          }
          
          /* Hide scrollbar for IE, Edge and Firefox */
          html, body {
            -ms-overflow-style: none !important;  /* IE and Edge */
            scrollbar-width: none !important;  /* Firefox */
          }
        }
      `}</style>
      <Header />
      <AboutUs />
      <Problem />
      <Fitur />
      <Penggunaan />
      <Contact />
      <Footer />
    </motion.div>
  )
}

export default LandingPage
