import { useState, useEffect } from "react"
import { Rating } from "react-simple-star-rating"
import { actualizarElemento, obtenerElementos } from "../../api/Crud"
import TimelineSwitcher from "./Gestor/TimelineSwitcher"

function VerPOIsTurista() {
    const [poi, setPoi] = useState(null)
    const [mensaje, setMensaje] = useState("")
    const [esFavorito, setEsFavorito] = useState(false)
    const [valoracionPromedio, setValoracionPromedio] = useState(0)
    const [valorUsuario, setValorUsuario] = useState(0)

    useEffect(() => {
        const stored = localStorage.getItem("selectedPOI")
        if (stored) {
            const poiGuardado = JSON.parse(stored)
            setPoi(poiGuardado)

            if (typeof poiGuardado.valoracionPonderada === "number") {
                setValoracionPromedio(poiGuardado.valoracionPonderada)
            }

            if (Array.isArray(poiGuardado.valoracion)) {
                const token = localStorage.getItem("token") || "usuario-sin-token"
                const existente = poiGuardado.valoracion.find(v => v.usuarioId === token)
                if (existente) {
                    setValorUsuario(existente.valor)
                }
            } else if (typeof poiGuardado.rating === "number") {
                setValorUsuario(poiGuardado.rating)
            }
        }
    }, [])

    useEffect(() => {
        async function verificarFavorito() {
            if (!poi) return
            const tokenUsuario = localStorage.getItem("token")
            if (!tokenUsuario) return
            const usuarios = await obtenerElementos("usuarios", 1)
            const usuario = usuarios.find(u => String(u.id) === String(tokenUsuario))
            if (!usuario) return
            setEsFavorito(Array.isArray(usuario.favoritos) && usuario.favoritos.includes(poi.id))
        }
        verificarFavorito()
    }, [poi])

    if (!poi) {
        return <p>No hay POI seleccionado</p>
    }

    const normalizarAEstrellas = (valor) => (valor > 5 ? valor / 20 : valor)

    const manejarCambioCalificacion = async (valorCrudo) => {
        const token = localStorage.getItem("token") || "usuario-sin-token"
        const idPOI = poi.id
        const valorNormalizado = normalizarAEstrellas(valorCrudo)

        const todosPOIs = await obtenerElementos("POIs", 3)
        const poiActual = todosPOIs.find(p => p.id === idPOI)
        if (!poiActual) return

        if (!Array.isArray(poiActual.valoracion)) {
            poiActual.valoracion = []
        }

        const indiceExistente = poiActual.valoracion.findIndex(v => v.usuarioId === token)
        if (indiceExistente >= 0) {
            poiActual.valoracion[indiceExistente].valor = valorNormalizado
        } else {
            poiActual.valoracion.push({ usuarioId: token, valor: valorNormalizado })
        }

        const suma = poiActual.valoracion.reduce((acc, v) => acc + v.valor, 0)
        const promedio = suma / poiActual.valoracion.length

        const datosActualizados = {
            valoracion: poiActual.valoracion,
            valoracionPonderada: promedio
        }

        await actualizarElemento("POIs", idPOI, datosActualizados, 3)

        setValorUsuario(valorNormalizado)
        setValoracionPromedio(promedio)
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
            let favoritosActualizados = Array.isArray(usuario.favoritos) ? [...usuario.favoritos] : []
            if (esFavorito) {
                favoritosActualizados = favoritosActualizados.filter(id => id !== poi.id)
                await actualizarElemento("usuarios", usuario.id, { favoritos: favoritosActualizados }, 1)
                setEsFavorito(false)
                setMensaje("Removido de favoritos ✅")
            } else {
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

            <div style={{ margin: "6px 0" }}>
                <Rating
                    initialValue={valorUsuario}
                    size={24}
                    allowHalfIcon={true}
                    onClick={manejarCambioCalificacion}
                    fillColor="#33a810ff"
                    emptyColor="#ccc"
                />
            </div>

            <p style={{ margin: "6px 0" }}>
                Valoración promedio: <strong>{valoracionPromedio.toFixed(2)}</strong>
            </p>

            {Array.isArray(poi.categorias) && poi.categorias.length > 0 && (
                <div>
                    <h4>Categorías:</h4>
                    <ul>
                        {poi.categorias.map((cat, i) => (
                            <li key={`cat-${i}`}>{cat}</li>
                        ))}
                    </ul>
                </div>
            )}

            {Array.isArray(poi.redes) && poi.redes.length > 0 && (
                <div>
                    <h4>Redes:</h4>
                    <ul>
                        {poi.redes.map((red, i) => (
                            <li key={`red-${i}`}>
                                {red.tipo || "Link"}:{" "}
                                {red.link ? (
                                    <a href={red.link} target="_blank" rel="noreferrer">
                                        {red.link}
                                    </a>
                                ) : (
                                    "—"
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button onClick={handleToggleFavorito} style={{ marginTop: 12 }}>
                {esFavorito ? "Remover de favoritos" : "Añadir a favoritos"}
            </button>

            {mensaje && <p>{mensaje}</p>}

            {Array.isArray(poi.lineaTiempo) && poi.lineaTiempo.length > 0 && (
                <div style={{ marginTop: 16 }}>
                    <h4>Línea de tiempo</h4>
                    <TimelineSwitcher eventos={poi.lineaTiempo} />
                </div>
            )}
        </div>
    )
}

export default VerPOIsTurista
