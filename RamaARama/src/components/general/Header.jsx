// src/components/Header.jsx
import React from "react"
import { useNavigate } from "react-router-dom"
import logo from "../../assets/Imgs/Logo.png"

function Header() {
    const navigate = useNavigate()
    const token = localStorage.getItem("token")

    function handleLogout() {
        localStorage.removeItem("token") // Borra el token
        navigate("/") // Redirige a la ruta raíz
    }

    return (
        <header>
            {/* Logo */}
            <div>
                <img src={logo} alt="Logo" width="100" height="100" />
            </div>

            {/* Título */}
            <h1>Rama a Rama</h1>

            {/* Botones */}
            <div>
                <button>Admin</button>
                <button>Perfil</button>
                <button>Nosotros</button>
                {token && <button onClick={handleLogout}>Cerrar sesión</button>}
            </div>
        </header>
    )
}

export default Header
