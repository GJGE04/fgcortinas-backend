const Budget = require('../models/Budget');

// **POST**: Crear un nuevo presupuesto
const createBudget = async (req, res) => {
    try {
      const { 
        work, 
        name, 
        products, 
        totalUYU, 
        totalUSD, 
        client, 
        address, 
        description, 
        technician 
      } = req.body;

      // Validaciones básicas de los campos requeridos
      if (!work || !name || !client || !technician || !totalUYU || !totalUSD || !address) {
        return res.status(400).json({ message: 'Faltan campos requeridos. Por favor, asegúrese de enviar todos los datos obligatorios.' });
      }
  
      // Validar que 'products' sea un array y tenga al menos un producto
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ message: 'Debe incluir al menos un producto en el presupuesto.' });
      }
  
  
      // Calcular subtotal de cada producto si no se envía
      products.forEach((product, index) => {
        
        if (!product.product || !product.quantity || !product.width || !product.length) {
            return res.status(400).json({ message: `Producto ${index + 1} tiene campos faltantes (producto, cantidad, ancho, largo son requeridos).` });
          }

          // Calcular subtotal si no está presente
        if (product.subtotal === undefined) {
            if (product.discount === undefined || isNaN(product.discount)) {
            return res.status(400).json({ message: `El descuento del producto ${index + 1} es inválido.` });
            }

            // Calcular el subtotal: cantidad * (ancho * largo) * (1 - descuento)
            product.subtotal = product.quantity * product.width * product.length * (1 - product.discount / 100);
        }

        // Validar subtotal calculado (no debe ser NaN o negativo)
        if (isNaN(product.subtotal) || product.subtotal < 0) {
            return res.status(400).json({ message: `El subtotal calculado para el producto ${index + 1} es inválido.` });
        }
            
            if (!product.subtotal) {
            // Calcular el subtotal: cantidad * (ancho * largo) * (1 - descuento)
            product.subtotal = product.quantity * product.width * product.length * (1 - product.discount / 100);
            }
      });

      // Verificar que los valores de totalUYU y totalUSD sean válidos
      if (isNaN(totalUYU) || totalUYU < 0) {
        return res.status(400).json({ message: 'El total en UYU es inválido.' });
      }
  
      if (isNaN(totalUSD) || totalUSD < 0) {
        return res.status(400).json({ message: 'El total en USD es inválido.' });
      }

      // Verificar que la fecha de creación esté presente
      const creationDate = new Date();
  
      // Crear el presupuesto
      const newBudget = new Budget({
        work,
        name,
        products,
        totalUYU,
        totalUSD,
        client,
        address,
        description,
        technician,
        creationDate
      });
  
      // Guardar el presupuesto en la base de datos
      await newBudget.save();
      // Retorna el presupuesto creado
      res.status(201).json(newBudget); // Retorna el presupuesto creado
    } catch (error) {
      console.error(error);
      // Devolver error con detalles del problema
      res.status(500).json({ message: 'Error al crear el presupuesto', details: error.message });
    }
  };

  // **GET**: Obtener todos los presupuestos
const getBudgets = async (req, res) => {
    try {
      const budgets = await Budget.find();
      res.status(200).json(budgets);
    } catch (error) {
      console.error('Error al obtener los presupuestos:', error);
      res.status(500).json({ message: 'Error al obtener los presupuestos' });
    }
  };

  // Obtener todos los presupuestos con detalles del producto
const getBudgetsDetail = async (req, res) => {
    try {
      // Obtener los presupuestos y hacer un populate para traer los productos
      const budgets = await Budget.find()
            .populate('products.product') // Esta línea se asegura de que el `productId` del presupuesto sea poblado con los detalles del producto
            .populate('client', 'nombre') // Poblamos el cliente con el campo 'name'
            .populate('technician', 'username') // Poblamos el técnico con el campo 'name'
            .exec();
  
      // Enviar los presupuestos con los productos detallados
      res.json(budgets);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al obtener los presupuestos en detalle');
    }
  };

  // **GET by ID**: Obtener un presupuesto por su ID
const getBudgetById = async (req, res) => {
    try {
      const budgetId = req.params.id;
  
      // Buscar el presupuesto por su ID con las referencias
      const budget = await Budget.findById(budgetId)
        .populate('work')
        .populate('client')
        .populate('technician')
        .populate('products.product');
      
      if (!budget) {
        return res.status(404).json({ message: 'Presupuesto no encontrado' });
      }
  
      res.status(200).json(budget);  // Retorna el presupuesto encontrado
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener el presupuesto' });
    }
  };

// Función para crear un presupuesto
const createBudget2 = async (req, res) => {
  try {
    const {
      workId,
      name,
      products,
      client,
      address,
      description,
      technicianId,
      exchangeRateUSD, // Asumimos que recibimos el tipo de cambio de USD a UYU
    } = req.body;

    // Buscar el trabajo para el que se va a crear el presupuesto
    const work = await Work.findById(trabajoId).populate('client');
    if (!work) {
      return res.status(404).json({ message: 'Trabajo no encontrado' });
    }

    let total = 0;
    let totalUYU = 0;
    let totalUSD = 0;

    const productosConSubtotales = [];

    // Calcular subtotal por producto
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      const subtotal = (product.price * item.quantity * item.width * item.lenth) - item.discount;
      total += subtotal;

      productosConSubtotales.push({
        ...item,
        subtotal: subtotal,
      });
    }

    // Calcular total en USD y UYU
    totalUSD = total;
    totalUYU = total * exchangeRateUSD; // Asumimos que tipoCambioUSD es el valor recibido

    // Crear el presupuesto
    const budget = new Budget({
      work: workId,
      name,
      products: productosConSubtotales,
      totalUYU,
      totalUSD,
      client: work.cliente._id,
      address,
      description,
      technician: technicianId,
    });

    await budget.save();

    // Respondemos con el presupuesto creado
    res.status(201).json(budget);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error al crear el presupuesto' });
  }
};

// Obtener todos los trabajos
const getBudget2 = async (req, res) => {
    try {
      const works = await Work.find().populate('client'); // Rellenar los datos de cliente
      res.status(200).json(works);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: 'Error al obtener los trabajos' });
    }
  };

  // Función para obtener un presupuesto por su ID
const getBudgetForId2 = async (req, res) => {
    try {
      const budgetId = req.params.id;  // Suponiendo que vas a buscar el presupuesto por ID
      const budget = await Budget.findById(budgetId).populate('cliente tecnico');
      
      if (!budget) {
        return res.status(404).json({ message: 'Presupuesto no encontrado' });
      }
  
      res.status(200).json(budget);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener el presupuesto' });
    }
  };

  // Función para borrar un presupuesto por su ID
const deleteBudgetForId = async (req, res) => {
    const { id } = req.params;
    try {
            const budget = await Budget.findById(id);
            console.log(budget); // Verifica si hay un presupuesto con ese id
            console.log(id); 
            if (!budget) {
            return res.status(404).json({ message: 'Presupuesto no encontrado' });
            }
    
            // Eliminar presupuesto usando deleteOne()
            await Budget.deleteOne({ _id: id });

            res.status(200).json({ message: 'Presupuesto eliminado correctamente' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hubo un error al eliminar el presupuesto' });
      }
  };

module.exports = {
  createBudget, getBudgets, getBudgetById, getBudgetsDetail, deleteBudgetForId
};
