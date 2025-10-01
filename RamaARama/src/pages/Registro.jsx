import React from 'react'
import Register from '../components/usuarios/Register'
import Header from '../components/general/Header'
import "../styles/EspacioHeader.css"


function Registro() {
    return (
        <div>
            <Header/>
            <div className='mainContent'>
            <Register/>
            </div>
        </div>
    )
}

export default Registro
