import React, { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import logo from "../../assets/Imgs/LogoBlanco.png"
import { obtenerElementos } from "../../api/Crud"
import "../../styles/General/Header.css"

/**
 * Componente Header: Encabezado principal de la aplicación.
 * Muestra el logo, nombre, botones de navegación y opciones según el rol del usuario.
 */
function Header() {
    // Hook para navegación programática
    const navigate = useNavigate()
    // Hook para obtener la ruta actual
    const location = useLocation()
    // Token de autenticación almacenado en localStorage
    const token = localStorage.getItem("token")
    // Estado para almacenar el usuario autenticado
    const [usuario, setUsuario] = useState(null)
    // Estado para controlar la visibilidad del menú en dispositivos móviles
    const [menuAbierto, setMenuAbierto] = useState(false)

    // Efecto para obtener los datos del usuario autenticado al montar el componente o cambiar el token
    useEffect(() => {
        async function fetchUsuario() {
            if (token) {
                // Obtiene la lista de usuarios desde la API simulada
                const usuarios = await obtenerElementos("usuarios")
                if (usuarios) {
                    // Busca el usuario cuyo id coincide con el token
                    const encontrado = usuarios.find(u => String(u.id) === String(token))
                    setUsuario(encontrado || null)
                }
            }
        }
        fetchUsuario()
    }, [token])

    // Función para cerrar sesión: elimina el token y redirige al inicio
    function handleLogout() {
        localStorage.removeItem("token")
        navigate("/")
    }

    // Función para manejar la navegación según el rol del usuario
    function handleBotonClick(rol) {
        if (rol === "admin") {
            navigate("/Request")
        } else if (rol === "gestor") {
            navigate("/Perfil")
        } else {
            alert(`Acción alternativa para ${rol}`)
        }
    }

    // Renderiza los botones específicos según el tipo de cuenta del usuario
    function renderBotones() {
        if (!usuario) return null
        const tipo = usuario.tipoCuenta?.toLowerCase().trim()

        return (
            <>
                {/* Botón para administradores */}
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

                {/* Opción para aplicar como gestor si el usuario no es gestor */}
                {!tipo.includes("gestor") && (
                    <span
                        className={`headerTextoSolicitudGestor ${location.pathname.includes("/SolicitudGestor") ? "disabled" : ""}`}
                        onClick={() => {
                            if (!location.pathname.includes("/SolicitudGestor")) {
                                navigate("/SolicitudGestor")
                            }
                        }}
                    >
                        Aplicar como gestor
                    </span>
                )}

                {/* Opción para aplicar como administrador si el usuario no es admin */}
                {!tipo.includes("admin") && (
                    <span
                        className={`headerTextoSolicitudAdmin ${location.pathname.includes("/SolicitudAdmin") ? "disabled" : ""}`}
                        onClick={() => {
                            if (!location.pathname.includes("/SolicitudAdmin")) {
                                navigate("/SolicitudAdmin")
                            }
                        }}
                    >
                        Aplicar como administrador
                    </span>
                )}
            </>
        )
    }

    return (
        <header className="header">
            {/* Logo de la aplicación */}
            <div className="headerLogo">
                <img src={logo} alt="Logo" className="headerLogoImg" />
            </div>

            {/* Nombre de la aplicación */}
            <h1 className="headerNombre">Rama a Rama</h1>

            {/* Contenedor de botones de navegación */}
            <div className={`headerBotones ${menuAbierto ? "abierto" : ""}`}>
                {/* Botones condicionales según autenticación y rol */}
                {token && renderBotones()}

                {/* Botón para cerrar sesión */}
                {token && (
                    <button
                        className="headerBtnLogout"
                        onClick={handleLogout}
                        disabled={location.pathname === "/"}
                    >
                        Cerrar sesión
                    </button>
                )}

                {/* Botón para acceder al perfil */}
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

                {/* Botón para ir a la página principal */}
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

                {/* Botón para la sección "Nosotros" */}
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

            {/* Botón para abrir/cerrar el menú en dispositivos móviles */}
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