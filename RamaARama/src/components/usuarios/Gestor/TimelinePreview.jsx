import { useEffect, useRef, useState } from "react"
import "../../../styles/Timeline/TimelinePreview.css"

/**
 * Carga el CSS de TimelineJS si no está presente en el documento.
 * Devuelve una promesa que se resuelve cuando el CSS está cargado.
 */
function ensureTimelineCss() {
    const href = "https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css"
    const links = document.getElementsByTagName("link")
    let exists = false
    for (let i = 0; i < links.length; i++) {
        const l = links[i]
        if (l.getAttribute("href") === href) {
            exists = true
            break
        }
    }
    if (exists) {
        return Promise.resolve()
    }
    return new Promise(function (resolve) {
        const link = document.createElement("link")
        link.setAttribute("rel", "stylesheet")
        link.setAttribute("href", href)
        link.onload = function () {
            resolve()
        }
        document.head.appendChild(link)
    })
}

/**
 * Carga el script de TimelineJS si no está presente en el documento.
 * Devuelve una promesa que se resuelve cuando la librería está lista.
 */
function ensureTimelineScript() {
    const src = "https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js"
    if (window.TL && window.TL.Timeline) {
        return Promise.resolve()
    }
    const scripts = document.getElementsByTagName("script")
    let exists = false
    for (let i = 0; i < scripts.length; i++) {
        const s = scripts[i]
        if (s.getAttribute("src") === src) {
            exists = true
            break
        }
    }
    if (exists) {
        return new Promise(function (resolve) {
            const wait = function () {
                if (window.TL && window.TL.Timeline) {
                    resolve()
                } else {
                    setTimeout(wait, 50)
                }
            }
            wait()
        })
    }
    return new Promise(function (resolve) {
        const script = document.createElement("script")
        script.setAttribute("src", src)
        script.async = true
        script.onload = function () {
            resolve()
        }
        document.body.appendChild(script)
    })
}

/**
 * Normaliza la URL y la pasa por proxy para evitar problemas con espacios.
 */
function normalizeUrl(url) {
    if (!url) {
        return ""
    }
    const clean = url.replace(/^https?:\/\//, "")
    const safe = "https://images.weserv.nl/?url=" + encodeURIComponent(clean)
    return safe
}

/**
 * Sanitiza y normaliza los eventos para TimelineJS.
 * Convierte fechas, textos y media a formato compatible.
 */
function sanitizeEventos(eventos) {
    const out = []
    if (!eventos) {
        return out
    }
    if (!Array.isArray(eventos)) {
        return out
    }

    for (let i = 0; i < eventos.length; i++) {
        const ev = eventos[i]
        if (!ev) {
            continue
        }

        const start = {}
        if (ev.start_date && ev.start_date.year) {
            const y = Number(ev.start_date.year)
            if (Number.isFinite(y)) {
                start.year = y
            }
        }
        if (ev.start_date && ev.start_date.month) {
            const m = Number(ev.start_date.month)
            if (Number.isFinite(m)) {
                start.month = m
            }
        }
        if (ev.start_date && ev.start_date.day) {
            const d = Number(ev.start_date.day)
            if (Number.isFinite(d)) {
                start.day = d
            }
        }
        if (!start.year) {
            continue
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
            media = {}
            media.url = normalizeUrl(ev.media.url)
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

        let end = null
        if (ev.end_date) {
            end = {}
            if (ev.end_date.year) {
                const ey = Number(ev.end_date.year)
                if (Number.isFinite(ey)) {
                    end.year = ey
                }
            }
            if (ev.end_date.month) {
                const em = Number(ev.end_date.month)
                if (Number.isFinite(em)) {
                    end.month = em
                }
            }
            if (ev.end_date.day) {
                const ed = Number(ev.end_date.day)
                if (Number.isFinite(ed)) {
                    end.day = ed
                }
            }
            if (!end.year) {
                end = null
            }
        }

        const evento = {}
        evento.start_date = start
        evento.text = text
        if (media) {
            evento.media = media
        }
        if (end) {
            evento.end_date = end
        }

        out.push(evento)
    }

    return out
}

/**
 * Componente TimelinePreview
 * Renderiza una previsualización de la línea de tiempo usando TimelineJS.
 * Permite abrir la línea de tiempo en pantalla completa al hacer clic en una imagen.
 */
function TimelinePreview({ eventos }) {
    const contenedorRef = useRef(null)
    const [showFull, setShowFull] = useState(false)

    // Renderiza la previsualización de la línea de tiempo
    useEffect(function () {
        const container = contenedorRef.current
        if (!container) {
            return
        }
        if (!eventos || !Array.isArray(eventos) || eventos.length === 0) {
            container.innerHTML = ""
            return
        }

        const sane = sanitizeEventos(eventos)
        if (sane.length === 0) {
            container.innerHTML = ""
            const empty = document.createElement("div")
            empty.textContent = "No hay eventos válidos"
            empty.style.padding = "8px"
            container.appendChild(empty)
            return
        }

        const data = {
            title: { text: { headline: "Línea de tiempo", text: "" } },
            events: sane
        }

        const init = function () {
            container.innerHTML = ""
            if (window.TL && window.TL.Timeline) {
                new window.TL.Timeline(container, data, {
                    timenav_position: "bottom",
                    timenav_height_percentage: 15,
                    initial_zoom: 2,
                    scale_factor: 1,
                    locale: "es",
                    hash_bookmark: false
                })
                setTimeout(function () {
                    const imgs = container.querySelectorAll(".tl-media img")
                    for (let i = 0; i < imgs.length; i++) {
                        const img = imgs[i]
                        img.style.cursor = "zoom-in"
                        img.addEventListener("click", function () {
                            setShowFull(true)
                        })
                    }
                }, 500)
            } else {
                const msg = document.createElement("div")
                msg.textContent = "TimelineJS no cargó"
                msg.style.padding = "8px"
                container.appendChild(msg)
            }
        }

        ensureTimelineCss()
            .then(function () {
                return ensureTimelineScript()
            })
            .then(function () {
                init()
            })

        return function cleanup() {
            if (contenedorRef.current) {
                contenedorRef.current.innerHTML = ""
            }
        }
    }, [eventos])

    // Renderiza la línea de tiempo en pantalla completa si se activa
    useEffect(function () {
        if (!showFull) {
            return
        }
        if (!eventos || !Array.isArray(eventos) || eventos.length === 0) {
            return
        }

        const sane = sanitizeEventos(eventos)
        if (sane.length === 0) {
            return
        }

        const data = {
            title: { text: { headline: "Línea de tiempo completa", text: "" } },
            events: sane
        }

        const initFull = function () {
            const container = document.getElementById("timeline-full")
            if (!container) {
                return
            }
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

        ensureTimelineCss()
            .then(function () {
                return ensureTimelineScript()
            })
            .then(function () {
                initFull()
            })
    }, [showFull, eventos])

    // Render principal del componente
    return (
        <div className="contenedor-linea-tiempo">
            <div ref={contenedorRef} className="caja-linea-tiempo"></div>

            {/* Modal para pantalla completa */}
            {showFull && (
                <div className="timeline-modal" onClick={function () { setShowFull(false) }}>
                    <div className="timeline-modal-content" onClick={function (e) { e.stopPropagation() }}>
                        <div id="timeline-full" style={{ width: "100%", height: "100%" }}></div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TimelinePreview