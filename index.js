// ==== Lấy phần tử HTML ====
const input = document.getElementById("todo-input");
const btnAdd = document.getElementById("add-btn");
const list = document.getElementById("todo-list");
const filterAll = document.getElementById("filter-all");
const filterActive = document.getElementById("filter-active");
const filterDone = document.getElementById("filter-done");
const count = document.getElementById("count");

// Kiểm tra các phần tử có tồn tại không
if (
  !input ||
  !btnAdd ||
  !list ||
  !filterAll ||
  !filterActive ||
  !filterDone ||
  !count
) {
  console.error("Không tìm thấy các phần tử HTML cần thiết!");
}

let todos = [];
let filter = "all";

// ==== Local Storage ====
function saveTodo() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function loadTodo() {
  const data = localStorage.getItem("todos");
  todos = data ? JSON.parse(data) : [];
}

// ==== Cập nhật trạng thái active cho filter buttons ====
function setActiveFilter(activeBtn) {
  [filterAll, filterActive, filterDone].forEach((btn) =>
    btn.classList.remove("active")
  );
  activeBtn.classList.add("active");
}

// ==== Render danh sách công việc ====
function renderTodo() {
  list.innerHTML = "";

  // Lọc trước rồi render
  const filtered = todos.filter((todo) => {
    if (filter === "active") return !todo.done;
    if (filter === "done") return todo.done;
    return true;
  });

  filtered.forEach((todo) => {
    const li = document.createElement("li");
    if (todo.done) li.classList.add("done");

    const span = document.createElement("span");
    span.textContent = todo.text;
    li.appendChild(span);

    // Toggle trạng thái done
    li.addEventListener("click", () => {
      if (li.querySelector(".edit-input")) return; // nếu đang sửa thì bỏ qua
      todo.done = !todo.done;
      saveTodo();
      renderTodo();
    });

    // ===== Div chứa nút =====
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "actions";

    // ===== Nút sửa =====
    const editBtn = document.createElement("button");
    editBtn.textContent = "Sửa";
    editBtn.className = "edit-btn";

    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleEdit(li, span, actionsDiv, editBtn, todo);
    });

    // ===== Nút xóa =====
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Xóa";
    deleteBtn.className = "delete-btn";

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Xóa theo ID
      todos = todos.filter((t) => t.id !== todo.id);
      toast({
        title: "Thành công",
        desc: "Bạn đã xóa công việc thành công",
        type: "success",
        duration: 3000,
      });
      saveTodo();
      renderTodo();
    });

    actionsDiv.append(editBtn, deleteBtn);
    li.appendChild(actionsDiv);
    list.appendChild(li);
  });

  // Cập nhật số lượng công việc còn lại
  const remaining = todos.filter((t) => !t.done).length;
  count.textContent = `Còn lại ${remaining}`;
}

// ==== Xử lý chỉnh sửa todo ====
function handleEdit(li, span, actionsDiv, editBtn, todo) {
  // Nếu đã có input => đang ở chế độ sửa, bỏ qua
  if (li.querySelector(".edit-input")) return;

  // Tạo input sửa
  const inputEdit = document.createElement("input");
  inputEdit.type = "text";
  inputEdit.value = todo.text;
  inputEdit.className = "edit-input";

  li.insertBefore(inputEdit, actionsDiv);
  li.removeChild(span);
  editBtn.textContent = "Lưu";
  inputEdit.focus();

  // Khi click ra ngoài -> thoát chế độ sửa
  const handleClickOutside = (ev) => {
    if (!li.contains(ev.target)) {
      cancelEdit();
      document.removeEventListener("click", handleClickOutside);
    }
  };
  setTimeout(() => document.addEventListener("click", handleClickOutside), 0);

  const saveChange = () => {
    const newText = inputEdit.value.trim();
    if (newText) {
      todo.text = newText;
      saveTodo();
      renderTodo();
    } else {
      cancelEdit();
    }
  };

  // Hàm hủy sửa
  const cancelEdit = () => {
    if (li.contains(inputEdit)) {
      li.removeChild(inputEdit);
      li.insertBefore(span, actionsDiv);
      editBtn.textContent = "Sửa";
    }
  };

  inputEdit.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveChange();
    if (e.key === "Escape") cancelEdit();
  });

  // Khi nhấn Lưu
  const handleSaveClick = (e) => {
    e.stopPropagation();
    saveChange();
    editBtn.removeEventListener("click", handleSaveClick);
  };
  editBtn.addEventListener("click", handleSaveClick);
}

// ==== Toast message ====
function toast({ title, desc, type, duration = 3000 }) {
  const main = document.getElementById("toast");
  if (!main) return;

  const toastEl = document.createElement("div");
  const timeFades = 1000;

  const timeoutId = setTimeout(() => {
    toastEl.remove();
  }, duration + timeFades);

  // Khi close clear luôn setTimeout
  toastEl.onclick = (e) => {
    // Xem có ấn vào đúng close không
    if (e.target.closest(".toast__close")) {
      toastEl.remove();
      clearTimeout(timeoutId);
    }
  };

  const icons = {
    success: "fa-solid fa-circle-check",
    error: "fa-solid fa-exclamation",
  };
  const icon = icons[type];
  const delay = (duration / 1000).toFixed(2);
  toastEl.classList.add("toast", `toast--${type}`);
  toastEl.style.animation = `slideInLeft ease 0.3s, fadeOut linear 1s ${delay}s forwards`;
  toastEl.innerHTML = `
    <div class="toast__icon"><i class="${icon}"></i></div>
    <div class="toast__body">
      <h3 class="toast__title">${title}</h3>
      <p class="toast__msg">${desc}</p>
    </div>
    <div class="toast__close"><i class="fa-solid fa-xmark"></i></div>
  `;
  main.appendChild(toastEl);
}

// ==== Thêm công việc mới ====
function addTodo() {
  const text = input.value.trim();
  if (!text) {
    toast({
      title: "Thất bại",
      desc: "Vui lòng nhập công việc",
      type: "error",
      duration: 3000,
    });
    return;
  }

  // Thêm ID duy nhất cho mỗi todo
  todos.push({
    id: Date.now() + Math.random(), // Đảm bảo unique ID
    text,
    done: false,
  });

  toast({
    title: "Thành công",
    desc: "Đã thêm công việc thành công",
    type: "success",
    duration: 3000,
  });
  input.value = "";
  saveTodo();
  renderTodo();
}

// ==== Gắn sự kiện ====
btnAdd.addEventListener("click", addTodo);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});

filterAll.addEventListener("click", () => {
  filter = "all";
  setActiveFilter(filterAll);
  renderTodo();
});

filterActive.addEventListener("click", () => {
  filter = "active";
  setActiveFilter(filterActive);
  renderTodo();
});

filterDone.addEventListener("click", () => {
  filter = "done";
  setActiveFilter(filterDone);
  renderTodo();
});

// ==== Khởi tạo ====
loadTodo();
renderTodo();
setActiveFilter(filterAll); // Set trạng thái ban đầu
