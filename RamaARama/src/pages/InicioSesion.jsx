import Header from "../components/general/Header"
import Login from "../components/usuarios/LogIn"
import "../styles/General/EspacioHeader.css"
import "../styles/StylesPages/LoginPage.css"

function InicioSesion() {
    return (
        <div className="divInicioSesion">
            <Header/>
            <div className='mainContent'>
            <Login/>
            </div>
        </div>
    )
}

export default InicioSesion
