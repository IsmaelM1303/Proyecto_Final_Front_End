import { useEffect, useRef } from "react"
import "../../styles/Mapas/MapaFiltros.css"

function MapaFiltros({
    mostrarProvincias,
    activarCantones,
    mostrarCantonesProvincia,
    limpiar,
    cargandoDivisiones,
    mostrarSelectCantones,
    provinciaSeleccionada,
    provincias,
    mostrarFiltros,
    setMostrarFiltros
}) {
    const wrapperRef = useRef(null)

    // Cerrar menú si se hace click fuera
    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setMostrarFiltros(false)
            }
        }
        if (mostrarFiltros) {
            document.addEventListener("mousedown", handleClickOutside)
        } else {
            document.removeEventListener("mousedown", handleClickOutside)
        }
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [mostrarFiltros, setMostrarFiltros])

    return (
        <div className="panel-filtros-wrapper" ref={wrapperRef}>
            {/* Contenedor común: hamburguesa y menú se superponen */}
            <div className="menu-container">
                <div
                    className={`filtro-icon ${mostrarFiltros ? "oculto" : ""}`}
                    onClick={() => setMostrarFiltros(true)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <div className={`panel-filtros ${mostrarFiltros ? "abierto" : ""}`}>
                    <div className="panel-filtros-controls">
                        <button onClick={mostrarProvincias} disabled={cargandoDivisiones}>
                            Provincias
                        </button>

                        {!mostrarSelectCantones && (
                            <button onClick={activarCantones} disabled={cargandoDivisiones}>
                                Cantones
                            </button>
                        )}

                        {mostrarSelectCantones && (
                            <select
                                value={provinciaSeleccionada}
                                onChange={(e) => mostrarCantonesProvincia(e.target.value)}
                                disabled={cargandoDivisiones}
                            >
                                <option value="">-- Provincia --</option>
                                {provincias.map((p) => (
                                    <option key={p.codigo} value={p.codigo}>
                                        {p.nombre}
                                    </option>
                                ))}
                            </select>
                        )}

                        <button onClick={limpiar} disabled={cargandoDivisiones}>
                            Limpiar
                        </button>

                        {cargandoDivisiones && (
                            <span className="cargando-texto">Cargando…</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MapaFiltros
