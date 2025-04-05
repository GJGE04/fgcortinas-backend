// Este archivo se encargará de gestionar la conexión a MongoDB.

// config/db.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');// Para cargar las variables de entorno

dotenv.config(); // Cargar variables de entorno

// Conexión a MongoDB Atlas
const connectDB = async () => {
  try {
    // La cadena de conexión de MongoDB Atlas (asegúrate de tenerla en tu archivo .env)
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('No se encontró la URI de MongoDB');
        process.exit(1);  // Detenemos la ejecución si no está definida
      }
    
    // Intentamos conectar a la base de datos
    /*await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });*/

    // Eliminar useNewUrlParser y useUnifiedTopology
    await mongoose.connect(uri);

    console.log('Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('Error al conectar a MongoDB Atlas:', error);
    process.exit(1); // Salir con error si no se puede conectar
  }
};

// Exportar la función para usarla en el archivo server.js
module.exports = connectDB;
