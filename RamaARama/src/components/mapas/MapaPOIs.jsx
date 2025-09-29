// src/components/MapaPOIs.jsx
import { Marker, Popup } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import { Rating } from 'react-simple-star-rating'
import { useState } from 'react'
import { actualizarElemento, obtenerElementos } from '../../api/Crud'

function MarcadorPOI({ poi, indice, iconoVerde }) {
    const navegar = useNavigate()

    const [valoracionPromedio, setValoracionPromedio] = useState(
        typeof poi.valoracionPonderada === "number" ? poi.valoracionPonderada : 0
    )

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

    const manejarClickPopup = (evento) => {
        if (evento.target.tagName.toLowerCase() === "a") {
            return
        }
        localStorage.setItem("selectedPOI", JSON.stringify(poi))
        navegar("/EstePOI")
    }

    const normalizarAEstrellas = (valor) => {
        if (valor > 5) {
            return valor / 20
        }
        return valor
    }

    const manejarCambioCalificacion = async (valorCrudo) => {
        const token = localStorage.getItem("token") || "usuario-sin-token"
        const idPOI = poi.id || indice
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

        setValorUsuario(valorNormalizado)
        setValoracionPromedio(promedio)
    }

    const categorias = Array.isArray(poi.categorias) ? poi.categorias : []
    const redes = Array.isArray(poi.redes) ? poi.redes : []

    const listaCategorias = categorias.map((cat, j) => (
        <li key={`cat-${indice}-${j}`}>{cat}</li>
    ))

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

                    <div style={{ margin: "6px 0" }} onClick={(e) => e.stopPropagation()}>
                        <Rating
                            initialValue={valorUsuario}
                            size={20}
                            allowHalfIcon={true}
                            onClick={manejarCambioCalificacion}
                            fillColor="#ffd700"
                            emptyColor="#ccc"
                        />
                    </div>

                    <p style={{ margin: "6px 0" }}>
                        Valoración promedio: <strong>{valoracionPromedio.toFixed(2)}</strong> ⭐
                    </p>

                    {listaCategorias.length > 0 && (
                        <div style={{ marginTop: 6 }}>
                            <span style={{ fontWeight: 600 }}>Categorías:</span>
                            <ul style={{ paddingLeft: 16, margin: "4px 0" }}>
                                {listaCategorias}
                            </ul>
                        </div>
                    )}

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
