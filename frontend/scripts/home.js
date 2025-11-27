const API = "http://localhost:8000";
loadTodos();

async function logout() {
  await fetch(`${API}/auth/logout.php`, {
    credentials: "include",
  });

  window.location = "/frontend/";
}

async function addTodoSimple() {
  const titleInput = document.getElementById("todo-title");
  const title = titleInput.value.trim();

  if (!title) return;

  try {
    const button = document.querySelector(".botao");
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Adicionando...";

    const response = await fetch(`${API}/todos.php`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (response.ok) {
      const data = await response.json();
      titleInput.value = "";

      // Recarrega a lista completa para mostrar o novo item
      await loadTodos();

      console.log("TODO adicionado com ID:", data.id);
    } else {
      console.error("Erro na resposta do servidor");
    }
  } catch (error) {
    console.error("Erro ao adicionar TODO:", error);
  } finally {
    const button = document.querySelector(".botao");
    button.disabled = false;
    button.textContent = "Adicionar";
  }
}

// Função loadTodos atualizada para debug
async function loadTodos() {
  try {
    const r = await fetch(`${API}/todos.php`, { credentials: "include" });
    const data = await r.json();
    const ul = document.getElementById("todo-list");
    ul.innerHTML = "";

    if (data.todos && data.todos.length > 0) {
      data.todos.forEach((t) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${t.title}</span>
          <button onclick="deleteTodo(${t.id})">✓</button>
        `;
        ul.appendChild(li);
      });
    } else {
      ul.innerHTML = '<li style="color: #fff;">Nenhuma tarefa encontrada</li>';
    }
  } catch (error) {
    console.error("Erro ao carregar TODOs:", error);
  }
}

async function deleteTodo(id) {
  if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

  try {
    await fetch(`${API}/todos.php`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    // Recarrega a lista após excluir
    await loadTodos();
  } catch (error) {
    console.error("Erro ao excluir TODO:", error);
  }
}