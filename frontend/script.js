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
