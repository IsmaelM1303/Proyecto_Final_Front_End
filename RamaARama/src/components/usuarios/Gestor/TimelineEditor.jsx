import { useState } from "react"
import TimelinePreview from "./TimelinePreview"

function TimelineEditor({ lineaTiempo, setLineaTiempo }) {
    const [nuevoEvento, setNuevoEvento] = useState({
        anio: "",
        mes: "",
        dia: "",
        titulo: "",
        descripcion: "",
        imagen: ""
    })

    const meses = [
        { valor: "01", nombre: "Enero" },
        { valor: "02", nombre: "Febrero" },
        { valor: "03", nombre: "Marzo" },
        { valor: "04", nombre: "Abril" },
        { valor: "05", nombre: "Mayo" },
        { valor: "06", nombre: "Junio" },
        { valor: "07", nombre: "Julio" },
        { valor: "08", nombre: "Agosto" },
        { valor: "09", nombre: "Septiembre" },
        { valor: "10", nombre: "Octubre" },
        { valor: "11", nombre: "Noviembre" },
        { valor: "12", nombre: "Diciembre" }
    ]

    function manejarCambio(evento) {
        const nombreCampo = evento.target.name
        const valorCampo = evento.target.value

        const copiaEvento = {
            anio: nuevoEvento.anio,
            mes: nuevoEvento.mes,
            dia: nuevoEvento.dia,
            titulo: nuevoEvento.titulo,
            descripcion: nuevoEvento.descripcion,
            imagen: nuevoEvento.imagen
        }

        copiaEvento[nombreCampo] = valorCampo
        setNuevoEvento(copiaEvento)
    }

    function agregarEvento() {
        if (nuevoEvento.anio === "" || nuevoEvento.titulo === "") {
            return
        }

        const evento = {
            start_date: {
                year: nuevoEvento.anio,
                month: nuevoEvento.mes,
                day: nuevoEvento.dia
            },
            text: {
                headline: nuevoEvento.titulo,
                text: nuevoEvento.descripcion
            }
        }

        if (nuevoEvento.imagen !== "") {
            evento.media = { url: nuevoEvento.imagen }
        }

        const copiaEventos = lineaTiempo.slice()
        copiaEventos.push(evento)
        setLineaTiempo(copiaEventos)

        setNuevoEvento({
            anio: "",
            mes: "",
            dia: "",
            titulo: "",
            descripcion: "",
            imagen: ""
        })
    }

    function eliminarEvento(indice) {
        const copiaEventos = lineaTiempo.filter(function (_, i) {
            return i !== indice
        })
        setLineaTiempo(copiaEventos)
    }

    return (
        <div style={{ display: "flex", gap: "2rem" }}>
            <div>
                <h4>Agregar evento</h4>
                <input
                    name="anio"
                    placeholder="Año"
                    value={nuevoEvento.anio}
                    onChange={manejarCambio}
                />
                <select
                    name="mes"
                    value={nuevoEvento.mes}
                    onChange={manejarCambio}
                >
                    <option value="">Seleccione mes</option>
                    {meses.map(function (mes) {
                        return (
                            <option key={mes.valor} value={mes.valor}>
                                {mes.nombre}
                            </option>
                        )
                    })}
                </select>
                <input
                    name="dia"
                    placeholder="Día"
                    value={nuevoEvento.dia}
                    onChange={manejarCambio}
                />
                <input
                    name="titulo"
                    placeholder="Título"
                    value={nuevoEvento.titulo}
                    onChange={manejarCambio}
                />
                <textarea
                    name="descripcion"
                    placeholder="Descripción"
                    value={nuevoEvento.descripcion}
                    onChange={manejarCambio}
                />
                <input
                    name="imagen"
                    placeholder="URL de la imagen"
                    value={nuevoEvento.imagen}
                    onChange={manejarCambio}
                />
                <button type="button" onClick={agregarEvento}>
                    Añadir
                </button>

                <ul>
                    {lineaTiempo.map(function (evento, indice) {
                        return (
                            <li key={indice}>
                                {evento.start_date.year} - {evento.text.headline}
                                {evento.media && evento.media.url ? <span> 📷 </span> : null}
                                <button type="button" onClick={function () { eliminarEvento(indice) }}>
                                    Eliminar
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>

            <div style={{ flex: 1 }}>
                <TimelinePreview eventos={lineaTiempo} />
            </div>
        </div>
    )
}

export default TimelineEditor
