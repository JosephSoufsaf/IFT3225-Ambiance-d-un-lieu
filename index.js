const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const devicesRouter = require('./Routes/devicesRouter');
const collectRouter = require('./Routes/collectRouter');
const ambianceRouter = require('./Routes/ambianceRouter');
const userRouter = require('./Routes/userRouter');

const app = express();
app.use(express.json());

app.use('/api', userRouter);
app.use('/api', devicesRouter);
app.use('/api', collectRouter);
app.use('/api', ambianceRouter);

const clientBuildPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientBuildPath));

app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'))
})

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch((err) => console.log(err));

app.listen(process.env.PORT, () => {
    console.log(`Serveur démarré sur le port ${process.env.PORT}`);
});