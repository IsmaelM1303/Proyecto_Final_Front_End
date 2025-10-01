import Header from "../components/general/Header"
import Login from "../components/usuarios/LogIn"
import "../styles/General/EspacioHeader.css"

function InicioSesion() {
    return (
        <div>
            <Header/>
            <div className='mainContent'>
            <Login/>
            </div>
        </div>
    )
}

export default InicioSesion
