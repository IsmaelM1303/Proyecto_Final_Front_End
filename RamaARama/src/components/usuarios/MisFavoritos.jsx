// src/components/usuarios/MisFavoritos.jsx
import { useState, useEffect } from "react"
import { obtenerElementos } from "../../api/Crud"

function MisFavoritos() {
    const [favoritos, setFavoritos] = useState([])
    const [mensaje, setMensaje] = useState("")

    useEffect(() => {
        async function cargarFavoritos() {
            try {
                const tokenUsuario = localStorage.getItem("token")
                if (!tokenUsuario) {
                    setMensaje("No hay usuario autenticado")
                    return
                }

                // 1. Obtener todos los usuarios desde servidor 1 (3001)
                const usuarios = await obtenerElementos("usuarios", 1)
                if (!Array.isArray(usuarios)) {
                    setMensaje("No se pudieron cargar los usuarios")
                    return
                }

                // 2. Buscar el usuario cuyo id coincide con el token
                const usuario = usuarios.find(u => String(u.id) === String(tokenUsuario))
                if (!usuario) {
                    setMensaje("Usuario no encontrado")
                    return
                }

                // 3. Obtener todos los POIs desde servidor 3 (3002)
                const pois = await obtenerElementos("POIs", 3)
                if (!Array.isArray(pois)) {
                    setMensaje("No se pudieron cargar los POIs")
                    return
                }

                // 4. Filtrar los POIs que están en la lista de favoritos del usuario
                let listaFavoritos = []
                if (Array.isArray(usuario.favoritos)) {
                    listaFavoritos = pois.filter(poi => usuario.favoritos.includes(poi.id))
                }

                setFavoritos(listaFavoritos)
                if (listaFavoritos.length === 0) {
                    setMensaje("No tienes favoritos guardados")
                } else {
                    setMensaje("")
                }
            } catch (error) {
                console.error("Error al cargar favoritos:", error)
                setMensaje("Error al cargar favoritos")
            }
        }

        cargarFavoritos()
    }, [])

    return (
        <div style={{ maxWidth: 600 }}>
            <h2>Mis Favoritos</h2>
            {mensaje && <p>{mensaje}</p>}

            {favoritos.length > 0 && (
                <ul>
                    {favoritos.map((poi, i) => (
                        <li key={`fav-${i}`}>
                            <strong>{poi.nombre}</strong>
                            <p>{poi.descripcion}</p>

                            {Array.isArray(poi.categorias) && poi.categorias.length > 0 && (
                                <div>
                                    <span>Categorías:</span>
                                    <ul>
                                        {poi.categorias.map((cat, j) => (
                                            <li key={`cat-${i}-${j}`}>{cat}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {Array.isArray(poi.redes) && poi.redes.length > 0 && (
                                <div>
                                    <span>Redes:</span>
                                    <ul>
                                        {poi.redes.map((red, r) => {
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
                                                <li key={`red-${i}-${r}`}>
                                                    {tipo}: {contenido}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default MisFavoritos
