const STORAGE_KEY = "focus-task-tracker-v1";

const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");
const emptyState = document.querySelector("#emptyState");
const filterButtons = document.querySelectorAll(".filter");
const clearCompletedButton = document.querySelector("#clearCompleted");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function updateSummary() {
  document.querySelector("#totalCount").textContent = tasks.length;
  document.querySelector("#activeCount").textContent = tasks.filter(task => !task.completed).length;
  document.querySelector("#doneCount").textContent = tasks.filter(task => task.completed).length;
}

function renderTasks() {
  taskList.innerHTML = "";
  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.text} as ${task.completed ? "not completed" : "completed"}`);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, text, deleteButton);
    taskList.append(item);
  });

  emptyState.hidden = visibleTasks.length > 0;
  updateSummary();
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.unshift({ id: crypto.randomUUID(), text, completed: false });
  saveTasks();
  taskInput.value = "";
  taskInput.focus();
  renderTasks();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(item => item.classList.toggle("active", item === button));
    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

const now = new Date();
document.querySelector("#today").textContent = now.toLocaleDateString("en", {
  weekday: "short", month: "short", day: "numeric"
});
document.querySelector("#shortDate").textContent = now.toLocaleDateString("en", {
  month: "short", day: "numeric", year: "numeric"
});

renderTasks();
