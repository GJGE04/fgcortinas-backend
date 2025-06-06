// backend/server.js
// Este archivo será el punto de entrada para tu servidor Express.

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
const userRoutes = require('./routes/userRoutes');    
const workRoutes = require('./routes/workRoutes');
const oldworkRoutes = require('./routes/oldworkRoutes');
const budgetRoutes = require('./routes/budgetRoutes'); // Importar las rutas de presupuesto

// Rutas
const adminRoutes = require('./routes/admin');      // revisar si se usa
const logRoutes = require('./routes/logRoutes');

const emailRoutes = require('./routes/email');
const calendarRoutes = require('./routes/calendarRoutes');
const citasRoutes = require('./routes/citasRoutes');
const rolesRoutes = require('./routes/rolesRoutes');

dotenv.config(); // Cargar variables de entorno

const app = express(); // Inicializar express
// Middlewares
// app.use(cors());            // Esto permite todas las solicitudes de cualquier dominio

// Configurar CORS para permitir solicitudes de localhost:3000. Permitir solicitudes desde localhost:3000
app.use(cors({
    origin: ['http://localhost:3000', 'https://fg-cortinas-app.web.app'],  // Permite solicitudes desde estos orígenes. // La URL de tu frontend. Si se necesita restringir el acceso, configurar CORS para permitir solo el dominio de tu frontend:
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],  // Permite estos métodos HTTP
    allowedHeaders: ['Content-Type', 'Authorization'],  // Permite estos encabezados
}));

// Middleware que parsea el JSON del body
app.use(express.json({ limit: '20mb' })); // importante para manejar base64 grandes
app.use(bodyParser.json()); // Para leer JSON en las solicitudes. // Aunque con express.json ya alcanza, igual lo dejas si querés
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
app.use('/api/logs', logRoutes);
// Ahora sí, las rutas que usan req.body
app.use('/api', emailRoutes);

app.use('/api/calendar', calendarRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/roles', rolesRoutes);

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
