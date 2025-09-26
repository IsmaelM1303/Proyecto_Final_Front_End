// src/components/VerPOIsTurista.jsx
import { useState, useEffect } from "react"
import { actualizarElemento, obtenerElementos } from "../../api/Crud"

function VerPOIsTurista() {
    const [poi, setPoi] = useState(null)
    const [mensaje, setMensaje] = useState("")

    // Cargar el POI desde localStorage al montar el componente
    useEffect(() => {
        const stored = localStorage.getItem("selectedPOI")
        if (stored) {
            setPoi(JSON.parse(stored))
        }
    }, [])

    if (!poi) {
        return <p>No hay POI seleccionado</p>
    }

    const handleAddFavorito = async () => {
        try {
            const tokenUsuario = localStorage.getItem("token")
            if (!tokenUsuario) {
                setMensaje("No hay usuario autenticado")
                return
            }

            // 1. Obtener todos los usuarios
            const usuarios = await obtenerElementos("usuarios", 1)

            // 2. Buscar el usuario cuyo id coincide con el token
            const usuario = usuarios.find(u => String(u.id) === String(tokenUsuario))
            if (!usuario) {
                setMensaje("Usuario no encontrado")
                return
            }

            // 3. Preparar la nueva lista de favoritos
            let favoritosActualizados = []
            if (Array.isArray(usuario.favoritos)) {
                favoritosActualizados = [...usuario.favoritos]
            }

            // Evitar duplicados
            if (!favoritosActualizados.includes(poi.id)) {
                favoritosActualizados.push(poi.id)
            }

            // 4. Actualizar el usuario
            await actualizarElemento(
                "usuarios",
                usuario.id,
                { favoritos: favoritosActualizados },
                1
            )

            setMensaje("Añadido a favoritos ✅")
        } catch (error) {
            console.error("Error al añadir a favoritos:", error)
            setMensaje("Error al añadir a favoritos ❌")
        }
    }

    return (
        <div style={{ maxWidth: 500 }}>
            <h2>{poi.nombre}</h2>
            <p>{poi.descripcion}</p>

            {Array.isArray(poi.categorias) && poi.categorias.length > 0 && (
                <div>
                    <h4>Categorías:</h4>
                    <ul>
                        {poi.categorias.map((cat, i) => {
                            return <li key={`cat-${i}`}>{cat}</li>
                        })}
                    </ul>
                </div>
            )}

            {Array.isArray(poi.redes) && poi.redes.length > 0 && (
                <div>
                    <h4>Redes:</h4>
                    <ul>
                        {poi.redes.map((red, i) => {
                            let contenido = "—"
                            if (red && red.link) {
                                contenido = (
                                    <a
                                        href={red.link}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {red.link}
                                    </a>
                                )
                            }
                            let tipo = "Link"
                            if (red && red.tipo) {
                                tipo = red.tipo
                            }
                            return (
                                <li key={`red-${i}`}>
                                    {tipo}: {contenido}
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )}

            <button onClick={handleAddFavorito} style={{ marginTop: 12 }}>
                Añadir a favoritos
            </button>

            {mensaje && <p>{mensaje}</p>}
        </div>
    )
}

export default VerPOIsTurista
