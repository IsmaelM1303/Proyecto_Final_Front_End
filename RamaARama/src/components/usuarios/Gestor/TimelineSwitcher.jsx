import { useState } from "react"
import TimelinePreview from "./TimelinePreview"
import TimelineFull from "./TimelineFull"

/**
 * Componente TimelineSwitcher
 * Permite alternar entre la vista previa y la vista completa de la línea de tiempo.
 * Usa un botón para cambiar el modo y renderiza el componente correspondiente.
 */
function TimelineSwitcher({ eventos }) {
    // Estado para controlar si se muestra la vista completa
    const [full, setFull] = useState(false)

    return (
        <div style={{ width: "100%", height: "100%" }}>
            {/* Botón para alternar entre preview y pantalla completa */}
            <div style={{ marginBottom: "10px" }}>
                <button
                    onClick={function () { setFull(!full) }}
                    style={{
                        padding: "6px 12px",
                        background: "#4e770d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    {full ? "Volver al preview" : "Ver en pantalla completa"}
                </button>
            </div>

            {/* Renderiza la vista seleccionada */}
            <div style={{ width: "100%", height: full ? "100vh" : "400px" }}>
                {full ? (
                    <TimelineFull eventos={eventos} />
                ) : (
                    <TimelinePreview eventos={eventos} />
                )}
            </div>
        </div>
    )
}

export default TimelineSwitcher