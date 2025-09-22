import React from 'react'
import POIs from '../components/usuarios/Gestor/POIs'
import BtnVolver from "../components/general/BtnVolver"
import Header from '../components/general/Header'

function VisorPOIs() {
    return (
        <div>
            <Header/>
            <BtnVolver/>
            <POIs/>
        </div>
    )
}

export default VisorPOIs
