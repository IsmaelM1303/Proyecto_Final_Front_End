import React from 'react'
import Header from "../components/general/Header"
import VerPOIsTurista from '../components/usuarios/VerPOIsTuristas'
import BtnVolver from '../components/general/BtnVolver'
import "../styles/EspacioHeader.css"


function VerPOI() {
    return (
        <div>
            <Header/>
            <div className='mainContent'>
            <BtnVolver/>
            <VerPOIsTurista/>
            </div>
        </div>
    )
}

export default VerPOI
