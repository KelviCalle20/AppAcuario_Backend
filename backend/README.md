# AppAcuario_Backend

Backend (Node.js + Express + PostgreSQL)

El backend será la API REST que maneja la lógica de negocio, autenticación y acceso a la base de datos.

![arquitectura](https://github.com/user-attachments/assets/a57a3c57-3f10-4570-800b-fe4f5e1e26b5)


Librerías Backend
   express → framework principal.
   pg → conexión con PostgreSQL.![Uploading arquitectura.png…]()

   sequelize o prisma → ORM (opcional, más fácil que SQL puro).
   dotenv → manejo de variables de entorno.
   jsonwebtoken (JWT) → autenticación.
   bcrypt → encriptación de contraseñas.
   express-validator → validaciones en formularios.
   cors → permitir llamadas desde el frontend.
   morgan → logging de peticiones.

⚙️ Funcionalidades Backend
      API REST con rutas:
         /api/users → login, registro, perfil.
         /api/products → CRUD de productos.
         /api/orders → pedidos y carrito.
        /api/articles → artículos educativos.


Seguridad con JWT + Bcrypt.

Gestión de imágenes (Cloudinary opcional).