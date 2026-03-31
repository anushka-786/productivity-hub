let currentFilter = "all";

let notes = JSON.parse(localStorage.getItem("notes")) || [];
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/* SAVE TO STORAGE */
function saveData() {
  localStorage.setItem("notes", JSON.stringify(notes));
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* PAGE SWITCHING */
function showPage(page) {
  document.getElementById("notesPage").classList.remove("active");
  document.getElementById("tasksPage").classList.remove("active");

  if (page === "notes") {
    document.getElementById("notesPage").classList.add("active");
  } else {
    document.getElementById("tasksPage").classList.add("active");
  }
}

/* THEME */
function toggleTheme() {
  document.body.classList.toggle("dark");

  let isDark = document.body.classList.contains("dark");

  localStorage.setItem("theme", isDark ? "dark" : "light");

  document.getElementById("themeBtn").innerText = isDark ? "☀️" : "🌙";
}

/* ---------------- NOTES ---------------- */

function addNote() {
  let title = document.getElementById("noteTitle").value.trim();
  let content = document.getElementById("noteContent").value.trim();
  let tagInput = document.getElementById("noteTag").value.trim();
  let color = document.getElementById("noteColor").value;

  if (!title || !content) return;

  let tag = tagInput === "" ? "general" : tagInput.toLowerCase();

  notes.push({
    id: Date.now(),
    title,
    content,
    tag,
    pinned: false,
    color
  });

  saveData();
  clearInputs();
  renderNotes();
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  saveData();
  renderNotes();
}

/* PIN */
function togglePin(id) {
  notes = notes.map(note =>
    note.id === id ? { ...note, pinned: !note.pinned } : note
  );

  saveData();
  renderNotes();
}

/* FILTER */
function filterNotes(tag) {
  currentFilter = tag.toLowerCase();
  renderNotes();
}

/* RENDER NOTES */
function renderNotes() {
  let container = document.getElementById("notesContainer");
  container.innerHTML = "";

  let searchText =
    document.getElementById("searchInput")?.value.toLowerCase() || "";

  let filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchText) ||
    note.content.toLowerCase().includes(searchText) ||
    note.tag.toLowerCase().includes(searchText)
  );

  if (currentFilter !== "all") {
    filteredNotes = filteredNotes.filter(note =>
      (note.tag || "general") === currentFilter
    );
  }

  let pinnedNotes = filteredNotes.filter(n => n.pinned);
  let otherNotes = filteredNotes.filter(n => !n.pinned);

  pinnedNotes.sort((a, b) => b.id - a.id);
  otherNotes.sort((a, b) => b.id - a.id);

  if (pinnedNotes.length > 0) {
    let title = document.createElement("h3");
    title.innerText = "📌 Pinned";
    container.appendChild(title);

    pinnedNotes.forEach(note =>
      container.appendChild(createNoteCard(note))
    );
  }

  if (otherNotes.length > 0) {
    let title = document.createElement("h3");
    title.innerText = "📝 Others";
    container.appendChild(title);

    otherNotes.forEach(note =>
      container.appendChild(createNoteCard(note))
    );
  }
}

/* NOTE CARD (FIXED) */
function createNoteCard(note) {
  let div = document.createElement("div");
  div.classList.add("card");
  div.style.backgroundColor = note.color || "#ffffff";

  // click anywhere → open note
  div.onclick = () => viewNote(note.id);

  div.innerHTML = `
    <h3>${note.title}</h3>
    <p>${note.content}</p>
    <small>#${note.tag}</small>
    <br>

    <button onclick="event.stopPropagation(); togglePin(${note.id})">
      ${note.pinned ? "Unpin 📌" : "Pin 📌"}
    </button>

    <button onclick="event.stopPropagation(); exportSingleNote(${note.id})">
      Export 📄
    </button>

    <button onclick="event.stopPropagation(); deleteNote(${note.id})">
      Delete
    </button>
  `;

  return div;
}

/* ---------------- TASKS ---------------- */

function addTask() {
  let taskInput = document.getElementById("taskInput").value.trim();

  if (!taskInput) return;

  tasks.push({
    id: Date.now(),
    text: taskInput,
    done: false
  });

  saveData();
  document.getElementById("taskInput").value = "";
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveData();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, done: !task.done } : task
  );

  saveData();
  renderTasks();
}

function renderTasks() {
  let container = document.getElementById("tasksContainer");
  container.innerHTML = "";

  tasks.forEach(task => {
    let div = document.createElement("div");
    div.classList.add("card");

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        
        <div style="display:flex; gap:10px; align-items:center;">
          <input type="checkbox" onchange="toggleTask(${task.id})" ${task.done ? "checked" : ""}>
          <span style="text-decoration:${task.done ? "line-through" : "none"}">
            ${task.text}
          </span>
        </div>

        <button onclick="deleteTask(${task.id})">Delete</button>

      </div>
    `;

    container.appendChild(div);
  });
}

/* CLEAR INPUTS */
function clearInputs() {
  document.getElementById("noteTitle").value = "";
  document.getElementById("noteContent").value = "";
  document.getElementById("noteTag").value = "";
}

/* ---------------- MODAL ---------------- */

let currentEditId = null;

function viewNote(id) {
  let note = notes.find(n => n.id === id);

  currentEditId = id;

  document.getElementById("editTitle").value = note.title;
  document.getElementById("editContent").value = note.content;
  document.getElementById("editTag").value = note.tag;

  document.getElementById("editModal").style.display = "flex";

  // autofocus
  setTimeout(() => {
    document.getElementById("editContent").focus();
  }, 100);
}

function closeModal() {
  document.getElementById("editModal").style.display = "none";
}

function saveEdit() {
  let note = notes.find(n => n.id === currentEditId);

  note.title = document.getElementById("editTitle").value.trim();
  note.content = document.getElementById("editContent").value.trim();
  note.tag =
    document.getElementById("editTag").value.trim().toLowerCase() || "general";

  saveData();
  renderNotes();
  closeModal();
}

/* INITIAL LOAD */
window.onload = function () {
  renderNotes();
  renderTasks();

  let theme = localStorage.getItem("theme");

  if (theme === "dark") {
    document.body.classList.add("dark");
    document.getElementById("themeBtn").innerText = "☀️";
  } else {
    document.getElementById("themeBtn").innerText = "🌙";
  }
};

function exportNotes() {
  if (notes.length === 0) {
    alert("No notes to export!");
    return;
  }

  let content = "MY NOTES\n\n";

  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];

    content += "Note " + (i + 1) + "\n";
    content += "Title: " + note.title + "\n";
    content += "Content: " + note.content + "\n";
    content += "Tag: " + note.tag + "\n";
    content += "Pinned: " + (note.pinned ? "Yes" : "No") + "\n";
    content += "----------------------\n\n";
  }

  let blob = new Blob([content], { type: "text/plain" });

  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "My_Notes.txt";

  link.click();
}

function exportSingleNote(id) {
  let note = notes.find(n => n.id === id);
  if (!note) return;

  let content = "";
  content += "Title: " + note.title + "\n";
  content += "Content: " + note.content + "\n";
  content += "Tag: " + note.tag + "\n";
  content += "Pinned: " + (note.pinned ? "Yes" : "No") + "\n";

  let blob = new Blob([content], { type: "text/plain" });

  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = note.title + ".txt";

  link.click();
}