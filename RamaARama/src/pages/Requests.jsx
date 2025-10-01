import BtnVolver from "../components/general/BtnVolver"
import Header from "../components/general/Header"
import GestorRequests from "../components/usuarios/Admin/GestorRequests"
import "../styles/General/EspacioHeader.css"

function Requests() {
    return (
        <div>
            <Header/>
            <div className='mainContent'>
            <BtnVolver/>    
            <GestorRequests/>
            </div>
        </div>
    )
}

export default Requests
