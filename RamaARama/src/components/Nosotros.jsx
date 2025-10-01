import "../styles/Nosotros.css";

function Nosotros() {
    return (
        <div className="pageWrapper">
            <div className="nosotrosContainer">
                <section className="infoNegocio">
                    <h1>Sobre Rama a Rama</h1>
                    <p>
                        Rama a Rama nace como un prototipo digital con el propósito de fusionar el turismo
                        costarricense con la riqueza cultural que lo rodea. Surge ante la necesidad de conectar
                        los puntos de interés con sus historias, leyendas y contexto local.
                    </p>

                    <h2>Misión</h2>
                    <p>
                        Crear una red de puntos turísticos en Costa Rica donde los usuarios puedan acceder
                        fácilmente a la historia y cultura detrás de cada lugar.
                    </p>

                    <h2>Visión</h2>
                    <p>
                        Convertirse en la plataforma más influyente en el turismo costarricense, siendo
                        referente en la integración de cultura y exploración.
                    </p>

                    <h2>Valores</h2>
                    <ul>
                        <li>Transparencia</li>
                        <li>Alta rigurosidad</li>
                        <li>Respeto por la cultura local</li>
                        <li>Accesibilidad</li>
                        <li>Innovación</li>
                    </ul>
                </section>

                <section className="formularioContacto">
                    <h2>¿Tienes dudas o sugerencias?</h2>
                    <p>Escríbenos a través del siguiente formulario:</p>
                    <form>
                        <label htmlFor="nombre">Nombre:</label>
                        <input type="text" id="nombre" name="nombre" placeholder="Tu nombre" />

                        <label htmlFor="correo">Correo electrónico:</label>
                        <input type="email" id="correo" name="correo" placeholder="correo@ejemplo.com" />

                        <label htmlFor="mensaje">Mensaje:</label>
                        <textarea id="mensaje" name="mensaje" placeholder="Escribe tu mensaje aquí..." />

                        <button type="submit" disabled>Enviar</button>
                    </form>
                </section>

                <section className="infoContacto">
                    <h2>Información de Contacto</h2>
                    <p><strong>Teléfono:</strong> 8888-8888</p>
                    <p><strong>Correo:</strong> correo@ejemplo.com</p>
                    <p><strong>Dirección:</strong> xxxx-xxxx</p>
                </section>
            </div>
        </div>

    );
}

export default Nosotros;
