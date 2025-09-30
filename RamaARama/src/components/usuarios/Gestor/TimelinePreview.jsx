// TimelinePreview.jsx
import { useEffect, useRef } from "react"
import "../../../styles/Timeline/TimelinePreview.css"

function ensureTimelineCss() {
    var href = "https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css"
    var links = document.getElementsByTagName("link")
    var exists = false
    for (var i = 0; i < links.length; i++) {
        var l = links[i]
        if (l.getAttribute("href") === href) {
            exists = true
            break
        }
    }
    if (exists) {
        return Promise.resolve()
    }
    return new Promise(function (resolve) {
        var link = document.createElement("link")
        link.setAttribute("rel", "stylesheet")
        link.setAttribute("href", href)
        link.onload = function () {
            resolve()
        }
        document.head.appendChild(link)
    })
}

function ensureTimelineScript() {
    var src = "https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js"
    if (window.TL && window.TL.Timeline) {
        return Promise.resolve()
    }
    var scripts = document.getElementsByTagName("script")
    var exists = false
    for (var i = 0; i < scripts.length; i++) {
        var s = scripts[i]
        if (s.getAttribute("src") === src) {
            exists = true
            break
        }
    }
    if (exists) {
        return new Promise(function (resolve) {
            var wait = function () {
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
        var script = document.createElement("script")
        script.setAttribute("src", src)
        script.async = true
        script.onload = function () {
            resolve()
        }
        document.body.appendChild(script)
    })
}

function sanitizeEventos(eventos) {
    var out = []
    if (!eventos) {
        return out
    }
    if (!Array.isArray(eventos)) {
        return out
    }

    for (var i = 0; i < eventos.length; i++) {
        var ev = eventos[i]
        if (!ev) {
            continue
        }

        var start = {}
        if (ev.start_date && ev.start_date.year) {
            var y = Number(ev.start_date.year)
            if (Number.isFinite(y)) {
                start.year = y
            }
        }
        if (ev.start_date && ev.start_date.month) {
            var m = Number(ev.start_date.month)
            if (Number.isFinite(m)) {
                start.month = m
            }
        }
        if (ev.start_date && ev.start_date.day) {
            var d = Number(ev.start_date.day)
            if (Number.isFinite(d)) {
                start.day = d
            }
        }

        if (!start.year) {
            continue
        }

        var text = {}
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

        var media = null
        if (ev.media && ev.media.url) {
            media = {}
            media.url = String(ev.media.url)
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

        var end = null
        if (ev.end_date) {
            end = {}
            if (ev.end_date.year) {
                var ey = Number(ev.end_date.year)
                if (Number.isFinite(ey)) {
                    end.year = ey
                }
            }
            if (ev.end_date.month) {
                var em = Number(ev.end_date.month)
                if (Number.isFinite(em)) {
                    end.month = em
                }
            }
            if (ev.end_date.day) {
                var ed = Number(ev.end_date.day)
                if (Number.isFinite(ed)) {
                    end.day = ed
                }
            }
            if (!end.year) {
                end = null
            }
        }

        var evento = {}
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

export default function TimelinePreview({ eventos }) {
    var contenedorRef = useRef(null)
    var timelineRef = useRef(null)

    useEffect(function () {
        var container = contenedorRef.current
        if (!container) {
            return
        }
        if (!eventos || !Array.isArray(eventos) || eventos.length === 0) {
            container.innerHTML = ""
            return
        }

        var sane = sanitizeEventos(eventos)
        if (sane.length === 0) {
            container.innerHTML = ""
            var empty = document.createElement("div")
            empty.textContent = "No hay eventos válidos"
            empty.style.padding = "8px"
            container.appendChild(empty)
            return
        }

        var data = {}
        var title = {}
        title.text = {}
        title.text.headline = "Línea de tiempo"
        title.text.text = ""
        data.title = title
        data.events = sane

        var init = function () {
            container.innerHTML = ""
            if (window.TL && window.TL.Timeline) {
                timelineRef.current = new window.TL.Timeline(
                    container,
                    data,
                    {
                        timenav_position: "bottom",
                        timenav_height_percentage: 15,
                        initial_zoom: 2,
                        scale_factor: 1,
                        locale: "es",
                        hash_bookmark: false
                    }
                )
            } else {
                var msg = document.createElement("div")
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
            timelineRef.current = null
            if (contenedorRef.current) {
                contenedorRef.current.innerHTML = ""
            }
        }
    }, [eventos])

    return (
        <div className="contenedor-linea-tiempo">
            <div ref={contenedorRef} className="caja-linea-tiempo"></div>
        </div>
    )
}
