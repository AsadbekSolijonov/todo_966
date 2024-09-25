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

//
document.querySelectorAll('.reminder-item label').forEach(label => {
    label.addEventListener('click', function (event) {
        event.preventDefault(); // Click eventini label bo'yicha oldini oladi
    });
});

// Scroll ni tezligini kamaytirish
const container = document.querySelector('.reminder-container');

//
container.addEventListener('wheel', (e) => {
    e.preventDefault(); // Scrollning default xatti-harakatini bloklaymiz
    container.scrollBy({
        top: e.deltaY * 1.0, // Bu yerda * 0.1 scroll tezligini kamaytiradi (ko'rsatkichni o'zgartirishingiz mumkin)
    });
});


// Function to get tasks
function getTasks() {
    fetch("tasks/")
        .then(response => response.json())
        .then(data => {
            updateTaskLists(data);
        })
        .catch(error => console.error('Xato:', error));
}

// Function to update the UI with the fetched tasks
function updateTaskLists(data) {
    const todoContainer = document.getElementById('v-pills-home');
    const doneContainer = document.getElementById('v-pills-profile');

    todoContainer.innerHTML = '';
    doneContainer.innerHTML = '';

    // Populate TODO
    data.todo_objects.forEach(task => {
        todoContainer.innerHTML += `
                <div class="reminder-item">
                    <input type="radio" id="todo-${task.id}" name="reminder">
                    <label for="todo-${task.id}" class="reminder-border-bottom">
                        <input type="hidden" value="${task.id}">
                        <strong class="poppins-bold">${task.title}</strong>
                        <p class="poppins-light">${task.description}</p>
                        <span class="reminder-time poppins-medium">Reminders – <span class="time">${task.created_at}</span></span>
                    </label>
                </div>`;
    });

    // Populate DONE
    data.done_objects.forEach(task => {
        doneContainer.innerHTML += `
                <div class="reminder-item">
                    <input type="radio" id="done-${task.id}" name="reminder">
                    <label for="done-${task.id}" class="reminder-border-bottom">
                        <input type="hidden" value="${task.id}">
                        <strong class="poppins-bold">${task.title}</strong>
                        <p class="poppins-light">${task.description}</p>
                        <span class="reminder-time poppins-medium">Reminders – <span class="time">${task.created_at}</span></span>
                    </label>
                </div>`;
    });

    // Attach event listeners for radio buttons
    attachRadioListeners();
}

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


// Fetch tasks every 5 seconds
setInterval(getTasks, 5000);
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


