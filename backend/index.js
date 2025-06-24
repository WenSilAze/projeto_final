require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const tarefasRoutes = require('./routes/tarefas');

app.use(cors());
app.use(express.json());

app.use('/tarefas', tarefasRoutes);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
