import React from 'react'
import AplicarAdmin from '../components/usuarios/tipoCuentas/AplicarAdmin'
import Header from '../components/general/Header'
import BtnVolver from '../components/general/BtnVolver'
import "../styles/General/EspacioHeader.css"
import "../styles/StylesPages/AplicaAdmin.css"

function AplicaAdmin() {
    return (
        <div className='divAplicaAdmin'>
            <Header/>
            <div className='mainContent'>
            <AplicarAdmin/>
            <BtnVolver/>
            </div>
        </div>
    )
}

export default AplicaAdmin
