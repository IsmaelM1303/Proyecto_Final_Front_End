/**
 * Función normalizarLineaTiempo
 * Recibe un arreglo de POIs y extrae todos los eventos de línea de tiempo.
 * Para cada evento, normaliza las fechas de inicio y fin, el texto (headline y body), y la media (imagen, caption, credit).
 * Las URLs de imágenes se pasan por un proxy para evitar problemas de carga.
 * Solo agrega eventos con año de inicio válido.
 * Devuelve un arreglo de eventos normalizados, listo para ser usado por TimelineJS.
 */
export default function normalizarLineaTiempo(pois) {
    if (!Array.isArray(pois)) {
        return []
    }

    const eventos = []

    for (let i = 0; i < pois.length; i++) {
        const poi = pois[i]
        if (!poi.lineaTiempo) {
            continue
        }
        if (!Array.isArray(poi.lineaTiempo)) {
            continue
        }

        for (let j = 0; j < poi.lineaTiempo.length; j++) {
            const ev = poi.lineaTiempo[j]

            // Normaliza la fecha de inicio
            const start = {}
            if (ev.start_date && ev.start_date.year) {
                start.year = Number(ev.start_date.year)
            }
            if (ev.start_date && ev.start_date.month) {
                start.month = Number(ev.start_date.month)
            }
            if (ev.start_date && ev.start_date.day) {
                start.day = Number(ev.start_date.day)
            }

            // Normaliza la fecha de fin (opcional)
            let end = null
            if (ev.end_date) {
                end = {}
                if (ev.end_date.year) {
                    end.year = Number(ev.end_date.year)
                }
                if (ev.end_date.month) {
                    end.month = Number(ev.end_date.month)
                }
                if (ev.end_date.day) {
                    end.day = Number(ev.end_date.day)
                }
            }

            // Normaliza el texto del evento
            const text = {}
            text.headline = ev.text && ev.text.headline ? String(ev.text.headline) : ""
            text.text = ev.text && ev.text.text ? String(ev.text.text) : ""

            // Normaliza la media (imagen) y pasa la URL por proxy
            let media = null
            if (ev.media && ev.media.url) {
                const safeUrl =
                    "https://images.weserv.nl/?url=" +
                    encodeURIComponent(ev.media.url.replace(/^https?:\/\//, ""))
                media = {
                    url: safeUrl,
                    caption: ev.media.caption ? String(ev.media.caption) : "",
                    credit: ev.media.credit ? String(ev.media.credit) : ""
                }
            }

            // Solo agrega eventos con año de inicio válido
            if (!start.year) {
                continue
            }

            // Construye el objeto evento normalizado
            const evento = {}
            evento.start_date = start
            evento.text = text
            if (end) {
                evento.end_date = end
            }
            if (media) {
                evento.media = media
            }

            eventos.push(evento)
        }
    }

    return eventos
}