import React from 'react'
import Header from "../components/general/Header"
import VerPOIsTurista from '../components/usuarios/VerPOIsTuristas'
import BtnVolver from '../components/general/BtnVolver'

function VerPOI() {
    return (
        <div>
            <Header/>
            <BtnVolver/>
            <VerPOIsTurista/>
        </div>
    )
}

export default VerPOI
