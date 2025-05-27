const ROLES = require('../config/roles');
const User = require('../models/User');

// Crear un user
const createUser = async (req, res) => {
    const { username, email, password, role, activo } = req.body;
    
    try {
      // Verificar si ya existe un usuario con el mismo email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }
  
      const user = new User({
        username,
        email,
        password, // La contraseña será encriptada automáticamente en el middleware
        role,
        activo,
      });
  
      const savedUser = await user.save();
      res.status(201).json(savedUser);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: 'Error al crear el usuario: ' + error.message });
    }
};

// Obtener todos los users (filtrado por rol si se pasa como parámetro)
const getUser = async (req, res) => {
  try {
    const { role } = req.query;

    // Si se pasó un rol en la consulta, filtramos por ese rol de manera insensible a mayúsculas/minúsculas
    let users;
    if (role) {
      // Usamos el operador $regex para hacer una búsqueda insensible a mayúsculas y minúsculas
      users = await User.find({ role: { $regex: new RegExp("^" + role + "$", "i") } });
      
      // Si no se encuentra ningún usuario con ese rol, devolvemos un 204
      if (users.length === 0) {
        return res.status(204).send();  // Puedes cambiar a 404 si prefieres
      }
    } else {
      // Si no se pasó un rol, devolvemos todos los usuarios
      users = await User.find();
    }

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener un usuario por su ID
const getUserForId = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Actualizar un trabajo
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const { username, email, role, activo, password, ultimoAcceso } = req.body;

    // Backend - Asegúrate de que el email esté en minúsculas
    const normalizedEmail = email?.trim().toLowerCase();

    // Solo verificamos el email si está intentando cambiarlo
    if (normalizedEmail && normalizedEmail !== user.email) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'El email ya está registrado por otro usuario' });
      }
      user.email = normalizedEmail;
    }

    // Actualizar los campos del usuario
  /*  user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.activo = req.body.activo !== undefined ? req.body.activo : user.activo;
    user.ultimoAcceso = req.body.ultimoAcceso || user.ultimoAcceso; */

    // Actualizar otros campos
    user.username = username || user.username;
    user.role = role || user.role;
    user.activo = activo !== undefined ? activo : user.activo;
    user.ultimoAcceso = ultimoAcceso || user.ultimoAcceso;

    if (password) {   // req.body.password
      // Si la contraseña se actualiza, la encriptamos nuevamente
      // user.password = req.body.password;
      user.password = password; // será encriptada por el middleware
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// Eliminar un usuario por su ID
const deleteUser = async (req, res) => {
  try {
    //const user = await User.findById(req.params.id); // Buscar al usuario por su ID

    const userId = req.params.id;  // Accede al parámetro 'id'
    const user = await User.findById(userId);  // Usa 'userId' aquí

    console.log(user);
    
     // if (!user) return res.status(404).json({ message: 'Usuario no encontrado: ' + req.params.id });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado: ' + userId });
    }

    await User.deleteOne({ _id: userId });

    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtener todos los users (filtrado por rol si se pasa como parámetro)
const getTecnicos = async (req, res) => {
  try {
    const role = ROLES.TECNICO;

    // Si se pasó un rol en la consulta, filtramos por ese rol de manera insensible a mayúsculas/minúsculas
    let tecnicos;
    // Usamos el operador $regex para hacer una búsqueda insensible a mayúsculas y minúsculas
    tecnicos = await User.find({ role: { $regex: new RegExp("^" + role + "$", "i") } });
      
    // Si no se encuentra ningún usuario con ese rol, devolvemos un 204
    if (!tecnicos || tecnicos.length === 0) {
      return res.status(404).json({ message: 'Técnicos no encontrados' });
    }

    res.status(200).json(tecnicos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const checkEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (user) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error('Error al verificar el email:', error);
    res.status(500).json({ message: 'Error al verificar el email' });
  }
};

module.exports = {
    createUser,    
    getUser,  
    getUserForId,    
    updateUser,  
    deleteUser,  
    getTecnicos,
    checkEmail
  };
