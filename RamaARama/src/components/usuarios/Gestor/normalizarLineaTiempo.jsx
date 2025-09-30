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

            const text = {}
            if (ev.text && ev.text.headline) {
                text.headline = String(ev.text.headline)
            } else {
                text.headline = ""
            }
            if (ev.text && ev.text.text) {
                text.text = String(ev.text.text)
            } else {
                text.text = ""
            }

            let media = null
            if (ev.media && ev.media.url) {
                // 🔑 Pasamos la URL por el proxy de imágenes
                const safeUrl =
                    "https://images.weserv.nl/?url=" +
                    encodeURIComponent(ev.media.url.replace(/^https?:\/\//, ""))

                media = {}
                media.url = safeUrl
                if (ev.media.caption) {
                    media.caption = String(ev.media.caption)
                } else {
                    media.caption = ""
                }
                if (ev.media.credit) {
                    media.credit = String(ev.media.credit)
                } else {
                    media.credit = ""
                }
            }

            if (!start.year) {
                continue
            }

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
