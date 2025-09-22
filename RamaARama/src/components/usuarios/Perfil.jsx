import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { obtenerElementos, actualizarElemento } from "../../api/Crud"

function Perfil() {
    const [correo, setCorreo] = useState("")
    const [nuevaPass, setNuevaPass] = useState("")
    const [confirmPass, setConfirmPass] = useState("")
    const [verNuevaPass, setVerNuevaPass] = useState(false)
    const [verConfirmPass, setVerConfirmPass] = useState(false)
    const [usuarioId, setUsuarioId] = useState(null)
    const [tipoCuenta, setTipoCuenta] = useState("")
    const [cargando, setCargando] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        async function cargarUsuario() {
            const token = localStorage.getItem("token")
            if (!token) {
                alert("No hay sesión iniciada")
                setCargando(false)
                return
            }

            const usuarios = await obtenerElementos("usuarios", 1)
            if (usuarios) {
                const usuario = usuarios.find(u => String(u.id) === String(token))
                if (usuario) {
                    setUsuarioId(usuario.id)
                    setCorreo(usuario.correo || "")
                    setTipoCuenta(usuario.tipoCuenta?.toLowerCase().trim() || "")
                }
            }
            setCargando(false)
        }
        cargarUsuario()
    }, [])

    async function handleGuardar() {
        if (!usuarioId) {
            alert("No se encontró el usuario")
            return
        }

        if (nuevaPass && nuevaPass !== confirmPass) {
            alert("Las contraseñas no coinciden")
            return
        }

        const datosActualizados = { correo }
        if (nuevaPass) {
            datosActualizados.contrasena = nuevaPass
        }

        const actualizado = await actualizarElemento("usuarios", usuarioId, datosActualizados, 1)
        if (actualizado) {
            alert("Perfil actualizado correctamente")
            setNuevaPass("")
            setConfirmPass("")
        } else {
            alert("Error al actualizar el perfil")
        }
    }

    if (cargando) return <p>Cargando perfil...</p>

    return (
        <div>
            <h2>Mi Perfil</h2>
            <div>
                <label>Correo:</label>
                <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                />
            </div>

            <div>
                <label>Nueva contraseña:</label>
                <div>
                    <input
                        type={verNuevaPass ? "text" : "password"}
                        value={nuevaPass}
                        onChange={(e) => setNuevaPass(e.target.value)}
                    />
                    <button type="button" onClick={() => setVerNuevaPass(!verNuevaPass)}>
                        {verNuevaPass ? "O" : "-"}
                    </button>
                </div>
            </div>

            <div>
                <label>Confirmar nueva contraseña:</label>
                <div>
                    <input
                        type={verConfirmPass ? "text" : "password"}
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                    />
                    <button type="button" onClick={() => setVerConfirmPass(!verConfirmPass)}>
                        {verConfirmPass ? "O" : "-"}
                    </button>
                </div>
            </div>

            <button onClick={handleGuardar}>Confirmar cambios</button>

            {/* Botones condicionales */}
            <div style={{ marginTop: "20px" }}>
                {tipoCuenta.includes("gestor") && (
                    <button onClick={() => navigate("/MisPuntosInteres")}>
                        Mis puntos de interés
                    </button>
                )}
                {tipoCuenta.includes("admin") && (
                    <button onClick={() => navigate("/AdministrarPerfiles")}>
                        Ver perfiles
                    </button>
                )}
            </div>
        </div>
    )
}

export default Perfil
