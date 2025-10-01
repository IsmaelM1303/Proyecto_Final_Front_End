import { useNavigate } from "react-router-dom"
import "../../styles/General/BtnFavoritos.css"

function BtnFavoritos() {
    const navigate = useNavigate()
    return (
        <div className="btnFavoritosContainer">
            <button
                className="btnFavoritos"
                onClick={() => navigate("/MisFavoritos")}
            >
                Ir a favoritos
            </button>
        </div>
    )
}

export default BtnFavoritos
