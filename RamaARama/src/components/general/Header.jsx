import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../../assets/Imgs/Logo.png"
import { obtenerElementos } from "../../api/Crud"

function Header() {
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    const [usuario, setUsuario] = useState(null)

    useEffect(() => {
        async function fetchUsuario() {
            if (token) {
                const usuarios = await obtenerElementos("usuarios")
                if (usuarios) {
                    const encontrado = usuarios.find(u => String(u.id) === String(token))
                    setUsuario(encontrado || null)
                }
            }
        }
        fetchUsuario()
    }, [token])

    function handleLogout() {
        localStorage.removeItem("token")
        navigate("/")
    }

    function renderBotones() {
        if (!usuario) return null

        const tipo = usuario.tipoCuenta?.toLowerCase().trim()

        if (tipo === "turista") {
            return (
                <>
                    <span
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/SolicitudAdmin")}
                    >
                        ¿Quieres unirte como Administrador? Haz click aquí
                    </span>
                    <span
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/SolicitudGestor")}
                    >
                        ¿Quieres unirte como Gestor turístico? Haz click aquí
                    </span>
                </>
            )
        }

        if (tipo === "turista gestor") {
            return (
                <>
                    <span
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/SolicitudAdmin")}
                    >
                        ¿Quieres unirte como Administrador? Haz click aquí
                    </span>
                    <button onClick={() => navigate("/SolicitudGestor")}>
                        Perfil
                    </button>
                </>
            )
        }

        if (tipo === "turista admin") {
            return (
                <>
                    <span
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/SolicitudGestor")}
                    >
                        ¿Quieres unirte como Gestor turístico? Haz click aquí
                    </span>
                    <button onClick={() => navigate("/Admin")}>Admin</button>
                </>
            )
        }

        if (
            tipo === "turista gestor admin" ||
            tipo === "turista admin gestor"
        ) {
            return (
                <>
                    <button onClick={() => navigate("/Admin")}>Admin</button>
                    <button onClick={() => navigate("/SolicitudGestor")}>
                        Perfil
                    </button>
                </>
            )
        }

        return null
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
                {token && renderBotones()}
                {token && (
                    <button onClick={handleLogout}>Cerrar sesión</button>
                )}
                <button onClick={() => navigate("/Nosotros")}>Nosotros</button>
            </div>
        </header>
    )
}

export default Header
