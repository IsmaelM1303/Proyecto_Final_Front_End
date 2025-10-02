import { useState, useEffect } from "react"
import { obtenerElementos } from "../../../api/Crud"
import "../../../styles/ListaPerfiles.css"

/**
 * Componente ListaPerfiles
 * Permite al administrador visualizar, buscar y filtrar la lista de usuarios por tipo de cuenta.
 * Incluye filtros por rol, búsqueda por nombre y soporte para vista móvil y escritorio.
 */
function ListaPerfiles() {
    // Estado para la lista de usuarios obtenida
    const [usuarios, setUsuarios] = useState([])
    // Estado para el texto de búsqueda
    const [busqueda, setBusqueda] = useState("")
    // Estado para el filtro de rol
    const [filtro, setFiltro] = useState("todos")
    // Estado para mostrar indicador de carga
    const [cargando, setCargando] = useState(true)
    // Estado para controlar el menú de filtros en móvil
    const [menuAbierto, setMenuAbierto] = useState(false)

    // Efecto para cargar usuarios al montar el componente
    useEffect(() => {
        async function cargarUsuarios() {
            setCargando(true)
            const data = await obtenerElementos("usuarios", 1)
            if (data) setUsuarios(data)
            setCargando(false)
        }
        cargarUsuarios()
    }, [])

    // Filtra usuarios según búsqueda y filtro de rol
    function filtrarUsuarios() {
        return usuarios.filter(u => {
            const nombreCoincide = u.nombre?.toLowerCase().includes(busqueda.toLowerCase())
            let tipo = u.tipoCuenta?.toLowerCase().trim() || ""

            let pasaFiltro = false
            if (filtro === "todos") pasaFiltro = true
            else if (filtro === "turista") pasaFiltro = tipo === "turista"
            else if (filtro === "gestor") pasaFiltro = tipo.includes("gestor")
            else if (filtro === "admin") pasaFiltro = tipo.includes("admin")

            return nombreCoincide && pasaFiltro
        })
    }

    // Lista filtrada para renderizar
    const listaFiltrada = filtrarUsuarios()

    return (
        <div className="perfiles">
            <h2 className="perfiles__title">Lista de Perfiles</h2>

            {/* Input de búsqueda por nombre */}
            <input
                type="text"
                placeholder="Buscar por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="perfiles__search"
            />

            {/* Filtros por rol: desktop y móvil */}
            <div className="perfiles__filters">
                {/* Filtros para escritorio */}
                <div className="perfiles__filters-desktop">
                    <button
                        className={`perfiles__filter-btn ${filtro === "turista" ? "is-active" : ""}`}
                        onClick={() => setFiltro("turista")}
                    >
                        Solo turistas
                    </button>
                    <button
                        className={`perfiles__filter-btn ${filtro === "gestor" ? "is-active" : ""}`}
                        onClick={() => setFiltro("gestor")}
                    >
                        Turistas gestores
                    </button>
                    <button
                        className={`perfiles__filter-btn ${filtro === "admin" ? "is-active" : ""}`}
                        onClick={() => setFiltro("admin")}
                    >
                        Turistas admin
                    </button>
                </div>

                {/* Filtros para móvil (dropdown) */}
                <div className="perfiles__filters-mobile">
                    <button
                        className="perfiles__filter-btn perfiles__filter-btn--group"
                        onClick={() => setMenuAbierto(!menuAbierto)}
                    >
                        Filtros
                    </button>
                    {menuAbierto && (
                        <div className="perfiles__dropdown">
                            <button
                                className={`perfiles__filter-btn ${filtro === "turista" ? "is-active" : ""}`}
                                onClick={() => { setFiltro("turista"); setMenuAbierto(false) }}
                            >
                                Solo turistas
                            </button>
                            <button
                                className={`perfiles__filter-btn ${filtro === "gestor" ? "is-active" : ""}`}
                                onClick={() => { setFiltro("gestor"); setMenuAbierto(false) }}
                            >
                                Turistas gestores
                            </button>
                            <button
                                className={`perfiles__filter-btn ${filtro === "admin" ? "is-active" : ""}`}
                                onClick={() => { setFiltro("admin"); setMenuAbierto(false) }}
                            >
                                Turistas admin
                            </button>
                        </div>
                    )}
                </div>

                {/* Botón para mostrar todos los usuarios */}
                <button
                    className={`perfiles__filter-btn ${filtro === "todos" ? "is-active" : ""}`}
                    onClick={() => setFiltro("todos")}
                >
                    Todos
                </button>
            </div>

            {/* Renderizado de la lista filtrada o mensajes de estado */}
            {cargando ? (
                <p className="perfiles__loading">Cargando usuarios...</p>
            ) : listaFiltrada.length === 0 ? (
                <p className="perfiles__empty">No se encontraron usuarios</p>
            ) : (
                <ul className="perfiles__list">
                    {listaFiltrada.map((u) => (
                        <li key={u.id} className="perfiles__item">
                            <strong className="perfiles__name">{u.nombre}</strong> -{" "}
                            <span className="perfiles__role">{u.tipoCuenta}</span>
                            <br />
                            <small className="perfiles__email">{u.correo}</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default ListaPerfiles