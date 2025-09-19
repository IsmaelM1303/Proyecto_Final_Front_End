    // Normaliza la URL para que siempre termine con "/"
    function normalizarUrl(url) {
        if (url.endsWith("/")) {
            return url
        }
        url = "http://localhost:3001/" + url + "/"
        return url
    }

    // Obtener todos los elementos
    export async function obtenerElementos(urlApi) {
        urlApi = normalizarUrl(urlApi)
        try {
            const respuesta = await fetch(urlApi)
            const datos = await respuesta.json()
            return datos
        } catch (error) {
            console.error("Error al obtener elementos:", error)
            return null
        }
    }

    // Crear un elemento
    export async function crearElemento(urlApi, datos) {
        urlApi = normalizarUrl(urlApi)
        try {
            const respuesta = await fetch(urlApi, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            })
            const nuevoElemento = await respuesta.json()
            return nuevoElemento
        } catch (error) {
            console.error("Error al crear elemento:", error)
            return null
        }
    }

    // Actualizar un elemento
    export async function actualizarElemento(urlApi, id, datosActualizados) {
        urlApi = normalizarUrl(urlApi)
        try {
            const respuesta = await fetch(urlApi + id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosActualizados)
            })
            const elementoActualizado = await respuesta.json()
            return elementoActualizado
        } catch (error) {
            console.error("Error al actualizar elemento:", error)
            return null
        }
    }

    // Eliminar un elemento
    export async function eliminarElemento(urlApi, id) {
        urlApi = normalizarUrl(urlApi)
        try {
            await fetch(urlApi + id, { method: "DELETE" })
            return true
        } catch (error) {
            console.error("Error al eliminar elemento:", error)
            return false
        }
    }
