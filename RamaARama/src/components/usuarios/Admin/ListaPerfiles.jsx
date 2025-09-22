import { useState, useEffect } from "react"
import { obtenerElementos } from "../../../api/Crud"

function ListaPerfiles() {
    const [usuarios, setUsuarios] = useState([])
    const [busqueda, setBusqueda] = useState("")
    const [filtro, setFiltro] = useState("todos") // 'turista', 'gestor', 'admin', 'todos'
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        async function cargarUsuarios() {
            setCargando(true)
            const data = await obtenerElementos("usuarios", 1)
            if (data) {
                setUsuarios(data)
            }
            setCargando(false)
        }
        cargarUsuarios()
    }, [])

    function filtrarUsuarios() {
        return usuarios.filter(u => {
            const nombreCoincide = u.nombre?.toLowerCase().includes(busqueda.toLowerCase())

            let tipo = u.tipoCuenta?.toLowerCase().trim() || ""

            let pasaFiltro = false
            if (filtro === "todos") {
                pasaFiltro = true
            } else if (filtro === "turista") {
                // Solo turistas sin gestor ni admin
                pasaFiltro = tipo === "turista"
            } else if (filtro === "gestor") {
                pasaFiltro = tipo.includes("gestor")
            } else if (filtro === "admin") {
                pasaFiltro = tipo.includes("admin")
            }

            return nombreCoincide && pasaFiltro
        })
    }

    const listaFiltrada = filtrarUsuarios()

    return (
        <div>
            <h2>Lista de Perfiles</h2>

            {/* Barra de búsqueda */}
            <input
                type="text"
                placeholder="Buscar por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ marginBottom: "10px", padding: "5px" }}
            />

            {/* Botones de filtro */}
            <div style={{ marginBottom: "15px" }}>
                <button onClick={() => setFiltro("turista")}>Solo turistas</button>
                <button onClick={() => setFiltro("gestor")}>Turistas gestores</button>
                <button onClick={() => setFiltro("admin")}>Turistas admin</button>
                <button onClick={() => setFiltro("todos")}>Todos</button>
            </div>

            {/* Lista */}
            {cargando ? (
                <p>Cargando usuarios...</p>
            ) : listaFiltrada.length === 0 ? (
                <p>No se encontraron usuarios</p>
            ) : (
                <ul>
                    {listaFiltrada.map((u) => (
                        <li key={u.id} style={{ marginBottom: "10px" }}>
                            <strong>{u.nombre}</strong> - {u.tipoCuenta}
                            <br />
                            <small>{u.correo}</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default ListaPerfiles
