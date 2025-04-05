//const express = require('express');
const Cliente = require('../models/Client'); // Asegúrate de que la ruta sea correcta
//const router = express.Router();

// Crear un cliente
const createClient = async (req, res) => {
  try {
    const { nombre, apellidos, direcciones, telefonos, correos, activo } = req.body;
    const newCliente = new Cliente({
      nombre,
      apellidos,
      direcciones,
      telefonos,
      correos,
      activo,
    });
    await newCliente.save();
    res.status(201).json(newCliente);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error al crear el cliente: ' + error.message });
  }
};

// Obtener todos los clientes
const getClient = async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.status(200).json(clientes);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error al obtener los clientes: ' + error });
  }
};

// Actualizar un cliente
const updateClient = async (req, res) => {
  try {
    const { nombre, apellidos, direcciones, telefonos, correos, activo } = req.body;
    const updatedCliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      { nombre, apellidos, direcciones, telefonos, correos, activo },
      { new: true }
    );
    res.status(200).json(updatedCliente);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error al actualizar el cliente' });
  }
};

// Eliminar un cliente
const deleteClient = async (req, res) => {
  try {
    const deletedCliente = await Cliente.findByIdAndDelete(req.params.id);
    res.status(200).json(deletedCliente);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error al eliminar el cliente' });
  }
};

// Filtrar un cliente
const searchClient = async (req, res) => {
    try {
        const clienteId = req.params._id; // Obtener el ID del cliente de la URL
        const cliente = await Cliente.findById(clienteId); // Buscar el cliente por ID
    
        if (!cliente) {
          return res.status(404).json({ message: 'Cliente no encontrado' });
        }
    
        res.json(cliente); // Devolver los datos del cliente encontrado
      } catch (err) {
        res.status(500).json({ message: 'Error al obtener el cliente', error: err });
      }
  };

module.exports = {
    createClient,    
    getClient,      
    updateClient,  
    deleteClient,  
    searchClient, 
  };