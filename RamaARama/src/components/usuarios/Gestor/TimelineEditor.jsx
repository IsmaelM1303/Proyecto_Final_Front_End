import { useState } from "react"
import TimelinePreview from "./TimelinePreview"

/**
 * Componente TimelineEditor
 * Permite agregar, editar y eliminar eventos para la línea de tiempo de un POI.
 * Cada evento incluye año, mes, día, título, descripción y una imagen opcional.
 * Los eventos se muestran en una lista y se pueden eliminar individualmente.
 * Incluye una previsualización de la línea de tiempo usando TimelinePreview.
 */
function TimelineEditor({ lineaTiempo, setLineaTiempo }) {
    // Estado para el evento nuevo a agregar
    const [nuevoEvento, setNuevoEvento] = useState({
        anio: "",
        mes: "",
        dia: "",
        titulo: "",
        descripcion: "",
        imagen: ""
    })

    // Lista de meses para el selector
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

    // Maneja el cambio en los campos del evento nuevo
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

    // Agrega el evento nuevo a la línea de tiempo
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

    // Elimina un evento de la línea de tiempo por índice
    function eliminarEvento(indice) {
        const copiaEventos = lineaTiempo.filter(function (_, i) {
            return i !== indice
        })
        setLineaTiempo(copiaEventos)
    }

    // Render principal del editor de línea de tiempo
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

                {/* Lista de eventos agregados */}
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

            {/* Previsualización de la línea de tiempo */}
            <div style={{ flex: 1 }}>
                <TimelinePreview eventos={lineaTiempo} />
            </div>
        </div>
    )
}

export default TimelineEditor