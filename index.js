// lấy phần tử html
const input = document.getElementById("todo-input");
const btnAdd = document.getElementById("add-btn");
const list = document.getElementById("todo-list");
const fillterAll = document.getElementById("fillter-all");
const fillterActive = document.getElementById("fillter-active");
const fillterDone = document.getElementById("fillter-done");
const count = document.getElementById("count");

//
let todos = [];
let fillter = "all";

// Lưu dữ liệu vào localStorage
function saveTodo() {
  localStorage.setItem("todos", JSON.stringify(todos));
}
//lấy dữ liệu từ localStorage
function loadTodo() {
  const data = localStorage.getItem("todos");
  //nếu có data
  if (data) {
    todos = JSON.parse(data);
  }
}

//========render danh sách công việc===============
function renderTodo() {
  list.innerHTML = "";
  let fillteredTodos = todos;
  if (fillter === "active") {
    fillteredTodos = todos.filter((t) => !t.done);
  } else if (fillter === "done") {
    fillteredTodos = todos.filter((t) => t.done);
  }

  //
  fillteredTodos.forEach((todo, index) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = todo.text;
    li.appendChild(span);

    if (todo.done) {
      li.classList.add("done");
    }

    //Khi click vào công việc => toggle done
    li.addEventListener("click", () => {
      // đang sửa thì không toggle
      if (li.querySelector(".edit-input")) return;
      todo.done = !todo.done;
      saveTodo();
      renderTodo();
    });

    //Tạo div chứa hai nút
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "actions";
    // ==============Nút sửa=============
    const editBtn = document.createElement("button");
    editBtn.textContent = "Sửa";
    editBtn.className = "edit-btn";

    editBtn.addEventListener("click", (e) => {
      //ngăn chặn lan ra li
      e.stopPropagation();

      // Nếu đang ở trạng thái "Sửa", chuyển sang input
      if (editBtn.textContent === "Sửa") {
        const inputEdit = document.createElement("input");
        inputEdit.type = "text";
        inputEdit.value = todo.text;
        inputEdit.className = "edit-input";
        //Ngăn chặn lan ra li
        inputEdit.addEventListener("click", (e) => {
          e.stopPropagation();
        });

        // Chèn input trước actionsDiv rồi xóa span
        li.insertBefore(inputEdit, actionsDiv);
        li.removeChild(span);
        editBtn.textContent = "Lưu";
        inputEdit.focus();

        // Khi ấn lưu hoặc Enter
        const saveChange = () => {
          const newText = inputEdit.value.trim();
          if (newText !== "") {
            todo.text = newText;
            saveTodo();
            renderTodo();
          }
        };
        const saveClick = (e) => {
          e.stopPropagation();
          saveChange();
          //Gỡ sau khi dùng
          editBtn.removeEventListener("click", saveClick);
        };
        editBtn.addEventListener("click", saveClick);
        //Khi ấn enter
        inputEdit.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            saveChange();
          }
        });

        return;
      }
    });

    //Nút xóa
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Xóa";
    deleteBtn.className = "delete-btn";
    //lắng nghe sự kiện click
    deleteBtn.addEventListener("click", (e) => {
      //ngăn chặn lan ra li
      e.stopPropagation();
      // xóa đi 1 phần tử tại vị trí index
      console.log(todos);
      todos.splice(index, 1);
      console.log(index);
      saveTodo();
      renderTodo();
    });

    //Thêm nút vào thẻ div
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    //thêm nút vào li
    li.appendChild(actionsDiv);
    list.appendChild(li);
  });

  //Cập nhật số lượng công việc chưa hoàn thành
  const remaining = todos.filter((t) => !t.done).length;
  count.textContent = `Còn lại ${remaining}`;
}

// ==================== Thêm công việc mới ==================
function addTodo() {
  const text = input.value.trim();
  if (text === "") return alert("Vui lòng nhập công việc!");
  todos.push({ text, done: false });
  input.value = "";
  saveTodo();
  renderTodo();
}

// ============Gắn sự kiện==========
btnAdd.addEventListener("click", addTodo);
//khi ấn enter
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTodo();
  }
});

// khi ấn vào các nút lọc
fillterAll.addEventListener("click", () => {
  fillter = "all";
  renderTodo();
});
fillterActive.addEventListener("click", () => {
  fillter = "active";
  renderTodo();
});
fillterDone.addEventListener("click", () => {
  fillter = "done";
  renderTodo();
});

//================Khởi tạo ============
loadTodo();
renderTodo();
