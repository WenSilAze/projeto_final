const db = require('../db/connection');

module.exports = {
  async listar(req, res) {
    const tarefas = await db('TabelaTarefas').whereNull('TimestampExclusao');
    res.json(tarefas);
  },

  async criar(req, res) {
    const { Descricao, TimestampPrazo } = req.body;
    const [id] = await db('TabelaTarefas').insert({ Descricao, TimestampPrazo });
    res.json({ id });
  },

  async atualizar(req, res) {
    const { id } = req.params;
    const dados = req.body;
    await db('TabelaTarefas').where('idTarefa', id).update(dados);
    res.sendStatus(204);
  },

  async excluir(req, res) {
    const { id } = req.params;
    await db('TabelaTarefas').where('idTarefa', id).update({ TimestampExclusao: db.fn.now() });
    res.sendStatus(204);
  }
};
