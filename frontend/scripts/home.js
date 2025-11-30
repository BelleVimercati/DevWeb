const API = "http://localhost:8000";
loadTodos();

let editId = null;


async function logout() {
  await fetch(`${API}/logout.php`, {
    credentials: "include",
  });

  window.location = "/frontend/";
}

function openEditModal(id, title) {
  editId = id;
  document.getElementById("editTodoTitle").value = title;

  const modal = new bootstrap.Modal(document.getElementById("editTodoModal"));
  modal.show();
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

    <div class="todo-actions">
        <button class="btn btn-warning btn-sm" onclick="openEditModal(${
          t.id
        }, '${t.title.replace(
          /'/g,
          "\\'"
        )}')"><i class="bi bi-pencil-square"></i></button>
        <button class="btn btn-success btn-sm" onclick="askDelete(${
          t.id
        })"><i class="bi bi-check-lg"></i></button>
    </div>
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

document
  .getElementById("confirmDeleteBtn")
  .addEventListener("click", async () => {
    if (deleteId !== null) {
      await deleteTodo(deleteId);
      deleteId = null;

      // Fecha o modal
      const modalEl = document.getElementById("confirmDeleteModal");
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();
    }
  });
let deleteId = null;

function askDelete(id) {
  deleteId = id; // guarda o ID que queremos excluir
  
  const modal = new bootstrap.Modal(
    document.getElementById("confirmDeleteModal")
  );
  modal.show();
}

document.getElementById("saveEditBtn").addEventListener("click", async () => {
  const newTitle = document.getElementById("editTodoTitle").value.trim();
  if (!newTitle) return alert("O título não pode ser vazio!");

  await fetch(`${API}/todos.php`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: editId,
      title: newTitle,
    }),
  });

  // fecha modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("editTodoModal")
  );
  modal.hide();

  // recarrega lista
  await loadTodos();
});
