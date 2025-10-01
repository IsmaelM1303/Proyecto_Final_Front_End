import React from 'react'
import POIs from '../components/usuarios/Gestor/POIs'
import BtnVolver from "../components/general/BtnVolver"
import Header from '../components/general/Header'
import "../styles/EspacioHeader.css"


function VisorPOIs() {
    return (
        <div>
            <Header/>
            <div className='mainContent'>
            <BtnVolver/>
            <POIs/>
            </div>
        </div>
    )
}

export default VisorPOIs
