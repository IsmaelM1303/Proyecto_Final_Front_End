import { useNavigate } from "react-router-dom"
import "../../styles/General/BtnVolver.css"

function BtnVolver() {
    const navigate = useNavigate()

    return (
        <button
            type="button"
            className="btnVolver"
            onClick={() => navigate(-1)}
        >
            Volver
        </button>
    )
}

export default BtnVolver
