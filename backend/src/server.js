const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Servir frontend estático desde carpeta frontend
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

app.use('/api', routes);

app.use(errorHandler);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Tienda backend escuchando en puerto ${PORT}`));
