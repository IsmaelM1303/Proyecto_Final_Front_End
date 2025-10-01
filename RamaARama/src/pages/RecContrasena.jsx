import React from 'react'
import Header from '../components/general/Header'
import Recover from '../components/usuarios/Recover'
import BtnVolver from '../components/general/BtnVolver'
import "../styles/EspacioHeader.css"


function RecContrasena() {
    return (
        <div>
            <Header/>
            <div className='mainContent'>
            <BtnVolver/>
            <Recover/>
            </div>
        </div>
    )
}

export default RecContrasena
