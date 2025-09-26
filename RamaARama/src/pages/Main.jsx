import React from 'react'
import Header from '../components/general/Header'
import Mapa from '../components/mapas/Mapa'
import BtnFavoritos from '../components/general/BtnFavoritos'

function Main() {
    return (
        <div>
            <Header/>
            <BtnFavoritos/>
            <Mapa/>
        </div>
    )
}

export default Main
