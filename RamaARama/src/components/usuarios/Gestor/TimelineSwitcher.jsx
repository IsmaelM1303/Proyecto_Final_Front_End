import { useState } from "react"
import TimelinePreview from "./TimelinePreview"
import TimelineFull from "./TimelineFull"

function TimelineSwitcher({ eventos }) {
    const [full, setFull] = useState(false)

    return (
        <div style={{ width: "100%", height: "100%" }}>
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
