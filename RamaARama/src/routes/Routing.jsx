import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Registro from "../pages/Registro"
import InicioSesion from "../pages/InicioSesion"
import PrivateRoute from "./PrivateRoute"
import Main from "../pages/Main"
import AplicaGestor from "../pages/AplicaGestor"
import AplicaAdmin from "../pages/AplicaAdmin"

function Routing() {
    return (
        <Router>
            <Routes>
                <Route path="/Register" element={<Registro/>}/>
                <Route path="/" element={<InicioSesion/>}/>
                <Route path="/Main" element={<PrivateRoute><Main/></PrivateRoute>}/>
                <Route path="/SolicitudGestor" element={<PrivateRoute><AplicaGestor/></PrivateRoute>}/>
                <Route path="/SolicitudAdmin" element={<PrivateRoute><AplicaAdmin/></PrivateRoute>}/>



            </Routes>
        </Router>
    )
}

export default Routing
