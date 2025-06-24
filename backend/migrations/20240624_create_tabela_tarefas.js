exports.up = function(knex) {
  return knex.schema.createTable('TabelaTarefas', table => {
    table.increments('idTarefa').primary();
    table.string('Descricao', 254).notNullable();
    table.datetime('TimestampInclusao').defaultTo(knex.fn.now());
    table.datetime('TimestampPrazo');
    table.datetime('TimestampRealizacao');
    table.datetime('TimestampExclusao');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('TabelaTarefas');
};
