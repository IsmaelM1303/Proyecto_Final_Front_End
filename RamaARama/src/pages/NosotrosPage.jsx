import React from 'react'
import Header from '../components/general/Header'
import "../styles/General/EspacioHeader.css"
import Nosotros from '../components/Nosotros'
import BtnVolver from '../components/general/BtnVolver'
import "../styles/StylesPages/NosotrosPage.css"

function NosotrosPage() {
    return (
        <div className='NosotrosPage'>
            <Header/>
            <div className='mainContent'>
            <BtnVolver/>
            <Nosotros/>
            </div>
        </div>
    )
}

export default NosotrosPage
