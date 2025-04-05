const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Work = require('./models/Work'); // Asegúrate de que la ruta sea correcta
dotenv.config();

const tecnicoId = new mongoose.Types.ObjectId('67ed2abfb166dbcb290f81eb'); // ID del técnico

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conexión exitosa a la base de datos');
  })
  .catch((error) => {
    console.error('Error al conectar a la base de datos', error);
    process.exit(1);
  });

async function updateWorkDocuments() {
  try {
    // Comprobar si hay trabajos que necesitan actualización (trabajos con técnico asignado)
    const worksToUpdate = await Work.find({ tecnico: { $exists: true } });
    console.log(`Se encontraron ${worksToUpdate.length} trabajos con técnico asignado`);

    // Actualiza los documentos de "Work" para incluir los nuevos campos (fecha y hora)
    const result = await Work.updateMany(
      { tecnico: { $exists: true } }, // Filtramos los trabajos que tienen técnico asignado
      {
        $set: {
          fechaComienzo: null,
          fechaFinalizacion: null,
          horaComienzo: '',
          horaFinalizacion: '',
        },
      }
    );

    console.log(`Se actualizaron ${result.nModified} documentos`);

    // Asignar un técnico a los trabajos que no tienen técnico
    const resultUpdateTecnico = await Work.updateMany(
      { tecnico: { $exists: false } }, // Para trabajos sin técnico asignado
      {
        $set: { tecnico: tecnicoId }, // Asignamos el ID del técnico
      }
    );

    console.log(`Se asignaron técnicos a ${resultUpdateTecnico.nModified} trabajos`);

  } catch (error) {
    console.error('Error durante la migración', error);
  } finally {
    mongoose.connection.close(); // Cerrar la conexión después de la migración
  }
}

updateWorkDocuments();
