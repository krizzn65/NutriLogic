import React from 'react'
import { motion } from 'framer-motion'
import Header from './landing-page/Header'
import AboutUs from './landing-page/AboutUs'
import Problem from './landing-page/Problem'
import Fitur from './landing-page/Fitur'
import Penggunaan from './landing-page/Penggunaan'
import Testimonial from './landing-page/Testimonial'
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
      <Header />
      <AboutUs />
      <Problem />
      <Fitur />
      <Penggunaan />
      <Testimonial />
      <Footer />
    </motion.div>
  )
}

export default LandingPage
