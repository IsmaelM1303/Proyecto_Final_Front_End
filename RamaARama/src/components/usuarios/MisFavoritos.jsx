// src/components/usuarios/MisFavoritos.jsx
import { useState, useEffect } from "react"
import { Rating } from "react-simple-star-rating"
import { obtenerElementos, actualizarElemento } from "../../api/Crud"

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

                const usuarios = await obtenerElementos("usuarios", 1)
                if (!Array.isArray(usuarios)) {
                    setMensaje("No se pudieron cargar los usuarios")
                    return
                }

                const usuario = usuarios.find(u => String(u.id) === String(tokenUsuario))
                if (!usuario) {
                    setMensaje("Usuario no encontrado")
                    return
                }

                const pois = await obtenerElementos("POIs", 3)
                if (!Array.isArray(pois)) {
                    setMensaje("No se pudieron cargar los POIs")
                    return
                }

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

    const normalizarAEstrellas = (valor) => {
        if (valor > 5) {
            return valor / 20
        }
        return valor
    }

    const manejarCambioCalificacion = async (poi, valorCrudo) => {
        const token = localStorage.getItem("token") || "usuario-sin-token"
        const idPOI = poi.id
        const valorNormalizado = normalizarAEstrellas(valorCrudo)

        const todosPOIs = await obtenerElementos("POIs", 3)
        const poiActual = todosPOIs.find(p => p.id === idPOI)
        if (!poiActual) {
            return
        }

        if (!Array.isArray(poiActual.valoracion)) {
            poiActual.valoracion = []
        }

        const indiceExistente = poiActual.valoracion.findIndex(v => v.usuarioId === token)
        if (indiceExistente >= 0) {
            poiActual.valoracion[indiceExistente].valor = valorNormalizado
        } else {
            poiActual.valoracion.push({ usuarioId: token, valor: valorNormalizado })
        }

        let suma = 0
        for (let k = 0; k < poiActual.valoracion.length; k++) {
            suma += poiActual.valoracion[k].valor
        }
        const promedio = suma / poiActual.valoracion.length

        const datosActualizados = {
            valoracion: poiActual.valoracion,
            valoracionPonderada: promedio
        }

        await actualizarElemento("POIs", idPOI, datosActualizados, 3)

        // Actualizar en el estado local
        setFavoritos(prev =>
            prev.map(f =>
                f.id === idPOI
                    ? { ...f, valoracion: poiActual.valoracion, valoracionPonderada: promedio }
                    : f
            )
        )
    }

    return (
        <div style={{ maxWidth: 600 }}>
            <h2>Mis Favoritos</h2>
            {mensaje && <p>{mensaje}</p>}

            {favoritos.length > 0 && (
                <ul>
                    {favoritos.map((poi, i) => {
                        let valorUsuario = 0
                        const token = localStorage.getItem("token") || "usuario-sin-token"
                        if (Array.isArray(poi.valoracion)) {
                            const existente = poi.valoracion.find(v => v.usuarioId === token)
                            if (existente) {
                                valorUsuario = existente.valor
                            }
                        } else if (typeof poi.rating === "number") {
                            valorUsuario = poi.rating
                        }

                        let promedio = 0
                        if (typeof poi.valoracionPonderada === "number") {
                            promedio = poi.valoracionPonderada
                        }

                        return (
                            <li key={`fav-${i}`} style={{ marginBottom: 20 }}>
                                <strong>{poi.nombre}</strong>
                                <p>{poi.descripcion}</p>

                                <div style={{ margin: "6px 0" }}>
                                    <Rating
                                        initialValue={valorUsuario}
                                        size={20}
                                        allowHalfIcon={true}
                                        onClick={(valor) => manejarCambioCalificacion(poi, valor)}
                                        fillColor="#33a810ff"
                                        emptyColor="#ccc"
                                    />
                                </div>

                                <p style={{ margin: "6px 0" }}>
                                    Valoración promedio: <strong>{promedio.toFixed(2)}</strong> 
                                </p>

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
                        )
                    })}
                </ul>
            )}
        </div>
    )
}

export default MisFavoritos
