import React from 'react'
import Header from '../components/general/Header'
import BtnVolver from '../components/general/BtnVolver'
import ListaPerfiles from '../components/usuarios/Admin/ListaPerfiles'

function VerPerfiles() {
    return (
        <div>
            <Header/>
            <BtnVolver/>
            <ListaPerfiles/>
        </div>
    )
}

export default VerPerfiles
