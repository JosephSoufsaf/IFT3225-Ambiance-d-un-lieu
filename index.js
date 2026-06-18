const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');

const devicesRouter = require('./Routes/devicesRouter');
const collectRouter = require('./Routes/collectRouter');
const ambianceRouter = require('./Routes/ambianceRouter');

const app = express();
app.use(express.json());

app.use('/', devicesRouter);
app.use('/', collectRouter);
app.use('/', ambianceRouter);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch((err) => console.log(err));

app.listen(process.env.PORT, () => {
    console.log(`Serveur démarré sur le port ${process.env.PORT}`);
});