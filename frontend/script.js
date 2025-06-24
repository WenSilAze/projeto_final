const lista = document.getElementById('listaTarefas');
const form = document.getElementById('formTarefa');

async function carregarTarefas() {
  const resp = await fetch('http://localhost:3000/api/tarefas');
  const tarefas = await resp.json();
  lista.innerHTML = '';
  tarefas.forEach(t => {
    const li = document.createElement('li');
    li.textContent = t.Descricao;
    lista.appendChild(li);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const descricao = document.getElementById('descricao').value;
  await fetch('http://localhost:3000/api/tarefas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Descricao: descricao })
  });
  document.getElementById('descricao').value = '';
  carregarTarefas();
});

carregarTarefas();