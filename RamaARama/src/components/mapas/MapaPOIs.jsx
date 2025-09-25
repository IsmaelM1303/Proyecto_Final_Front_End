// src/components/MapaPOIs.jsx
import { Marker, Popup } from 'react-leaflet'

function MapaPOIs({ pois, iconoVerde }) {
    const hayPOIs = Array.isArray(pois) && pois.length > 0
    if (!hayPOIs) {
        return null
    }

    const marcadores = []

    for (let i = 0; i < pois.length; i++) {
        const poi = pois[i]

        let latitud = null
        let longitud = null

        const tieneUbicacion = poi && poi.ubicacion
        if (tieneUbicacion && typeof poi.ubicacion.lat === "number") {
            latitud = poi.ubicacion.lat
        }
        if (tieneUbicacion && typeof poi.ubicacion.lng === "number") {
            longitud = poi.ubicacion.lng
        }
        const coordenadasValidas = latitud !== null && longitud !== null
        if (!coordenadasValidas) {
            continue
        }

        let llaveMarcador = "poi-" + i
        const tieneId = poi && poi.id
        if (tieneId) {
            llaveMarcador = "poi-" + poi.id
        }

        const categorias = Array.isArray(poi.categorias) ? poi.categorias : []
        const redes = Array.isArray(poi.redes) ? poi.redes : []

        let nombrePOI = "POI"
        const tieneNombre = poi && poi.nombre
        if (tieneNombre) {
            nombrePOI = poi.nombre
        }

        let descripcionPOI = ""
        const tieneDescripcion = poi && poi.descripcion
        if (tieneDescripcion) {
            descripcionPOI = poi.descripcion
        }

        const listaCategorias = []
        for (let j = 0; j < categorias.length; j++) {
            const categoria = categorias[j]
            listaCategorias.push(<li key={"cat-" + i + "-" + j}>{categoria}</li>)
        }

        const listaRedes = []
        for (let r = 0; r < redes.length; r++) {
            const red = redes[r]
            let tipoRed = "Link"
            if (red && red.tipo) {
                tipoRed = red.tipo
            }
            let linkRed = ""
            if (red && red.link) {
                linkRed = red.link
            }

            const hayLink = Boolean(linkRed)
            if (hayLink) {
                listaRedes.push(
                    <li key={"red-" + i + "-" + r}>
                        {tipoRed}: <a href={linkRed} target="_blank" rel="noreferrer">{linkRed}</a>
                    </li>
                )
            } else {
                listaRedes.push(
                    <li key={"red-" + i + "-" + r}>
                        {tipoRed}: —
                    </li>
                )
            }
        }

        marcadores.push(
            <Marker key={llaveMarcador} position={[latitud, longitud]} icon={iconoVerde}>
                <Popup>
                    <div style={{ maxWidth: 260 }}>
                        <strong>{nombrePOI}</strong>

                        {descripcionPOI && (
                            <p style={{ margin: "6px 0" }}>{descripcionPOI}</p>
                        )}

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

    return <>{marcadores}</>
}

export default MapaPOIs