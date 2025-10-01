import BtnVolver from "../components/general/BtnVolver"
import Header from "../components/general/Header"
import AplicarGestor from "../components/usuarios/tipoCuentas/AplicarGestor"
import "../styles/General/EspacioHeader.css"



function AplicaGestor() {
    return (
        <div>
            <Header/>
            <div className="mainContent">
            <AplicarGestor/>
            <BtnVolver/>
            </div>
        </div>
    )
}

export default AplicaGestor
