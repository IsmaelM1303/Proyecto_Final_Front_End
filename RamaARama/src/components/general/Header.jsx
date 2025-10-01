import React, { useEffect, useState } from "react"
import { useNavigate, useLocation }     from "react-router-dom"
import logo from "../../assets/Imgs/LogoBlanco.png"
import { obtenerElementos } from "../../api/Crud"

function Header() {
    const navigate = useNavigate()
    const location = useLocation()
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

    function handleBotonClick(rol) {
        if (rol === "admin") {
            navigate("/Request")
        } else if (rol === "gestor") {
            navigate("/Perfil")
        } else {
            alert(`Acción alternativa para ${rol}`)
        }
    }

    function renderBotones() {
        if (!usuario) return null

        const tipo = usuario.tipoCuenta?.toLowerCase().trim()

        return (
            <>
                {/* Si es admin, mostrar botón Admin */}
                {tipo.includes("admin") && (
                    <button
                        onClick={() => {
                            if (!location.pathname.includes("/Request")) {
                                handleBotonClick("admin")
                            }
                        }}
                        disabled={location.pathname.includes("/Request")}
                    >
                        Admin
                    </button>
                )}

                {/* Texto para aplicar como gestor solo si NO es gestor */}
                {!tipo.includes("gestor") && (
                    <span
                        style={{
                            cursor: location.pathname.includes("/SolicitudGestor") ? "not-allowed" : "pointer",
                            opacity: location.pathname.includes("/SolicitudGestor") ? 0.5 : 1
                        }}
                        onClick={() => {
                            if (!location.pathname.includes("/SolicitudGestor")) {
                                navigate("/SolicitudGestor")
                            }
                        }}
                    >
                        ¿Quieres unirte como Gestor turístico? Haz click aquí
                    </span>
                )}

                {/* Texto para aplicar como admin solo si NO es admin */}
                {!tipo.includes("admin") && (
                    <span
                        style={{
                            cursor: location.pathname.includes("/SolicitudAdmin") ? "not-allowed" : "pointer",
                            opacity: location.pathname.includes("/SolicitudAdmin") ? 0.5 : 1
                        }}
                        onClick={() => {
                            if (!location.pathname.includes("/SolicitudAdmin")) {
                                navigate("/SolicitudAdmin")
                            }
                        }}
                    >
                        ¿Quieres unirte como Administrador? Haz click aquí
                    </span>
                )}
            </>
        )
    }

    return (
        <header className="header">
            <div className="divLogo">
                <img src={logo} alt="Logo" width="100" height="100" />
            </div >
            <h1 className="headerNombre">Rama a Rama</h1>
            <div className="headerBotones">
                {token && renderBotones()}
                {token && (
                    <button
                        onClick={handleLogout}
                        disabled={location.pathname === "/"}
                    >
                        Cerrar sesión
                    </button>
                )}
                {token && (
                    <button
                        onClick={() => {
                            if (!location.pathname.includes("/Perfil")) {
                                handleBotonClick("gestor")
                            }
                        }}
                        disabled={location.pathname.includes("/Perfil")}
                    >
                        Perfil
                    </button>
                )}
                {token && (
                    <button
                        onClick={() => {
                            if (!location.pathname.includes("/Main")) {
                                navigate("/Main")
                            }
                        }}
                        disabled={location.pathname.includes("/Main")}
                    >
                        Inicio
                    </button>
                )}

                <button
                    onClick={() => {
                        if (!location.pathname.includes("/Nosotros")) {
                            navigate("/Nosotros")
                        }
                    }}
                    disabled={location.pathname.includes("/Nosotros")}
                >
                    Nosotros
                </button>
            </div>
        </header>
    )
}

export default Header
