import React from 'react'
import Header from '../components/general/Header'
import BtnVolver from '../components/general/BtnVolver'
import ListaPerfiles from '../components/usuarios/Admin/ListaPerfiles'
import "../styles/General/EspacioHeader.css"
import "../styles/StylesPages/BotonesPerfil.css"


function VerPerfiles() {
    return (
        <div className='divBotonesPerfil'>
            <Header/>
            <div className='mainContent'>
            <BtnVolver/>
            <ListaPerfiles/>
            </div>
        </div>
    )
}

export default VerPerfiles
