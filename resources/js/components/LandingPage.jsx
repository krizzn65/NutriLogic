import React from 'react'
import Header from './landing-page/Header'
import Problem from './landing-page/Problem'
import Fitur from './landing-page/Fitur'
import Penggunaan from './landing-page/Penggunaan'
import Testimonial from './landing-page/Testimonial'
import Footer from './landing-page/Footer'

const LandingPage = () => {
  return (
    <div className='w-full min-h-screen'>
      <Header />
      <Problem />
      <Fitur />
      <Penggunaan />
      <Testimonial />
      <Footer />
    </div>
  )
}

export default LandingPage
