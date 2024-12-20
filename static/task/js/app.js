// CSRF Token function
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Function to get tasks, with optional search query
function getTasks(query = '') {
    let url = `tasks/`; // Base URL

    // If there is a search query, append it to the URL
    if (query) {
        url += `?q=${encodeURIComponent(query)}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateTaskLists(data);
        })
        .catch(error => console.error('Error:', error));
}

// Function to update the UI with the fetched tasks
function updateTaskLists(data) {
    const todoContainer = document.getElementById('v-pills-home');
    const doneContainer = document.getElementById('v-pills-profile');

    // H:i formatda vaqt
    let time = (today) => {
        const createdAt = new Date(today);
        return createdAt.toLocaleTimeString('en-GB', {hour: "2-digit", minute: "2-digit"});
    }

    todoContainer.innerHTML = '';
    doneContainer.innerHTML = '';

    // TODO ro'yxatini chiqarish
    if (data.todo_objects.length > 0) {
        data.todo_objects.forEach(task => {
            todoContainer.innerHTML += `
                <div class="reminder-item">
                    <input type="radio" id="todo-${task.id}" name="reminder">
                    <label for="todo-${task.id}" class="reminder-border-bottom">
                        <input type="hidden" value="${task.id}">
                        <strong class="poppins-bold">${task.title}
                            <i class="bi bi-info-circle float-end" data-bs-toggle="dropdown" aria-expanded="false"></i>
                            <ul class="dropdown-menu">
                              <li>
                                  <a class="dropdown-item" href="#" 
                                      data-bs-toggle="modal" 
                                      data-bs-target="#editModal"
                                      data-bs-id="${task.id}"
                                      data-bs-title="${task.title}"
                                      data-bs-description="${task.description}"
                                      data-bs-is-done="${task.is_done}"
                                  >
                                    Edit
                                  </a>
                              </li>
                              <li>
                                  <a class="dropdown-item text-danger" href="#" onclick="openDeleteModal(${task.id})">
                                  Delete
                                  </a>
                              </li>
                            </ul>
                        </strong>
                        <p class="poppins-light">${task.description}</p>
                        <span class="reminder-time poppins-medium">Vaqti – <span class="time">${time(task.created_at)}</span></span>
                    </label>
                </div>`;
        });
    } else {
        todoContainer.innerHTML += `Bajarish uchun hech qanday topshiriq mavjud emas`;
    }

    // DONE ro'yxatini chiqarish
    if (data.done_objects.length > 0) {
        data.done_objects.forEach(task => {
            doneContainer.innerHTML += `
                <div class="reminder-item">
                    <input type="radio" id="done-${task.id}" name="reminder">
                    <label for="done-${task.id}" class="reminder-border-bottom">
                        <input type="hidden" value="${task.id}">
                        <strong class="poppins-bold">${task.title}
                            <i class="bi bi-info-circle float-end" data-bs-toggle="dropdown" aria-expanded="false"></i>
                            <ul class="dropdown-menu">
                              <li>
                                  <a class="dropdown-item" href="#" 
                                  data-bs-toggle="modal" 
                                  data-bs-target="#editModal"
                                  data-bs-id="${task.id}"
                                  data-bs-title="${task.title}"
                                  data-bs-description="${task.description}"
                                  data-bs-is-done="${task.is_done}"
                                  
                                  
                                  >
                                  Edit
                                  </a>
                              </li>
                              <li>
                                  <a class="dropdown-item text-danger" href="#" onclick="openDeleteModal(${task.id})">
                                    Delete
                                  </a>
                              </li>
                            </ul>
                        </strong>
                        <p class="poppins-light">${task.description}</p>
                        <span class="reminder-time poppins-medium">Vaqti – <span class="time">${time(task.created_at)}</span></span>
                    </label>
                </div>`;
        });
    } else {
        doneContainer.innerHTML += `Bajarilgan topshiriqlar mavjud emas`;
    }
    attachRadioListeners();
}

// O'chirish modalini ochish va tasdiqlash
function openDeleteModal(taskId) {
    document.getElementById('taskIdToDelete').value = taskId;  // O'chirish uchun ID saqlanadi
    let deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}

// Modalni yopish uchun Bootstrap modal obyekti
const deleteModalElement = document.getElementById('deleteModal');
const deleteModal = new bootstrap.Modal(deleteModalElement);

document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
    const taskId = document.getElementById('taskIdToDelete').value;

    fetch('/task/delete/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({id: taskId})
    })
        .then(response => response.json())
        .then(data => {
            console.log(data); // Javobni konsolga chiqarish
            alert(data.message);

            // Agar o'chirish muvaffaqiyatli bo'lsa
            if (data.message === "Topshiriq o'chirildi.") {
                deleteModal.hide(); // Modalni yopish
                // O'chirilgandan keyin ro'yxatni yangilang
                updateTaskLists(data); // data obyektini yangilang
            }
        })
        .catch(error => console.error('Xatolik:', error));
});


// Function to handle task completion toggles
function attachRadioListeners() {
    const radios = document.querySelectorAll('input[type="radio"][name="reminder"]');
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                const label = radio.nextElementSibling;
                const taskId = label.querySelector('input').value;

                // Add 'fade-out' class to start the fading animation
                label.classList.add('fade-out');

                // Send POST request to update task status
                fetch("task-receiver/", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                        "X-CSRFToken": getCookie('csrftoken')
                    },
                    body: JSON.stringify({id: taskId})
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log("Server Javobi:", data);
                        // After the animation is complete, refresh tasks
                        setTimeout(() => {
                            getTasks();
                        }, 500); // 0.5s delay to match fade-out animation duration
                    })
                    .catch(error => console.error('Xato:', error));
            }
        });
    });
}

// Event listener for the search form
const searchInput = document.querySelector('input[name="q"]');
document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();  // Prevent the default form submission
    const query = searchInput.value;  // Get the search query
    getTasks(query);  // Fetch tasks based on the search query
});

// Function to handle interval fetching based on input value
function handleIntervalFetch() {
    const interval = setInterval(() => {
        const query = searchInput.value.trim();
        if (query) {
            getTasks(query);  // Fetch tasks based on the search query
        } else {
            getTasks();  // Fetch all tasks if no query is present
        }
    }, 5000); // Set to 5 seconds

    return interval;
}

// Start the interval fetching
let fetchInterval = handleIntervalFetch();
getTasks();  // Initial load

//------------------------ Refresh qilinganda tanlangan bo'limda qolish --------------------------

// Bo'limni tanlaganda localStorage ga yozish
const tabs = document.querySelectorAll('.nav-link');

tabs.forEach(tab => {
    tab.addEventListener('click', function () {
        localStorage.setItem('activeTab', this.id);  // Tanlangan bo'limni saqlab qo'yish
    });
});

// Sahifa yangilanganida oxirgi tanlangan bo'limni topish va aktiv qilish
document.addEventListener('DOMContentLoaded', function () {
    const activeTabId = localStorage.getItem('activeTab');

    if (activeTabId) {
        const activeTab = document.getElementById(activeTabId);
        const activePaneId = activeTab.getAttribute('data-bs-target');
        const activePane = document.querySelector(activePaneId);

        // Barcha bo'limlarni faolsizlantirish
        tabs.forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('show', 'active'));

        // Saqlangan bo'limni aktiv qilish
        activeTab.classList.add('active');
        activePane.classList.add('show', 'active');
    }
});


// CREATE TASK
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#createTaskForm');

    form.addEventListener('submit', function (event) {
        event.preventDefault();  // Prevent default form submission

        const formData = new FormData(form);  // Gather form data

        fetch(form.action, {
            method: 'POST',
            headers: {
                'X-CSRFToken': form.querySelector('input[name="csrfmiddlewaretoken"]').value,
            },
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);  // Show success or error message

                if (data.message === "Topshiriq muvoffaqiyatli yaratildi!") {
                    // Reset the form and close the modal on successful creation
                    form.reset();
                    let modal = bootstrap.Modal.getInstance(document.getElementById('createModal'));
                    modal.hide();
                    // Optionally, refresh the task list or update the UI as needed
                }
            })
            .catch(error => {
                console.error("AJAX Error:", error);
                alert("Server bilan bog'lanishda xatolik yuz berdi.");
            });
    });
});


// EDIT SCRIPT
document.addEventListener('DOMContentLoaded', function () {
    let editModal = document.getElementById('editModal');
    editModal.addEventListener('show.bs.modal', function (event) {
        let button = event.relatedTarget;
        let blogId = button.getAttribute('data-bs-id');
        let blogTitle = button.getAttribute('data-bs-title');
        let blogDescription = button.getAttribute('data-bs-description');
        let blogIsDone = button.getAttribute('data-bs-is-done') === 'true';

        console.log(blogId);
        console.log(blogTitle);
        console.log(blogDescription);
        console.log(blogIsDone);

        let id = editModal.querySelector('#editTaskId');
        let title = editModal.querySelector('#editTaskTitle');
        let description = editModal.querySelector('#editTaskDescription');
        let isDone = editModal.querySelector('#editTaskIsDone');

        id.value = blogId;
        title.value = blogTitle;
        description.value = blogDescription;
        isDone.checked = blogIsDone;
    });
});


// Handle Edit Task form submission
// Function to handle the task edit form submission
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#editTaskForm');

    form.addEventListener('submit', function (event) {
        event.preventDefault();  // Prevent default form submission

        const formData = new FormData(form);  // Gather form data

        // Add the checkbox status (is_done) manually if not in the form data
        const isDoneCheckbox = document.querySelector('#editTaskIsDone');

        if (isDoneCheckbox) {  // Check if the checkbox exists
            if (isDoneCheckbox.checked) {
                formData.set('is_done', 'true');  // If checkbox is checked, add is_done=true
            } else {
                formData.delete('is_done');  // If checkbox is unchecked, ensure is_done is not sent
            }
        }

        // Send form data to the backend
        fetch(form.action, {
            method: 'POST',
            headers: {
                'X-CSRFToken': form.querySelector('input[name="csrfmiddlewaretoken"]').value,
            },
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);  // Show success or error message

                if (data.message === "Topshiriq muvoffaqiyatli tahrirlandi!") {
                    // Reset the form and close the modal on successful creation
                    form.reset();
                    let modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
                    modal.hide();

                    // Optionally, refresh the task list or update the UI as needed
                    updateTaskListInUI(data.task); // Update the task in the UI
                }
            })
            .catch(error => {
                console.error("AJAX Error:", error);
                alert("Server bilan bog'lanishda xatolik yuz berdi.");
            });
    });
});


// Function to update the task in the UI (either ToDo or Done list)
function updateTaskListInUI(task) {
    // Determine where to place the task based on the 'is_done' status
    const todoContainer = document.getElementById('v-pills-home');
    const doneContainer = document.getElementById('v-pills-profile');

    // Get the task element based on task ID (to avoid duplicates)
    let taskElement = document.getElementById(`task-${task.id}`);

    // If task is in the ToDo list and is now marked as done
    if (!task.is_done && doneContainer.contains(taskElement)) {
        doneContainer.removeChild(taskElement);
        todoContainer.appendChild(taskElement);  // Move task to ToDo list
    }
    // If task is in the Done list and is now marked as not done
    else if (task.is_done && todoContainer.contains(taskElement)) {
        todoContainer.removeChild(taskElement);
        doneContainer.appendChild(taskElement);  // Move task to Done list
    }

    // Update task's HTML content
    taskElement.querySelector('.task-title').innerText = task.title;
    taskElement.querySelector('.task-description').innerText = task.description;
    taskElement.querySelector('.reminder-time .time').innerText = formatTime(task.created_at);
}

// Function to format time (same as in the original code)
function formatTime(dateString) {
    const createdAt = new Date(dateString);
    return createdAt.toLocaleTimeString('en-GB', {hour: "2-digit", minute: "2-digit"});
}


