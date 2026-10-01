const API_URL = "https://jsonplaceholder.typicode.com/users";

const form = document.getElementById("userForm");
const userId = document.getElementById("userId");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const userList = document.getElementById("userList");
const loading = document.getElementById("loading");
const statusBox = document.getElementById("status");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const refreshBtn = document.getElementById("refreshBtn");

function setLoading(isLoading) {
  loading.classList.toggle("hidden", !isLoading);
}

function showStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.classList.remove("hidden", "error");
  if (isError) statusBox.classList.add("error");

  setTimeout(() => statusBox.classList.add("hidden"), 3000);
}

function resetForm() {
  form.reset();
  userId.value = "";
  formTitle.textContent = "Add User";
  submitBtn.textContent = "Add User";
  cancelBtn.classList.add("hidden");
}

async function getUsers() {
  setLoading(true);
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`GET failed: ${response.status}`);
    }

    const users = await response.json();
    renderUsers(users);
  } catch (error) {
    showStatus(`Error loading users: ${error.message}`, true);
  } finally {
    setLoading(false);
  }
}

function renderUsers(users) {
  userList.innerHTML = "";

  users.slice(0, 10).forEach(user => {
    const item = document.createElement("div");
    item.className = "user";

    item.innerHTML = `
      <div class="user-info">
        <strong>${escapeHtml(user.name)}</strong>
        <span>${escapeHtml(user.email)}</span>
      </div>
      <div class="actions">
        <button onclick="editUser(${user.id}, '${escapeJs(user.name)}', '${escapeJs(user.email)}')">
          Edit
        </button>
        <button class="danger" onclick="deleteUser(${user.id})">
          Delete
        </button>
      </div>
    `;

    userList.appendChild(item);
  });
}

async function createUser(name, email) {
  setLoading(true);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email })
    });

    if (!response.ok) {
      throw new Error(`POST failed: ${response.status}`);
    }

    await response.json();
    showStatus("User created successfully!");
    resetForm();
    await getUsers();
  } catch (error) {
    showStatus(`Error creating user: ${error.message}`, true);
  } finally {
    setLoading(false);
  }
}

async function updateUser(id, name, email) {
  setLoading(true);

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id, name, email })
    });

    if (!response.ok) {
      throw new Error(`PUT failed: ${response.status}`);
    }

    await response.json();
    showStatus("User updated successfully!");
    resetForm();
    await getUsers();
  } catch (error) {
    showStatus(`Error updating user: ${error.message}`, true);
  } finally {
    setLoading(false);
  }
}

async function deleteUser(id) {
  if (!confirm("Delete this user?")) return;

  setLoading(true);

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error(`DELETE failed: ${response.status}`);
    }

    showStatus("User deleted successfully!");
    await getUsers();
  } catch (error) {
    showStatus(`Error deleting user: ${error.message}`, true);
  } finally {
    setLoading(false);
  }
}

function editUser(id, name, email) {
  userId.value = id;
  nameInput.value = name;
  emailInput.value = email;
  formTitle.textContent = "Update User";
  submitBtn.textContent = "Update User";
  cancelBtn.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (userId.value) {
    await updateUser(Number(userId.value), name, email);
  } else {
    await createUser(name, email);
  }
});

cancelBtn.addEventListener("click", resetForm);
refreshBtn.addEventListener("click", getUsers);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeJs(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

getUsers();
