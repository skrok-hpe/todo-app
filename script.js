const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyMessage = document.getElementById('emptyMessage');
const todoStats = document.getElementById('todoStats');
const dateTimeElement = document.getElementById('dateTime');
const hpeNewsElement = document.getElementById('hpeNews');
const themeToggle = document.getElementById('themeToggle');

let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Initialize theme
initTheme();

// Update date and time
updateDateTime();
setInterval(updateDateTime, 1000);

// Fetch HPE news
fetchHPENews();

// Render todos on page load
renderTodos();

// Add event listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});
themeToggle.addEventListener('click', toggleTheme);

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}

function applyTheme(theme) {
    const html = document.documentElement;
    const emoji = theme === 'dark' ? '☀️' : '🌙';
    
    if (theme === 'dark') {
        html.classList.add('dark-theme');
    } else {
        html.classList.remove('dark-theme');
    }
    
    themeToggle.textContent = emoji;
}

function updateDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    dateTimeElement.textContent = now.toLocaleString('he-IL', options);
}

function fetchHPENews() {
    // Fallback news if API fails
    const fallbackNews = [
        "HPE expands edge computing capabilities with new AI solutions",
        "HPE partners with leading cloud providers for hybrid infrastructure"
    ];
    
    // Try to fetch from NewsAPI
    fetch('https://newsapi.org/v2/everything?q=HPE&language=en&sortBy=publishedAt&pageSize=5', {
        headers: {
            'X-API-Key': 'demo' // Using demo key - replace with your own for production
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('API Error');
        return response.json();
    })
    .then(data => {
        if (data.articles && data.articles.length > 0) {
            const newsLines = data.articles.slice(0, 2).map(article => article.title).join(' • ');
            hpeNewsElement.innerHTML = `<div class="news-headline">📰 Hewlett Packard Enterprise Latest News & Industry Updates:</div><div>${newsLines}</div>`;
        } else {
            displayFallbackNews(fallbackNews);
        }
    })
    .catch(error => {
        displayFallbackNews(fallbackNews);
    });
}

function displayFallbackNews(news) {
    const newsLines = news.join(' • ');
    hpeNewsElement.innerHTML = `<div class="news-headline">📰 Hewlett Packard Enterprise Latest News & Industry Updates:</div><div>${newsLines}</div>`;
}

function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('Please enter a todo!');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    todos.push(todo);
    saveTodos();
    renderTodos();
    todoInput.value = '';
    todoInput.focus();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    const todoItem = document.querySelector(`[data-todo-id="${id}"]`);
    if (todoItem) {
        todoItem.classList.add('deleting');
        setTimeout(() => {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            renderTodos();
        }, 300); // Match the animation duration
    } else {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
    }
}

function renderTodos() {
    todoList.innerHTML = '';

    if (todos.length === 0) {
        emptyMessage.classList.remove('hidden');
        todoStats.classList.add('hidden');
        return;
    }

    emptyMessage.classList.add('hidden');
    todoStats.classList.remove('hidden');

    const completedCount = todos.filter(t => t.completed).length;
    todoStats.textContent = `${completedCount} of ${todos.length} completed`;

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.setAttribute('data-todo-id', todo.id);
        li.innerHTML = `
            <div class="todo-content">
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo(${todo.id})"
                >
                <span class="todo-text ${todo.completed ? 'completed' : ''}">${escapeHtml(todo.text)}</span>
            </div>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
        `;
        todoList.appendChild(li);
    });
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
