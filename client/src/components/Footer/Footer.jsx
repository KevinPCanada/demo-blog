import React from 'react'
import './Footer.css'
import Logo from './../../assets/img/placeholder-logo-1.png'

const Footer = () => {
  return (
    <footer>
      <img src={Logo} alt="" className='footerLogo'/>
      <span>This website is demo and not intended for commercial use.</span>
    </footer>
  )
}

export default Footer