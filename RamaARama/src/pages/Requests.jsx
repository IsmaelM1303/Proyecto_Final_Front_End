import BtnVolver from "../components/general/BtnVolver"
import Header from "../components/general/Header"
import GestorRequests from "../components/usuarios/Admin/GestorRequests"
import "../styles/General/EspacioHeader.css"
import "../styles/StylesPages/BotonesPerfil.css"

function Requests() {
    return (
        <div className="divBotonesPerfil">
            <Header/>
            <div className='mainContent'>
            <BtnVolver/>    
            <GestorRequests/>
            </div>
        </div>
    )
}

export default Requests
