// Este archivo será el punto de entrada para tu servidor Express.

// backend/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
// const connectDB = require('./config/db'); // Conexión a la base de datos

// Rutas:
const authRoutes = require('./routes/authRoutes');                      // Rutas de autenticación
const productTypeRoutes = require('./routes/productTypeRoutes');        // Rutas de tipos de productos
const productRoutes = require('./routes/productRoutes');                // Importar las rutas de productos
const clientRoutes = require('./routes/clientRoutes');
// const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');    
const workRoutes = require('./routes/workRoutes');
const oldworkRoutes = require('./routes/oldworkRoutes');
const budgetRoutes = require('./routes/budgetRoutes'); // Importar las rutas de presupuesto

// Rutas
const adminRoutes = require('./routes/admin');      // revisar si se usa

dotenv.config(); // Cargar variables de entorno

const app = express(); // Inicializar express
// Middlewares
// app.use(cors());            // Esto permite todas las solicitudes de cualquier dominio
app.use(cors({
    origin: 'https://fg-cortinas-app.web.app'  // La URL de tu frontend. Si se necesita restringir el acceso, configurar CORS para permitir solo el dominio de tu frontend:
  }));

app.use(bodyParser.json()); // Para leer JSON en las solicitudes
// app.use(express.json());  // Permite recibir JSON

// Rutas de autenticación
app.use('/api/auth', authRoutes); // Prefijo para las rutas de autenticación

// Rutas de tipos de productos
app.use('/api/product-types', productTypeRoutes); // Prefijo para las rutas de tipos de productos
app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
// app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/works', workRoutes);
app.use('/api/oldworks', oldworkRoutes);
app.use('/api', budgetRoutes); // Registrar las rutas de presupuesto

app.use('/api/admin', adminRoutes);

// server.js
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);  // Imprime la URL de la solicitud y el método
    next();
  });  

  app.get('/', (req, res) => {
    res.send('¡La API está funcionando!');
  });  

console.log("Rutas de productos cargadas"); // Verificar que las rutas se cargan

// Conexión a la base de datos  (MongoDB Atlas)
const connectDB = require('./config/db');
connectDB(); // Llamamos a la función para conectar a MongoDB

// Puerto donde escuchará el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
