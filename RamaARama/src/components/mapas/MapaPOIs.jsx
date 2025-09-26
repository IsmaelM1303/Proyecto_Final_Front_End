// src/components/MapaPOIs.jsx
import { Marker, Popup } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'

function MapaPOIs({ pois, iconoVerde }) {
    const navigate = useNavigate()

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

        let llaveMarcador = "poi-" + (poi.id || i)

        const categorias = Array.isArray(poi.categorias) ? poi.categorias : []
        const redes = Array.isArray(poi.redes) ? poi.redes : []

        const nombrePOI = poi?.nombre || "POI"
        const descripcionPOI = poi?.descripcion || ""

        const listaCategorias = categorias.map((categoria, j) => (
            <li key={`cat-${i}-${j}`}>{categoria}</li>
        ))

        const listaRedes = redes.map((red, r) => {
            const tipoRed = red?.tipo || "Link"
            const linkRed = red?.link || ""
            return (
                <li key={`red-${i}-${r}`}>
                    {tipoRed}:{" "}
                    {linkRed ? (
                        <a
                            href={linkRed}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()} // 🔑 evita navegar al /EstePOI
                        >
                            {linkRed}
                        </a>
                    ) : (
                        "—"
                    )}
                </li>
            )
        })

        // 🔑 Handler para click en el popup
        const handlePopupClick = (e) => {
            // Si el click fue en un <a>, no navegamos al detalle
            if (e.target.tagName.toLowerCase() === "a") {
                return
            }
            localStorage.setItem("selectedPOI", JSON.stringify(poi))
            navigate("/EstePOI")
        }

        marcadores.push(
            <Marker key={llaveMarcador} position={[latitud, longitud]} icon={iconoVerde}>
                <Popup>
                    <div
                        style={{ maxWidth: 260, cursor: "pointer" }}
                        onClick={handlePopupClick}
                    >
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
