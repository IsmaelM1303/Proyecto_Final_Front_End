import React from 'react'
import Header from '../components/general/Header'
import BtnVolver from '../components/general/BtnVolver'
import Perfil from '../components/usuarios/Perfil'
import "../styles/General/EspacioHeader.css"
import "../styles/StylesPages/VerPerfil.css"

function VerPerfil() {
    return (
        <div className='divVerPerfil'>
            <Header/>
            <div className='mainContent'>
            <BtnVolver/>
            <Perfil/>
            </div>
        </div>
    )
}

export default VerPerfil
