import { useEffect, useRef } from "react"
import "../../styles/Mapas/MapaFiltros.css"

/**
 * Componente MapaFiltros
 * Panel flotante que permite filtrar la visualización del mapa por provincias y cantones.
 * Incluye controles para mostrar provincias, activar filtro de cantones, seleccionar provincia, limpiar filtros y mostrar estado de carga.
 * El panel se muestra/oculta mediante un icono tipo hamburguesa y se cierra automáticamente al hacer clic fuera.
 */
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
    // Referencia al contenedor para detectar clics fuera del panel
    const wrapperRef = useRef(null)

    // Efecto para cerrar el panel si el usuario hace clic fuera de él
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
            {/* Contenedor principal: incluye icono hamburguesa y panel de filtros */}
            <div className="menu-container">
                {/* Icono hamburguesa para abrir el panel */}
                <div
                    className={`filtro-icon ${mostrarFiltros ? "oculto" : ""}`}
                    onClick={() => setMostrarFiltros(true)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                {/* Panel lateral de filtros */}
                <div className={`panel-filtros ${mostrarFiltros ? "abierto" : ""}`}>
                    <div className="panel-filtros-controls">
                        {/* Botón para mostrar provincias */}
                        <button onClick={mostrarProvincias} disabled={cargandoDivisiones}>
                            Provincias
                        </button>

                        {/* Botón para activar filtro de cantones */}
                        {!mostrarSelectCantones && (
                            <button onClick={activarCantones} disabled={cargandoDivisiones}>
                                Cantones
                            </button>
                        )}

                        {/* Select para elegir provincia y mostrar sus cantones */}
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

                        {/* Botón para limpiar filtros */}
                        <button onClick={limpiar} disabled={cargandoDivisiones}>
                            Limpiar
                        </button>

                        {/* Indicador de carga */}
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