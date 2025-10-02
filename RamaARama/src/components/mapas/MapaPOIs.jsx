import { Marker, Popup } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import { Rating } from 'react-simple-star-rating'
import { useState } from 'react'
import { actualizarElemento, obtenerElementos } from '../../api/Crud'

/**
 * Componente MarcadorPOI
 * Renderiza un marcador en el mapa para un punto de interés (POI).
 * El popup muestra información relevante del POI, permite calificarlo y navegar a su detalle.
 * La calificación se guarda y actualiza el promedio en la base de datos simulada.
 */
function MarcadorPOI({ poi, indice, iconoVerde }) {
    const navegar = useNavigate()

    // Estado para la valoración promedio del POI
    const [valoracionPromedio, setValoracionPromedio] = useState(
        typeof poi.valoracionPonderada === "number" ? poi.valoracionPonderada : 0
    )

    // Estado para la valoración del usuario actual
    const [valorUsuario, setValorUsuario] = useState(() => {
        if (Array.isArray(poi.valoracion)) {
            const token = localStorage.getItem("token") || "usuario-sin-token"
            const existente = poi.valoracion.find(v => v.usuarioId === token)
            if (existente) {
                return existente.valor
            }
        }
        if (typeof poi.rating === "number") {
            return poi.rating
        }
        return 0
    })

    // Maneja el clic en el popup para navegar al detalle del POI
    const manejarClickPopup = (evento) => {
        if (evento.target.tagName.toLowerCase() === "a") {
            return
        }
        localStorage.setItem("selectedPOI", JSON.stringify(poi))
        navegar("/EstePOI")
    }

    // Normaliza el valor de la calificación a escala de estrellas
    const normalizarAEstrellas = (valor) => {
        if (valor > 5) {
            return valor / 20
        }
        return valor
    }

    // Maneja el cambio de calificación por parte del usuario
    const manejarCambioCalificacion = async (valorCrudo) => {
        const token = localStorage.getItem("token") || "usuario-sin-token"
        const idPOI = poi.id || indice
        const valorNormalizado = normalizarAEstrellas(valorCrudo)

        // Obtiene el POI actual desde la base simulada
        const todosPOIs = await obtenerElementos("POIs", 3)
        const poiActual = todosPOIs.find(p => p.id === idPOI)
        if (!poiActual) {
            return
        }

        // Actualiza o agrega la valoración del usuario
        if (!Array.isArray(poiActual.valoracion)) {
            poiActual.valoracion = []
        }
        const indiceExistente = poiActual.valoracion.findIndex(v => v.usuarioId === token)
        if (indiceExistente >= 0) {
            poiActual.valoracion[indiceExistente].valor = valorNormalizado
        } else {
            poiActual.valoracion.push({ usuarioId: token, valor: valorNormalizado })
        }

        // Calcula el promedio de valoraciones
        let suma = 0
        for (let k = 0; k < poiActual.valoracion.length; k++) {
            suma += poiActual.valoracion[k].valor
        }
        const promedio = suma / poiActual.valoracion.length

        // Actualiza el POI en la base simulada
        const datosActualizados = {
            valoracion: poiActual.valoracion,
            valoracionPonderada: promedio
        }
        await actualizarElemento("POIs", idPOI, datosActualizados, 3)

        setValorUsuario(valorNormalizado)
        setValoracionPromedio(promedio)
    }

    // Listas de categorías y redes sociales del POI
    const categorias = Array.isArray(poi.categorias) ? poi.categorias : []
    const redes = Array.isArray(poi.redes) ? poi.redes : []

    // Renderiza la lista de categorías
    const listaCategorias = categorias.map((cat, j) => (
        <li key={`cat-${indice}-${j}`}>{cat}</li>
    ))

    // Renderiza la lista de redes sociales
    const listaRedes = redes.map((red, r) => {
        let tipoRed = red && red.tipo ? red.tipo : "Link"
        let enlaceRed = red && red.link ? red.link : ""
        if (enlaceRed !== "") {
            return (
                <li key={`red-${indice}-${r}`}>
                    {tipoRed}:{" "}
                    <a
                        href={enlaceRed}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {enlaceRed}
                    </a>
                </li>
            )
        }
        return <li key={`red-${indice}-${r}`}>{tipoRed}: —</li>
    })

    return (
        <Marker key={"poi-" + (poi.id || indice)} position={[poi.ubicacion.lat, poi.ubicacion.lng]} icon={iconoVerde}>
            <Popup>
                <div style={{ maxWidth: 260, cursor: "pointer" }} onClick={manejarClickPopup}>
                    <strong>{poi.nombre || "POI"}</strong>

                    {poi.descripcion && <p style={{ margin: "6px 0" }}>{poi.descripcion}</p>}

                    {/* Componente de valoración por estrellas */}
                    <div style={{ margin: "6px 0" }} onClick={(e) => e.stopPropagation()}>
                        <Rating
                            initialValue={valorUsuario}
                            size={20}
                            allowHalfIcon={true}
                            onClick={manejarCambioCalificacion}
                            fillColor="#33a810ff"
                            emptyColor="#ccc"
                        />
                    </div>

                    {/* Valoración promedio */}
                    <p style={{ margin: "6px 0" }}>
                        Valoración promedio: <strong>{valoracionPromedio.toFixed(2)}</strong> 
                    </p>

                    {/* Listado de categorías */}
                    {listaCategorias.length > 0 && (
                        <div style={{ marginTop: 6 }}>
                            <span style={{ fontWeight: 600 }}>Categorías:</span>
                            <ul style={{ paddingLeft: 16, margin: "4px 0" }}>
                                {listaCategorias}
                            </ul>
                        </div>
                    )}

                    {/* Listado de redes sociales */}
                    {listaRedes.length > 0 && (
                        <div style={{ marginTop: 6 }}>
                            <span style={{ fontWeight: 600 }}>Redes:</span>
                            <ul style={{ paddingLeft: 16, margin: "4px 0" }}>
                                {listaRedes}
                            </ul>
                        </div>
                    )}
                </div>
            </Popup>
        </Marker>
    )
}

/**
 * Componente MapaPOIs
 * Renderiza todos los POIs como marcadores en el mapa.
 * Solo renderiza marcadores para POIs con ubicación válida.
 */
function MapaPOIs({ pois, iconoVerde }) {
    if (!Array.isArray(pois) || pois.length === 0) {
        return null
    }

    return (
        <>
            {pois.map((poi, indice) => {
                if (!poi || !poi.ubicacion || typeof poi.ubicacion.lat !== "number" || typeof poi.ubicacion.lng !== "number") {
                    return null
                }
                return <MarcadorPOI key={poi.id || indice} poi={poi} indice={indice} iconoVerde={iconoVerde} />
            })}
        </>
    )
}

export default MapaPOIs