import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Registro from "../pages/Registro"
import InicioSesion from "../pages/InicioSesion"
import PrivateRoute from "./PrivateRoute"
import Main from "../pages/Main"
import AplicaGestor from "../pages/AplicaGestor"
import AplicaAdmin from "../pages/AplicaAdmin"
import Requests from "../pages/Requests"
import VerPerfil from "../pages/VerPerfil"
import VerPerfiles from "../pages/VerPerfiles"
import VisorPOIs from "../pages/VisorPOIs"
import CrearPOI from "../pages/CrearPOI"
import RecContrasena from "../pages/RecContrasena"
import EditarPOI from "../pages/EditarPOI"
import VerPOI from "../pages/VerPOI"

function Routing() {
    return (
        <Router>
            <Routes>
                <Route path="/Register" element={<Registro/>}/>
                <Route path="/" element={<InicioSesion/>}/>
                <Route path="/Main" element={<PrivateRoute><Main/></PrivateRoute>}/>
                <Route path="/SolicitudGestor" element={<PrivateRoute><AplicaGestor/></PrivateRoute>}/>
                <Route path="/SolicitudAdmin" element={<PrivateRoute><AplicaAdmin/></PrivateRoute>}/>
                <Route path="/Request" element={<PrivateRoute><Requests/></PrivateRoute>}/>
                <Route path="/Perfil" element={<PrivateRoute><VerPerfil/></PrivateRoute>}/>
                <Route path="/AdministrarPerfiles" element={<PrivateRoute><VerPerfiles/></PrivateRoute>}/>
                <Route path="/VerPOIs" element={<PrivateRoute><VisorPOIs/></PrivateRoute>}/>
                <Route path="/NuevoPOI" element={<PrivateRoute><CrearPOI/></PrivateRoute>}/>
                <Route path="/RecuperarContrasena" element= {<RecContrasena/>}/>
                <Route path="/EditarPOI" element={<PrivateRoute><EditarPOI/></PrivateRoute>}/>
                <Route path="/EstePOI" element={<PrivateRoute><VerPOI/></PrivateRoute>}/>







            </Routes>
        </Router>
    )
}

export default Routing
