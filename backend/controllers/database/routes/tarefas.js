const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile').development);

// GET todas as tarefas
router.get('/', async (req, res) => {
  const tarefas = await knex('tarefas');
  res.json(tarefas);
});

// POST nova tarefa
router.post('/', async (req, res) => {
  const novaTarefa = await knex('tarefas').insert(req.body);
  res.json({ id: novaTarefa[0] });
});

// PUT atualizar tarefa
router.put('/:id', async (req, res) => {
  await knex('tarefas').where('idTarefa', req.params.id).update(req.body);
  res.json({ atualizado: true });
});

// DELETE excluir tarefa
router.delete('/:id', async (req, res) => {
  await knex('tarefas').where('idTarefa', req.params.id).del();
  res.json({ excluido: true });
});

module.exports = router;
