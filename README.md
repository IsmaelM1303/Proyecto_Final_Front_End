# Proyecto_Final_Front_End

Este proyecto es el resultado del bootcamp Forward CR, desarrollado con React y Vite. El objetivo principal es crear una plataforma digital que conecte el turismo costarricense con su riqueza cultural, permitiendo a los usuarios explorar puntos de interés, conocer sus historias y participar activamente en la comunidad.

## Características

- **Mapa interactivo:** Visualiza puntos turísticos de Costa Rica y filtra por provincia y cantón.
- **Gestión de usuarios:** Registro, inicio de sesión, recuperación de contraseña y edición de perfil.
- **Roles:** Administrador, gestor turístico y turista, cada uno con funcionalidades específicas.
- **Solicitud de roles:** Los usuarios pueden aplicar para ser gestores o administradores.
- **Gestión de POIs:** Creación, edición y revisión de puntos de interés turísticos.
- **Favoritos:** Guarda y califica tus lugares favoritos con valoraciones por estrellas.
- **Línea de tiempo:** Visualiza la historia de cada punto de interés usando TimelineJS.
- **Contacto:** Formulario para dudas y sugerencias.

## Estructura del proyecto

- `src/` Código fuente principal
  - `components/` Componentes reutilizables y específicos por rol
  - `pages/` Páginas principales de la aplicación
  - `api/` Funciones para CRUD con la base de datos
  - `styles/` Archivos CSS organizados por sección
  - `assets/` Imágenes y recursos estáticos
- `DBs/` Archivos de base de datos simulados (JSON)
- `public/` Archivos públicos y recursos estáticos

## Instalación

1. Clona el repositorio:
   ```sh
   git clone <URL-del-repositorio>
   cd Proyecto_Final_Front_End/RamaARama
   ```
2. Instala las dependencias:
   ```sh
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```sh
   npm run dev
   ```

## Uso

- Accede a la aplicación en [http://localhost:5173](http://localhost:5173)
- Regístrate y explora las funcionalidades según tu rol.

## Tecnologías y dependencias principales

- **React**: Framework principal para la interfaz.
- **Vite**: Bundler y servidor de desarrollo.
- **Leaflet**: Visualización de mapas.
- **react-leaflet**: Integración de Leaflet con React.
- **OpenStreetMap**: Fuente de datos cartográficos.
- **TimelineJS**: Visualización de líneas de tiempo históricas.
- **EmailJS**: Envío de correos desde formularios.
- **react-simple-star-rating**: Valoraciones por estrellas en POIs.
- **react-router-dom**: Navegación entre páginas.
- **CSS Modules**: Estilización modular.
- **react-leaflet-cluster**: Agrupación de marcadores en mapas.

## Créditos

Desarrollado por estudiantes del bootcamp Forward CR.

---

Para dudas o sugerencias, utiliza el formulario de contacto en la sección "Nosotros" de la aplicación.