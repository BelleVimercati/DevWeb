const API = "http://localhost:8000";
loadTodos();

/* async function debugSession() {
  console.log("=== DEBUG SESSION ===");

  // Verifica cookies
  console.log("Cookies:", document.cookie);

  // Testa a sessão diretamente
  try {
    const response = await fetch(`${API}/check_session.php`, {
      credentials: "include",
    });
    console.log("Status:", response.status);
    const data = await response.text();
    console.log("Resposta crua:", data);

    const parsedData = JSON.parse(data);
    console.log("Dados parseados:", parsedData);

    return parsedData;
  } catch (error) {
    console.error("Erro no debug:", error);
  }
} */

async function checkIfLoggedIn() {
  try {
    const r = await fetch(`${API}/check_session.php`, {
      credentials: "include",
    });

    if (r.ok) {
      const data = await r.json();
      if (data.logged) {
        window.location.href = "home.html";
      }
    }
  } catch (error) {
    console.log("Usuário não logado ou servidor offline");
  }
}

// Login
document
  .getElementById("login-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("login-message");

    try {
      const response = await fetch(`${API}/login.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        window.location.href = "home.html";
      } else {
        message.textContent = data.error || "Erro no login";
        message.style.color = "red";
      }
    } catch (error) {
      message.textContent = "Erro de conexão";
      message.style.color = "red";
    }
  });

// Verifica uma vez ao carregar a página
checkIfLoggedIn();

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

    console.log("TODOs carregados:", data.todos); // Debug

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
      ul.innerHTML = '<li style="color: #666;">Nenhuma tarefa encontrada</li>';
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
