import { useNavigate } from "react-router-dom"

function BtnVolver() {
    const navigate = useNavigate()

    return (
        <button
            type="button"
            onClick={() => navigate(-1)}
        >
            Volver
        </button>
    )
}

export default BtnVolver
