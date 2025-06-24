require('dotenv').config();
const express = require('express');
const cors = require('cors');
const tarefasRoutes = require('./routes/tarefas');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/tarefas', tarefasRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
