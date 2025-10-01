import React from 'react'
import Header from '../components/general/Header'
import BtnVolver from '../components/general/BtnVolver'
import MisFavoritos from '../components/usuarios/MisFavoritos'
import "../styles/EspacioHeader.css"


function PageMisFavs() {
    return (
        <div>
            <Header/>
            <div className='mainContent'>
            <BtnVolver/>
            <MisFavoritos/>
            </div>
        </div>
    )
}

export default PageMisFavs
