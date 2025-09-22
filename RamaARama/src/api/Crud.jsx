// Normaliza la URL para que siempre termine con "/"
function normalizarUrl(url, servidor) {
    let base = ""
    //Para esto, asegurarse de que el servidor db.json sea el servidor 1, dbCurricula.json el servidor 2 y POis.json el 3
    if (servidor === 1) base = "http://localhost:3001/"
    if (servidor === 2) base = "http://localhost:3000/"
    if (servidor === 3) base = "http://localhost:3002/"
    if (url.endsWith("/")) return url
    return base + url + "/"
}

// Obtener todos los elementos
export async function obtenerElementos(urlApi, servidor = 1) {
    urlApi = normalizarUrl(urlApi, servidor)
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
export async function crearElemento(urlApi, datos, servidor = 1) {
    urlApi = normalizarUrl(urlApi, servidor)
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
export async function actualizarElemento(urlApi, id, datosActualizados, servidor = 1) {
    urlApi = normalizarUrl(urlApi, servidor)
    try {
        const respuesta = await fetch(urlApi + id, {
            method: "PATCH",
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
export async function eliminarElemento(urlApi, id, servidor = 1) {
    urlApi = normalizarUrl(urlApi, servidor)
    try {
        await fetch(urlApi + id, { method: "DELETE" })
        return true
    } catch (error) {
        console.error("Error al eliminar elemento:", error)
        return false
    }
}
