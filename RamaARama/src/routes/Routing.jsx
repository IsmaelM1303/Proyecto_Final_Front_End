import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import AplicaAdmin from "../pages/AplicaAdmin"
import AplicaGestor from "../pages/AplicaGestor"
import CrearPOI from "../pages/CrearPOI"
import EditarPOI from "../pages/EditarPOI"
import InicioSesion from "../pages/InicioSesion"
import Main from "../pages/Main"
import NosotrosPage from "../pages/NosotrosPage"
import PageMisFavs from "../pages/PageMisFavs"
import PrivateRoute from "./PrivateRoute"
import RecContrasena from "../pages/RecContrasena"
import Registro from "../pages/Registro"
import Requests from "../pages/Requests"
import VerPerfil from "../pages/VerPerfil"
import VerPerfiles from "../pages/VerPerfiles"
import VerPOI from "../pages/VerPOI"
import VisorPOIs from "../pages/VisorPOIs"

function Routing() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<InicioSesion />} />
                <Route path="/AdministrarPerfiles" element={<PrivateRoute><VerPerfiles /></PrivateRoute>} />
                <Route path="/EditarPOI" element={<PrivateRoute><EditarPOI /></PrivateRoute>} />
                <Route path="/EstePOI" element={<PrivateRoute><VerPOI /></PrivateRoute>} />
                <Route path="/Main" element={<PrivateRoute><Main /></PrivateRoute>} />
                <Route path="/MisFavoritos" element={<PrivateRoute><PageMisFavs /></PrivateRoute>} />
                <Route path="/Nosotros" element={<NosotrosPage />} />
                <Route path="/NuevoPOI" element={<PrivateRoute><CrearPOI /></PrivateRoute>} />
                <Route path="/Perfil" element={<PrivateRoute><VerPerfil /></PrivateRoute>} />
                <Route path="/RecuperarContrasena" element={<RecContrasena />} />
                <Route path="/Register" element={<Registro />} />
                <Route path="/Request" element={<PrivateRoute><Requests /></PrivateRoute>} />
                <Route path="/SolicitudAdmin" element={<PrivateRoute><AplicaAdmin /></PrivateRoute>} />
                <Route path="/SolicitudGestor" element={<PrivateRoute><AplicaGestor /></PrivateRoute>} />
                <Route path="/VerPOIs" element={<PrivateRoute><VisorPOIs /></PrivateRoute>} />
            </Routes>
        </Router>
    )
}

export default Routing
