import React from 'react'
import Header from "../components/general/Header"
import BtnVolver from "../components/general/BtnVolver"
import NuevoPOI from '../components/usuarios/Gestor/NuevoPOI'
import "../styles/General/EspacioHeader.css"


function CrearPOI() {
    return (
        <div>
            <Header/>
            <div className="mainContent">
            <BtnVolver/>
            <NuevoPOI/>
            </div>
        </div>
    )
}

export default CrearPOI
