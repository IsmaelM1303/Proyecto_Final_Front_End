// src/components/MapaFiltros.jsx
import filtroIcon from "../../assets/Imgs/menu.png"

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
    let clasePanelFiltros = "panel-filtros cerrado"
    const estaAbierto = mostrarFiltros === true
    if (estaAbierto) {
        clasePanelFiltros = "panel-filtros abierto"
    }

    return (
        <div className="panel-filtros-wrapper">
            <img
                src={filtroIcon}
                alt="Mostrar filtros"
                className="filtro-icon"
                onClick={function () { setMostrarFiltros(!mostrarFiltros) }}
                style={{ cursor: "pointer", width: 40, height: 40 }}
            />

            <div className={clasePanelFiltros}>
                <div className="panel-filtros-controls">
                    <button onClick={mostrarProvincias} disabled={cargandoDivisiones}>
                        Mostrar Provincias
                    </button>

                    {mostrarSelectCantones === false && (
                        <button onClick={activarCantones} disabled={cargandoDivisiones}>
                            Mostrar Cantones
                        </button>
                    )}

                    {mostrarSelectCantones === true && (
                        <select
                            value={provinciaSeleccionada}
                            onChange={function (e) { mostrarCantonesProvincia(e.target.value) }}
                            disabled={cargandoDivisiones}
                        >
                            <option value="">-- Selecciona una provincia --</option>
                            {provincias.map(function (p) {
                                return (
                                    <option key={p.codigo} value={p.codigo}>
                                        {p.nombre}
                                    </option>
                                )
                            })}
                        </select>
                    )}

                    <button onClick={limpiar} disabled={cargandoDivisiones}>
                        Limpiar
                    </button>

                    {cargandoDivisiones && (
                        <span style={{ marginLeft: 12 }}>Cargando divisiones…</span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MapaFiltros
