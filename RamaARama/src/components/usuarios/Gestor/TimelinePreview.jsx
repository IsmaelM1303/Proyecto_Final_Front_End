import { useEffect, useRef } from "react"

function TimelinePreview({ eventos }) {
    const contenedorRef = useRef(null)

    useEffect(() => {
        const eventosValidos = (Array.isArray(eventos) ? eventos : []).filter(e => {
            const year = e.start_date && Number(e.start_date.year)
            return !isNaN(year) && year > 0
        })

        if (eventosValidos.length === 0) {
            return
        }

        const script = document.createElement("script")
        script.src = "https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js"
        script.async = true

        script.onload = () => {
            if (contenedorRef.current && window.TL) {
                new window.TL.Timeline(
                    contenedorRef.current,
                    { events: eventosValidos },
                    {
                        timenav_position: "left",
                        timenav_height_percentage: 20,   
                        optimal_tick_width: 80,          
                        initial_zoom: 2, 
                        scale_factor: 1,
                        hash_bookmark: false             
                    }
                )
            }
        }

        document.body.appendChild(script)

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script)
            }
        }
    }, [eventos])

    return <div ref={contenedorRef} />
}

export default TimelinePreview
