// middlewares/roleMiddleware.js
const ROLES = {
    SUPERADMIN: 'Superadmin',
    ADMIN: 'Admin',
    EDITOR: 'Editor',
    VENDEDOR: 'Vendedor',
    TECNICO: 'Tecnico',
    GUEST: 'Guest',
  };
  
  module.exports = ROLES;  

/*
  ✅ Recomendación General para Roles (valores de strings):
Contexto	Ejemplo recomendado	Justificación
Almacenamiento en DB / backend / lógica interna	'admin', 'tecnico', 'superadmin'	✅ Minúsculas: consistentes, fáciles de comparar (role === 'admin'), evitan errores de casing.
Display en frontend (lo que ve el usuario)	'Admin', 'Técnico', 'Superadmin'	✅ Capitalizado: se ve bien para el usuario. Se puede transformar con toTitleCase si hace falta.
Constantes en código	ROLES.ADMIN = 'admin'	✅ Mayúsculas para claves (como constantes), valores en minúsculas.
*/

/*
🔐 Las claves (ADMIN) se usan como constantes internas.

📦 Los valores ('admin') se almacenan en la DB y se usan para comparar.

🖼 En el frontend, transformás esos valores para mostrar algo como 'Admin' o 'Técnico' si querés.
*/

/*
Para que puedas mantener consistencia en los roles y migrar los existentes a minúsculas en tu base de datos MongoDB, 
aquí te dejo el script que deberías ejecutar (por ejemplo, en MongoDB Compass o una terminal con acceso a tu base de datos):
db.users.updateMany({ role: "Superadmin" }, { $set: { role: "superadmin" } });
db.users.updateMany({ role: "Admin" }, { $set: { role: "admin" } });
db.users.updateMany({ role: "Editor" }, { $set: { role: "editor" } });
db.users.updateMany({ role: "Vendedor" }, { $set: { role: "vendedor" } });
db.users.updateMany({ role: "Tecnico" }, { $set: { role: "tecnico" } });
db.users.updateMany({ role: "Guest" }, { $set: { role: "guest" } });
db.users.updateMany({ role: "TECNICO" }, { $set: { role: "tecnico" } });
db.users.updateMany({ role: "ADMIN" }, { $set: { role: "admin" } });
*/
