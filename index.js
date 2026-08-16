const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const devicesRouter = require('./Routes/devicesRouter');
const { router: collectRouter } = require('./Routes/collectRouter');
const { router: ambianceRouter } = require('./Routes/ambianceRouter');
const { router: userRouter } = require('./Routes/userRouter');
const { router : locationRouter} = require('./Routes/locationRouter');

const app = express();

const allowedOrigins = [
    // Utilisation locale
    'http://localhost:7000',
    // Render Test
    'https://ift3225-ambiance-d-un-lieu-2-4prn.onrender.com', // Backend test
    'https://frontend-test-2-d8sx.onrender.com', // Frontend test
    //Render officiel
    'https://ift3225-ambiance-d-un-lieu.onrender.com', // Backend
    'https://frontend-x6nx.onrender.com', // Frontend
];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

app.use(express.json());


app.use('/api', userRouter);
app.use('/api', devicesRouter);
app.use('/api', collectRouter);
app.use('/api', ambianceRouter);
app.use('/api', locationRouter);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch((err) => console.log(err));

app.listen(process.env.PORT, () => {
    console.log(`Serveur démarré sur le port ${process.env.PORT}`);
});
