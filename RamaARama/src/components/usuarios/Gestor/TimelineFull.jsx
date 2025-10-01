import { useEffect, useRef } from "react"
import "../../../styles/Timeline/TimelinePreview.css"

function ensureTimelineCss() {
    const href = "https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css"
    if ([...document.getElementsByTagName("link")].some(l => l.href === href)) {
        return Promise.resolve()
    }
    return new Promise(resolve => {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = href
        link.onload = resolve
        document.head.appendChild(link)
    })
}

function ensureTimelineScript() {
    const src = "https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js"
    if (window.TL && window.TL.Timeline) return Promise.resolve()
    if ([...document.getElementsByTagName("script")].some(s => s.src === src)) {
        return new Promise(resolve => {
            const wait = () => {
                if (window.TL && window.TL.Timeline) resolve()
                else setTimeout(wait, 50)
            }
            wait()
        })
    }
    return new Promise(resolve => {
        const script = document.createElement("script")
        script.src = src
        script.async = true
        script.onload = resolve
        document.body.appendChild(script)
    })
}

function normalizeUrl(url) {
    if (!url) return ""
    const clean = url.replace(/^https?:\/\//, "")
    return "https://images.weserv.nl/?url=" + encodeURIComponent(clean)
}

function sanitizeEventos(eventos) {
    const out = []
    if (!Array.isArray(eventos)) return out
    for (let i = 0; i < eventos.length; i++) {
        const ev = eventos[i]
        if (!ev) continue
        const start = {}
        if (ev.start_date && ev.start_date.year) start.year = Number(ev.start_date.year)
        if (ev.start_date && ev.start_date.month) start.month = Number(ev.start_date.month)
        if (ev.start_date && ev.start_date.day) start.day = Number(ev.start_date.day)
        if (!start.year) continue
        const text = {
            headline: ev.text && ev.text.headline ? String(ev.text.headline) : "",
            text: ev.text && ev.text.text ? String(ev.text.text) : ""
        }
        let media = null
        if (ev.media && ev.media.url) {
            media = {
                url: normalizeUrl(ev.media.url),
                caption: ev.media.caption ? String(ev.media.caption) : "",
                credit: ev.media.credit ? String(ev.media.credit) : ""
            }
        }
        let end = null
        if (ev.end_date && ev.end_date.year) {
            end = {
                year: Number(ev.end_date.year),
                month: ev.end_date.month ? Number(ev.end_date.month) : undefined,
                day: ev.end_date.day ? Number(ev.end_date.day) : undefined
            }
        }
        const evento = { start_date: start, text }
        if (media) evento.media = media
        if (end) evento.end_date = end
        out.push(evento)
    }
    return out
}

function TimelineFull({ eventos }) {
    const contenedorRef = useRef(null)

    useEffect(() => {
        const container = contenedorRef.current
        if (!container) return
        if (!Array.isArray(eventos) || eventos.length === 0) {
            container.innerHTML = "No hay eventos válidos"
            return
        }
        const sane = sanitizeEventos(eventos)
        if (sane.length === 0) {
            container.innerHTML = "No hay eventos válidos"
            return
        }
        const data = {
            title: { text: { headline: "Línea de tiempo completa", text: "" } },
            events: sane
        }
        const init = () => {
            container.innerHTML = ""
            if (window.TL && window.TL.Timeline) {
                new window.TL.Timeline(container, data, {
                    timenav_position: "bottom",
                    timenav_height_percentage: 25,
                    initial_zoom: 3,
                    scale_factor: 1,
                    locale: "es",
                    hash_bookmark: false
                })
            }
        }
        ensureTimelineCss().then(ensureTimelineScript).then(init)
    }, [eventos])

    return <div ref={contenedorRef} style={{ width: "100%", height: "100vh" }} />
}

export default TimelineFull
