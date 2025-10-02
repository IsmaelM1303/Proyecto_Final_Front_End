import { useState, useEffect } from "react"
import { Rating } from "react-simple-star-rating"
import { obtenerElementos, actualizarElemento } from "../../api/Crud"
import TimelineSwitcher from "./Gestor/TimelineSwitcher"
import "../../styles/MisFavoritos.css"

/**
 * Componente MisFavoritos
 * Muestra la lista de POIs favoritos del usuario autenticado.
 * Permite calificar cada POI y muestra la valoración promedio.
 * Incluye detalles de categorías, redes y línea de tiempo de cada favorito.
 */
function MisFavoritos() {
    const [favoritos, setFavoritos] = useState([])
    const [mensaje, setMensaje] = useState("")

    // Carga los favoritos del usuario al montar el componente
    useEffect(() => {
        async function cargarFavoritos() {
            try {
                const tokenUsuario = localStorage.getItem("token")
                if (!tokenUsuario) {
                    setMensaje("No hay usuario autenticado")
                    return
                }

                const usuarios = await obtenerElementos("usuarios", 1)
                const usuario = usuarios?.find(u => String(u.id) === String(tokenUsuario))
                if (!usuario) {
                    setMensaje("Usuario no encontrado")
                    return
                }

                const pois = await obtenerElementos("POIs", 3)
                const listaFavoritos = Array.isArray(usuario.favoritos)
                    ? pois.filter(poi => usuario.favoritos.includes(poi.id))
                    : []

                setFavoritos(listaFavoritos)
                setMensaje(listaFavoritos.length === 0 ? "No tienes favoritos guardados" : "")
            } catch (error) {
                console.error("Error al cargar favoritos:", error)
                setMensaje("Error al cargar favoritos")
            }
        }

        cargarFavoritos()
    }, [])

    // Normaliza la calificación a estrellas (1-5)
    const normalizarAEstrellas = (valor) => valor > 5 ? valor / 20 : valor

    // Maneja el cambio de calificación de un POI
    const manejarCambioCalificacion = async (poi, valorCrudo) => {
        const token = localStorage.getItem("token") || "usuario-sin-token"
        const idPOI = poi.id
        const valorNormalizado = normalizarAEstrellas(valorCrudo)

        const todosPOIs = await obtenerElementos("POIs", 3)
        const poiActual = todosPOIs.find(p => p.id === idPOI)
        if (!poiActual) return

        poiActual.valoracion = Array.isArray(poiActual.valoracion) ? poiActual.valoracion : []

        const indiceExistente = poiActual.valoracion.findIndex(v => v.usuarioId === token)
        if (indiceExistente >= 0) {
            poiActual.valoracion[indiceExistente].valor = valorNormalizado
        } else {
            poiActual.valoracion.push({ usuarioId: token, valor: valorNormalizado })
        }

        const suma = poiActual.valoracion.reduce((acc, v) => acc + v.valor, 0)
        const promedio = suma / poiActual.valoracion.length

        await actualizarElemento("POIs", idPOI, {
            valoracion: poiActual.valoracion,
            valoracionPonderada: promedio
        }, 3)

        setFavoritos(prev =>
            prev.map(f =>
                f.id === idPOI
                    ? { ...f, valoracion: poiActual.valoracion, valoracionPonderada: promedio }
                    : f
            )
        )
    }

    // Render principal de favoritos
    return (
        <div className="divMisFavoritos">
            <h2 className="tituloMisFavoritos">Mis Favoritos</h2>
            {mensaje && <p className="mensajeMisFavoritos">{mensaje}</p>}

            {favoritos.length > 0 && (
                <ul className="listaFavoritos">
                    {favoritos.map((poi, i) => {
                        const token = localStorage.getItem("token") || "usuario-sin-token"
                        const valorUsuario = poi.valoracion?.find(v => v.usuarioId === token)?.valor || 0
                        const promedio = typeof poi.valoracionPonderada === "number" ? poi.valoracionPonderada : 0

                        return (
                            <li key={`fav-${i}`} className="itemFavorito">
                                <strong className="nombreFavorito">{poi.nombre}</strong>
                                <p className="descripcionFavorito">{poi.descripcion}</p>

                                {/* Calificación por estrellas */}
                                <div className="ratingFavorito">
                                    <Rating
                                        initialValue={valorUsuario}
                                        size={20}
                                        allowHalfIcon={true}
                                        onClick={(valor) => manejarCambioCalificacion(poi, valor)}
                                        fillColor="#33a810ff"
                                        emptyColor="#ccc"
                                    />
                                </div>

                                <p className="promedioFavorito">
                                    Valoración promedio: <strong>{promedio.toFixed(2)}</strong>
                                </p>

                                {/* Línea de tiempo del POI */}
                                {Array.isArray(poi.lineaTiempo) && poi.lineaTiempo.length > 0 && (
                                    <div className="timelineFavorito">
                                        <TimelineSwitcher eventos={poi.lineaTiempo} />
                                    </div>
                                )}

                                {/* Categorías del POI */}
                                {Array.isArray(poi.categorias) && poi.categorias.length > 0 && (
                                    <div className="categoriasFavorito">
                                        <span>Categorías:</span>
                                        <ul>
                                            {poi.categorias.map((cat, j) => (
                                                <li key={`cat-${i}-${j}`}>{cat}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Redes sociales del POI */}
                                {Array.isArray(poi.redes) && poi.redes.length > 0 && (
                                    <div className="redesFavorito">
                                        <span>Redes:</span>
                                        <ul>
                                            {poi.redes.map((red, r) => {
                                                const contenido = red?.link ? (
                                                    <a href={red.link} target="_blank" rel="noreferrer">
                                                        {red.link}
                                                    </a>
                                                ) : "—"
                                                const tipo = red?.tipo || "Link"
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
                        )
                    })}
                </ul>
            )}
        </div>
    )
}

export default MisFavoritos