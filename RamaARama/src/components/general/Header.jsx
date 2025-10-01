import React, { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import logo from "../../assets/Imgs/LogoBlanco.png"
import { obtenerElementos } from "../../api/Crud"
import "../../styles/Header.css"

function Header() {
    const navigate = useNavigate()
    const location = useLocation()
    const token = localStorage.getItem("token")
    const [usuario, setUsuario] = useState(null)
    const [menuAbierto, setMenuAbierto] = useState(false)

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
                {tipo.includes("admin") && (
                    <button
                        className="headerBtnAdmin"
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

                {!tipo.includes("gestor") && (
                    <span
                        className={`headerTextoSolicitudGestor ${location.pathname.includes("/SolicitudGestor") ? "disabled" : ""}`}
                        onClick={() => {
                            if (!location.pathname.includes("/SolicitudGestor")) {
                                navigate("/SolicitudGestor")
                            }
                        }}
                    >
                        ¿Quieres unirte como Gestor turístico? Haz click aquí
                    </span>
                )}

                {!tipo.includes("admin") && (
                    <span
                        className={`headerTextoSolicitudAdmin ${location.pathname.includes("/SolicitudAdmin") ? "disabled" : ""}`}
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
            <div className="headerLogo">
                <img src={logo} alt="Logo" className="headerLogoImg" />
            </div>

            <h1 className="headerNombre">Rama a Rama</h1>

            {/* Botones alineados en la misma fila */}
            <div className={`headerBotones ${menuAbierto ? "abierto" : ""}`}>
                {token && renderBotones()}

                {token && (
                    <button
                        className="headerBtnLogout"
                        onClick={handleLogout}
                        disabled={location.pathname === "/"}
                    >
                        Cerrar sesión
                    </button>
                )}

                {token && (
                    <button
                        className="headerBtnPerfil"
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
                        className="headerBtnInicio"
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
                    className="headerBtnNosotros"
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

            {/* Botón menú solo visible en móvil */}
            <button
                className="headerBtnMenu"
                onClick={() => setMenuAbierto(!menuAbierto)}
            >
                ☰
            </button>
        </header>
    )
}

export default Header
