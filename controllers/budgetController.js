const Budget = require('../models/Budget');
const Product = require('../models/Product');

// **POST**: Crear un nuevo presupuesto
const createBudget = async (req, res) => {
  try {
    const {
      work,
      name,
      products,
      client,
      address,
      description,
      technician
    } = req.body;

    let totalUYU = 0;
    let totalUSD = 0;

    const processedProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.product).populate('productType');
      if (!product) return res.status(400).json({ error: 'Producto no encontrado' });

      const { quantity, width, length, discount = 0 } = item;

      let subtotal = 0;

      // Calculo de subtotal dependiendo del formato del tipo de producto
      if (product.productType.format === 'Unidad') {
        subtotal = product.price * quantity;
      } else if (product.productType.format === 'Ancho x Largo') {
        const area = (width * length);
        subtotal = product.price * area * quantity;
      } else {
        return res.status(400).json({ error: 'Formato de producto no soportado' });
      }

      // Aplicar descuento si hay
      if (discount > 0) {
        subtotal = subtotal - (subtotal * (discount / 100));
      }

      // Acumular total según moneda
      if (product.currency === 'UYU') {
        totalUYU += subtotal;
      } else if (product.currency === 'USD') {
        totalUSD += subtotal;
      }

      processedProducts.push({
        product: product._id,
        quantity,
        width,
        length,
        discount,
        subtotal
      });
    }

    // Verificar que la fecha de creación esté presente
    const creationDate = new Date();

    const newBudget = new Budget({
      work,
      name,
      products: processedProducts,
      totalUYU,
      totalUSD,
      client,
      address,
      description,
      technician,
      creationDate
    });

    const savedBudget = await newBudget.save();
    res.status(201).json(savedBudget);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar el presupuesto' });
  }
};

// **POST**: Crear un nuevo presupuesto
const createBudgetV1 = async (req, res) => {
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
      if (!work || !name || !client || !technician || totalUYU === undefined || totalUSD === undefined || !address) {
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

  // Función para enviar el correo con PDF
const sendEmail = (pdfBuffer, budgetData) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // o el servicio de correo que uses
    auth: {
      user: 'your_email@gmail.com',
      pass: 'your_password',
    },
  });

  const mailOptions = {
    from: 'your_email@gmail.com',
    to: 'cliente_email@example.com',
    subject: `Presupuesto ${budgetData.name}`,
    text: `Adjunto te envío el presupuesto ${budgetData.name}`,
    attachments: [
      {
        filename: `${budgetData.name}.pdf`,
        content: pdfBuffer,
        encoding: 'base64',
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error al enviar el correo:', error);
    } else {
      console.log('Correo enviado:', info.response);
    }
  });
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

  // Obtener todos los presupuestos con filtros
  const getAllBudgets = async (req, res) => {
    try {
      const { client, technician, estado, fechaInicio, fechaFin } = req.query;
      const filter = {};
  
      if (client) {
        filter['client'] = client; // ID del cliente (referencia)
      }
  
      if (technician) {
        filter['technician'] = technician; // ID del técnico (referencia)
      }
  
      if (estado) {
        filter['estado'] = estado; // Por ejemplo: "pendiente", "aprobado", etc.
      }
  
      if (fechaInicio || fechaFin) {
        filter.createdAt = {};
        if (fechaInicio) {
          filter.createdAt.$gte = new Date(fechaInicio);
        }
        if (fechaFin) {
          filter.createdAt.$lte = new Date(fechaFin);
        }
      }
  /*
      const budgets = await Budget.find(filter)
        .populate('client')           // Debe coincidir con el campo en el schema
        .populate('technician')       // También debe coincidir con el campo en el schema
        .populate('products.product')         // Si usás un array de productos con referencias
        .sort({ createdAt: -1 }); */

        const budgets = await Budget.find()
            .populate('products.product')         // Esta línea se asegura de que el `productId` del presupuesto sea poblado con los detalles del producto
            .populate('client', 'nombre')        // Poblamos el cliente con el campo 'name'
            .populate('technician', 'username');  // Poblamos el técnico con el campo 'name'
            //.exec();
  
      res.status(200).json(budgets);
    } catch (error) {
      console.error('Error al obtener presupuestos:', error);
      res.status(500).json({ message: 'Error al obtener presupuestos' });
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
              return res.status(404).json({ message: 'Presupuesto no encontradoX' });
            }
    
            // Eliminar presupuesto usando deleteOne()
            await Budget.deleteOne({ _id: id });

            res.status(200).json({ message: 'Presupuesto eliminado correctamente' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hubo un error al eliminar el presupuesto' });
      }
  };

  const updateBudget = async (req, res) => {
    try {
      const { id } = req.params;
      const { client, technician, products, totalUSD, totalUYU } = req.body;
  
      // Validaciones mínimas necesarias
      if (!client || !technician || !Array.isArray(products) || products.length === 0 || (!totalUSD && !totalUYU)) {
        return res.status(400).json({
          message: 'Faltan campos obligatorios: client, technician, al menos un producto y total (USD o UYU)'
        });
      }
  
      // Validar cada producto individual
      for (let i = 0; i < products.length; i++) {
        const { product, quantity, subtotal } = products[i];
        if (!product || !quantity || !subtotal) {
          return res.status(400).json({
            message: `Faltan campos en el producto #${i + 1} (se requiere: product, cantidad, subtotal)`
          });
        }
      }
  
      // Actualización con todos los campos disponibles del body
      const updatedBudget = await Budget.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      )
        .populate('client', 'nombre apellidos')
        .populate('technician', 'username')
        .populate('products.product', 'name code currency')
        .populate('work', 'tipo estado');
  
      if (!updatedBudget) {
        return res.status(404).json({ message: 'Presupuesto no encontrado' });
      }
  
      res.status(200).json(updatedBudget);
    } catch (error) {
      console.error('Error al actualizar presupuesto:', error);
      res.status(500).json({ message: 'Error interno del servidor al actualizar el presupuesto' });
    }
  };  

  const updateBudget2 = async (req, res) => {
    try {
      const updatedBudget = await Budget.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true } // <-- esto es importante
      );
  
      if (!updatedBudget) {
        return res.status(404).json({ message: 'Presupuesto no encontrado' });
      }
  
      res.json(updatedBudget);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al actualizar el presupuesto' });
    }
  }; 

  const updateBudgetPartial = async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
  
      // 🚫 Validar que el body no esté vacío
      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron campos para actualizar' });
      }
  
      // ✅ Validar productos si están presentes
      if (updates.products) {
        if (!Array.isArray(updates.products) || updates.products.length === 0) {
          return res.status(400).json({ message: 'El array de productos no puede estar vacío' });
        }
  
        for (let i = 0; i < updates.products.length; i++) {
          const { product, quantity, subtotal } = updates.products[i];
          if (!product || !quantity || !subtotal) {
            return res.status(400).json({
              message: `Faltan campos en el producto #${i + 1} (se requiere: product, cantidad, subtotal)`
            });
          }
        }
      }
  
      // 🛠️ Actualizar solo los campos presentes
      const updatedBudget = await Budget.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      )
        .populate('client', 'nombre apellidos')
        .populate('technician', 'username')
        .populate('products.product', 'name code currency')
        .populate('work', 'tipo estado');
  
      if (!updatedBudget) {
        return res.status(404).json({ message: 'Presupuesto no encontrado' });
      }
  
      res.status(200).json(updatedBudget);
    } catch (error) {
      console.error('Error al actualizar presupuesto parcialmente:', error);
      res.status(500).json({ message: 'Error interno del servidor al actualizar el presupuesto' });
    }
  };    
  
  const updateBudgetStatus = async (req, res) => {  // pendientes de utilizacion en el frontend
    const { id } = req.params;
    const { estado } = req.body;
  
    const estadosValidos = ['pendiente', 'aprobado', 'rechazado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido. Debe ser pendiente, aprobado o rechazado' });
    }
  
    try {
      const budget = await Budget.findById(id);
      if (!budget) {
        return res.status(404).json({ message: 'Presupuesto no encontrado' });
      }
  
      budget.estado = estado;
      await budget.save();
  
      res.status(200).json({ message: `Estado actualizado a ${estado}`, presupuesto: budget });
    } catch (error) {
      console.error('Error al actualizar el estado del presupuesto:', error);
      res.status(500).json({ message: 'Error al actualizar el estado del presupuesto' });
    }
  };
  

module.exports = {
  createBudget, getBudgets, getAllBudgets, getBudgetById, getBudgetsDetail, deleteBudgetForId, updateBudget, updateBudgetStatus, updateBudgetPartial
};
