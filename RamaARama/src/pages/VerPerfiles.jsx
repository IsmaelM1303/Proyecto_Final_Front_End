import React from 'react'
import Header from '../components/general/Header'
import BtnVolver from '../components/general/BtnVolver'
import ListaPerfiles from '../components/usuarios/Admin/ListaPerfiles'
import "../styles/EspacioHeader.css"


function VerPerfiles() {
    return (
        <div>
            <Header/>
            <div className='mainContent'>
            <BtnVolver/>
            <ListaPerfiles/>
            </div>
        </div>
    )
}

export default VerPerfiles
