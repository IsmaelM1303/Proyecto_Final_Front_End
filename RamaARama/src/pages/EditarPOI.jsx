import React from 'react'
import Header from '../components/general/Header'
import BtnVolver from '../components/general/BtnVolver'
import EditPOI from '../components/usuarios/Gestor/EditPOI'
import "../styles/EspacioHeader.css"


function EditarPOI() {
    return (
        <div>
            <Header/>
            <div className='mainContent'>
            <BtnVolver/>
            <EditPOI/>
            </div>
        </div>
    )
}

export default EditarPOI
