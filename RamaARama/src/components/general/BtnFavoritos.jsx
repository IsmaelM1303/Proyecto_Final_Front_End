import { useNavigate } from "react-router-dom"


function BtnFavoritos() {
    const navigate = useNavigate()
    return (
        <div>
            <button onClick={() => navigate("/MisFavoritos")}>Ir a favoritos </button>
        </div>
    )
}

export default BtnFavoritos
