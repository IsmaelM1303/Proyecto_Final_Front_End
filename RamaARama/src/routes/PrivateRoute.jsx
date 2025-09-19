// src/routes/PrivateRoute.jsx
import React, { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { obtenerElementos } from "../api/Crud"

function PrivateRoute({ children }) {
    const [autenticado, setAutenticado] = useState(null)
    const token = localStorage.getItem("token")

    useEffect(() => {
        async function verificarToken() {
            if (!token) {
                setAutenticado(false)
                return
            }

            const usuarios = await obtenerElementos("usuarios")
            if (!usuarios) {
                setAutenticado(false)
                return
            }

            const existe = usuarios.some(usuario => String(usuario.id) === String(token))
            setAutenticado(existe)
        }

        verificarToken()
    }, [token])

    if (autenticado === null) {
        return <div>Verificando sesión...</div>
    }

    if (!autenticado) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default PrivateRoute
