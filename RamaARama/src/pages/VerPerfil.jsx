import React from 'react'
import Header from '../components/general/Header'
import BtnVolver from '../components/general/BtnVolver'
import Perfil from '../components/usuarios/Perfil'
import "../styles/General/EspacioHeader.css"

function VerPerfil() {
    return (
        <div>
            <Header/>
            <div className='mainContent'>
            <BtnVolver/>
            <Perfil/>
            </div>
        </div>
    )
}

export default VerPerfil
