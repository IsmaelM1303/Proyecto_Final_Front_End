import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { obtenerElementos, actualizarElemento } from "../../api/Crud"
import "../../styles/Perfil.css"

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

    if (cargando) return <p className="perfil__loading">Cargando perfil...</p>

    return (
        <div className="perfil">
            <h2 className="perfil__title">Mi Perfil</h2>

            <div className="perfil__field">
                <label className="perfil__label">Correo:</label>
                <input
                    className="perfil__input"
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                />
            </div>

            <div className="perfil__field">
                <label className="perfil__label">Nueva contraseña:</label>
                <div className="perfil__password">
                    <input
                        className="perfil__input"
                        type={verNuevaPass ? "text" : "password"}
                        value={nuevaPass}
                        onChange={(e) => setNuevaPass(e.target.value)}
                    />
                    <button
                        type="button"
                        className="perfil__toggle-password"
                        onClick={() => setVerNuevaPass(!verNuevaPass)}
                    >
                        {verNuevaPass ? "O" : "-"}
                    </button>
                </div>
            </div>

            <div className="perfil__field">
                <label className="perfil__label">Confirmar nueva contraseña:</label>
                <div className="perfil__password">
                    <input
                        className="perfil__input"
                        type={verConfirmPass ? "text" : "password"}
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                    />
                    <button
                        type="button"
                        className="perfil__toggle-password"
                        onClick={() => setVerConfirmPass(!verConfirmPass)}
                    >
                        {verConfirmPass ? "O" : "-"}
                    </button>
                </div>
            </div>

            <button className="perfil__button" onClick={handleGuardar}>
                Confirmar cambios
            </button>

            {/* Botones condicionales */}
            <div className="perfil__extra-actions" style={{ marginTop: "20px" }}>
                {tipoCuenta.includes("gestor") && (
                    <button
                        className="perfil__button perfil__button--secondary"
                        onClick={() => navigate("/VerPOIs")}
                    >
                        Mis puntos de interés
                    </button>
                )}
                {tipoCuenta.includes("admin") && (
                    <button
                        className="perfil__button perfil__button--secondary"
                        onClick={() => navigate("/AdministrarPerfiles")}
                    >
                        Ver perfiles
                    </button>
                )}
            </div>
        </div>
    )
}

export default Perfil
