# projeto_final

Integrantes do grupo:

Wendel Silva
Gustavo Pereira
Matheus Tinel
Matheus Alves

---

## Visão Geral da Aplicação

A aplicação é dividida em duas partes:

1. **Backend (Node.js + Express + Knex + MySQL2)**  
   Responsável por fornecer uma API REST para realizar operações CRUD (Criar, Ler, Atualizar e "Excluir" de forma lógica) em uma tabela de tarefas no banco de dados MySQL.

2. **Frontend (HTML + CSS + JavaScript)**  
   Uma interface que consome a API do backend para possibilitar que o usuário crie, visualize, edite e exclua tarefas por meio de um navegador.

---

## Backend

### 1. Arquivos de Configuração

- **`.env`**  
  Armazena as informações de configuração do banco de dados (host, usuário, senha e nome do banco), mantendo esses dados separados do código-fonte.  
  **Exemplo:**  
  ```env
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=sua_senha
  DB_NAME=nome_do_banco
  ```

- **`knexfile.js`**  
  Configura o Knex para usar o MySQL2 como client com as informações do arquivo `.env`. Dessa forma, o Knex sabe como se conectar ao seu banco de dados.  
  **Exemplo:**  
  ```js
  require('dotenv').config();

  module.exports = {
    development: {
      client: 'mysql2',
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      }
    }
  };
  ```

### 2. Conexão e Migração do Banco

- **`db/connection.js`**  
  Inicializa o Knex usando as configurações definidas no `knexfile.js` e exporta essa conexão para ser utilizada pelo restante do código.  
  ```js
  const knex = require('knex');
  const config = require('../knexfile');

  const connection = knex(config.development);

  module.exports = connection;
  ```

- **Migration (ex: `migrations/20240624_create_tabela_tarefas.js`)**  
  Define a estrutura da tabela `TabelaTarefas` que conterá:
  - `idTarefa`: chave primária com auto incremento.
  - `Descricao`: descrição da tarefa, do tipo `VARCHAR(254)` e obrigatória.
  - `TimestampInclusao`: armazena a data/hora de inclusão da tarefa (inicializado com o horário atual por padrão).
  - `TimestampPrazo`, `TimestampRealizacao` e `TimestampExclusao`: usam o tipo `DATETIME` para outras datas relevantes.
  
  **Exemplo de migration:**
  ```js
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
  ```

### 3. Estrutura da API REST

- **`controllers/tarefasController.js`**  
  Aqui estão implementados os métodos para executar as operações CRUD:
  - `listar`: Seleciona todas as tarefas não marcadas como excluídas.
  - `criar`: Insere uma nova tarefa (recebendo descrição e prazo).
  - `atualizar`: Atualiza os dados da tarefa conforme o `id`.
  - `excluir`: Ao invés de remover fisicamente, marca a tarefa como excluída atualizando o campo `TimestampExclusao`.
  
  **Exemplo:**
  ```js
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
  ```

- **`routes/tarefas.js`**  
  Define as rotas para os endpoints da API, mapeando as URLs para os métodos do controller:  
  ```js
  const express = require('express');
  const router = express.Router();
  const controller = require('../controllers/tarefasController');

  router.get('/', controller.listar);
  router.post('/', controller.criar);
  router.put('/:id', controller.atualizar);
  router.delete('/:id', controller.excluir);

  module.exports = router;
  ```

- **`index.js`**  
  É o ponto de entrada do backend. Aqui o Express é configurado com:
  - **CORS** para permitir requisições de origens diferentes (necessário para o frontend).
  - **express.json()** para interpretar requisições com corpo em JSON.
  - Inclusão das rotas definidas para `/tarefas`.
  
  O servidor é iniciado na porta 3000.  
  ```js
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
  ```

---

## Frontend

### 1. Estrutura HTML
- **`index.html`**  
  Contém a estrutura básica da interface:
  - Um formulário para cadastrar novas tarefas.
  - Um elemento `<ul>` para listar as tarefas cadastradas.
  - Referência ao arquivo de CSS para o estilo e ao JavaScript para a lógica.  
  ```html
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Gerenciador de Tarefas</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="container">
      <h1>Tarefas</h1>

      <form id="form-tarefa">
        <input type="text" id="descricao" placeholder="Descrição da tarefa" required />
        <input type="datetime-local" id="prazo" />
        <button type="submit">Adicionar</button>
      </form>

      <ul id="lista-tarefas"></ul>
    </div>

    <script src="script.js"></script>
  </body>
  </html>
  ```

### 2. Estilização com CSS
- **`style.css`**  
  Define estilos simples para a página, melhorando a visualização:
  - Estilos para o corpo, container, formulário e botões.
  - Personalização dos elementos da lista de tarefas.  
  ```css
  body {
    font-family: sans-serif;
    background: #f0f0f0;
    padding: 40px;
  }

  .container {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    max-width: 500px;
    margin: auto;
  }

  form {
    margin-bottom: 20px;
  }

  form input, form button {
    padding: 10px;
    margin: 5px 0;
    width: 100%;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    background: #f9f9f9;
    margin: 6px 0;
    padding: 10px;
    border-radius: 4px;
    position: relative;
  }

  button.excluir, button.concluir {
    margin-left: 10px;
  }
  ```

### 3. Lógica do Frontend com JavaScript
- **`script.js`**  
  Contém o código para interagir com a API:
  - **Função `carregarTarefas()`**: Busca e renderiza a lista de tarefas inseridas no banco.
  - **Função `adicionarTarefa()`**: Envia uma requisição POST para criar uma nova tarefa.
  - **Função `marcarComoConcluida()`**: Atualiza a tarefa com um timestamp indicando que foi concluída.
  - **Função `excluirTarefa()`**: Envia uma requisição DELETE para marcar a tarefa como excluída.
  - Além disso, o código intercepta o envio do formulário para cadastrar uma nova tarefa e atualiza a lista sem recarregar a página.  
  ```js
  const api = 'http://localhost:3000/tarefas';

  async function carregarTarefas() {
    const res = await fetch(api);
    const tarefas = await res.json();

    const lista = document.getElementById('lista-tarefas');
    lista.innerHTML = '';

    tarefas.forEach(tarefa => {
      const li = document.createElement('li');
      li.textContent = tarefa.Descricao;

      const btnConcluir = document.createElement('button');
      btnConcluir.textContent = 'Concluir';
      btnConcluir.classList.add('concluir');
      btnConcluir.onclick = () => marcarComoConcluida(tarefa.idTarefa);

      const btnExcluir = document.createElement('button');
      btnExcluir.textContent = 'Excluir';
      btnExcluir.classList.add('excluir');
      btnExcluir.onclick = () => excluirTarefa(tarefa.idTarefa);

      li.appendChild(btnConcluir);
      li.appendChild(btnExcluir);

      lista.appendChild(li);
    });
  }

  async function adicionarTarefa(desc, prazo) {
    await fetch(api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Descricao: desc, TimestampPrazo: prazo })
    });
    carregarTarefas();
  }

  async function marcarComoConcluida(id) {
    await fetch(`${api}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ TimestampRealizacao: new Date().toISOString() })
    });
    carregarTarefas();
  }

  async function excluirTarefa(id) {
    await fetch(`${api}/${id}`, { method: 'DELETE' });
    carregarTarefas();
  }

  document.getElementById('form-tarefa').addEventListener('submit', async e => {
    e.preventDefault();
    const desc = document.getElementById('descricao').value;
    const prazo = document.getElementById('prazo').value;
    await adicionarTarefa(desc, prazo);
    e.target.reset();
  });

  carregarTarefas();
  ```

---

## Resumo

- **Backend:**  
  - Configura o ambiente e conexão com o banco de dados.
  - Define a tabela de tarefas através de uma *migration*.
  - Implementa uma API REST com rotas e controllers para gerenciar as tarefas.

- **Frontend:**  
  - Exibe um formulário para criação e uma lista para visualização das tarefas.
  - Utiliza `fetch()` para realizar as operações CRUD, consumindo a API do backend.

Essa arquitetura modular facilita a manutenção e a escalabilidade do projeto, pois a API pode evoluir independentemente da interface visual.