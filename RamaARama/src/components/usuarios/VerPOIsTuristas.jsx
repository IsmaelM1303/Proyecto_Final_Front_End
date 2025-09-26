// src/components/VerPOIsTurista.jsx
import { useState, useEffect } from "react"
import { actualizarElemento, obtenerElementos } from "../../api/Crud"

function VerPOIsTurista() {
    const [poi, setPoi] = useState(null)
    const [mensaje, setMensaje] = useState("")
    const [esFavorito, setEsFavorito] = useState(false)

    // Cargar el POI desde localStorage al montar el componente
    useEffect(() => {
        const stored = localStorage.getItem("selectedPOI")
        if (stored) {
            setPoi(JSON.parse(stored))
        }
    }, [])

    // Verificar si el POI ya está en favoritos
    useEffect(() => {
        async function verificarFavorito() {
            if (!poi) return

            const tokenUsuario = localStorage.getItem("token")
            if (!tokenUsuario) return

            const usuarios = await obtenerElementos("usuarios", 1)
            const usuario = usuarios.find(u => String(u.id) === String(tokenUsuario))
            if (!usuario) return

            if (Array.isArray(usuario.favoritos) && usuario.favoritos.includes(poi.id)) {
                setEsFavorito(true)
            } else {
                setEsFavorito(false)
            }
        }

        verificarFavorito()
    }, [poi])

    if (!poi) {
        return <p>No hay POI seleccionado</p>
    }

    const handleToggleFavorito = async () => {
        try {
            const tokenUsuario = localStorage.getItem("token")
            if (!tokenUsuario) {
                setMensaje("No hay usuario autenticado")
                return
            }

            const usuarios = await obtenerElementos("usuarios", 1)
            const usuario = usuarios.find(u => String(u.id) === String(tokenUsuario))
            if (!usuario) {
                setMensaje("Usuario no encontrado")
                return
            }

            let favoritosActualizados = []
            if (Array.isArray(usuario.favoritos)) {
                favoritosActualizados = [...usuario.favoritos]
            }

            if (esFavorito) {
                // Remover
                favoritosActualizados = favoritosActualizados.filter(id => id !== poi.id)
                await actualizarElemento("usuarios", usuario.id, { favoritos: favoritosActualizados }, 1)
                setEsFavorito(false)
                setMensaje("Removido de favoritos ✅")
            } else {
                // Añadir
                if (!favoritosActualizados.includes(poi.id)) {
                    favoritosActualizados.push(poi.id)
                }
                await actualizarElemento("usuarios", usuario.id, { favoritos: favoritosActualizados }, 1)
                setEsFavorito(true)
                setMensaje("Añadido a favoritos ✅")
            }
        } catch (error) {
            console.error("Error al actualizar favoritos:", error)
            setMensaje("Error al actualizar favoritos ❌")
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

            <button onClick={handleToggleFavorito} style={{ marginTop: 12 }}>
                {esFavorito ? "Remover de favoritos" : "Añadir a favoritos"}
            </button>

            {mensaje && <p>{mensaje}</p>}
        </div>
    )
}

export default VerPOIsTurista
