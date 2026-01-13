const mongoose = require('mongoose');
require('dotenv').config();

module.exports = (client) => {
    client.log = require('./logs.js');

    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
        return client.log.warn('No se detectó una URL de MongoDB en su archivo .env. Verifique el valor de MONGODB_URI.');
    }

    mongoose.connect(mongoURI)
        .then(() => {
            client.log.success('La conexión a MongoDB fue exitosa');
        })
        .catch((error) => {
            client.log.error(`No se pudo conectar a MongoDB: ${error.message}`);
        });
};
