import React from 'react'
import Header from '../components/general/Header'
import Mapa from '../components/mapas/Mapa'
import BtnFavoritos from '../components/general/BtnFavoritos'
import "../styles/General/EspacioHeader.css"

function Main() {
    return (
        <div>
            <Header/>
            <div className="mainContent">
            <BtnFavoritos/>
            <Mapa/>
            </div>
        </div>
    )
}

export default Main
