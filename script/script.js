// TIMER SETTINGS

const MODES = {
    work: {
        label: 'Focus on your task',
        minutes: 25
    },
    short: {
        label: 'Take a short break',
        minutes: 5
    },
    long: {
        label: 'Take a long break',
        minutes: 15
    }
};

// ELEMENTS

const modeButtons = document.querySelectorAll('.mode-btn');
const timerText = document.querySelector('.timer-text');
const timerLabel = document.querySelector('.timer-label');
const startBtn = document.querySelector('.start-btn');
const progressRing = document.querySelector('.timer-ring-progress');

const slider = document.querySelector('.cycle-slider');
const cycleValue = document.querySelector('.cycle-value');

const todoInput = document.querySelector('.todo-input');
const todoAddBtn = document.querySelector('.todo-add-btn');
const todoList = document.querySelector('.todo-list');

// TIMER VARIABLES

let currentMode = 'work';
let timer = null;
let isRunning = false;

let totalSeconds = MODES.work.minutes * 60;
let remainingSeconds = totalSeconds;

let completedWorkSessions = 0;
let longBreakAfter = parseInt(slider.value);

// SVG RING

const radius = 110;
const circumference = 2 * Math.PI * radius;

progressRing.style.strokeDasharray = circumference;

function updateProgressRing() {
    const progress = remainingSeconds / totalSeconds;
    const offset = circumference - progress * circumference;

    progressRing.style.strokeDashoffset = offset;
}

updateProgressRing();

// FORMAT TIME

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// UPDATE UI

function updateDisplay() {
    timerText.textContent = formatTime(remainingSeconds);

    document.title = `${formatTime(remainingSeconds)} - Pomodoro`;

    updateProgressRing();
}

// SWITCH MODE

function switchMode(mode) {
    currentMode = mode;

    totalSeconds = MODES[mode].minutes * 60;
    remainingSeconds = totalSeconds;

    timerLabel.textContent = MODES[mode].label;

    modeButtons.forEach(btn => btn.classList.remove('active'));

    if (mode === 'work') {
        modeButtons[0].classList.add('active');
    }

    if (mode === 'short') {
        modeButtons[1].classList.add('active');
    }

    if (mode === 'long') {
        modeButtons[2].classList.add('active');
    }

    stopTimer();

    updateDisplay();
}

// START TIMER

function startTimer() {
    if (isRunning) return;

    isRunning = true;
    startBtn.textContent = 'Pause';

    timer = setInterval(() => {

        remainingSeconds--;

        updateDisplay();

        if (remainingSeconds <= 0) {
            clearInterval(timer);

            playNotification();

            nextSession();
        }

    }, 1000);
}

// STOP TIMER

function stopTimer() {
    clearInterval(timer);

    isRunning = false;

    startBtn.textContent = 'Start';
}

// TOGGLE TIMER

startBtn.addEventListener('click', () => {

    if (isRunning) {
        stopTimer();
    } else {
        startTimer();
    }

});

// NEXT SESSION LOGIC

function nextSession() {

    if (currentMode === 'work') {

        completedWorkSessions++;

        if (completedWorkSessions % longBreakAfter === 0) {
            switchMode('long');
        } else {
            switchMode('short');
        }

    } else {
        switchMode('work');
    }

    startTimer();
}

// MODE BUTTONS

modeButtons[0].addEventListener('click', () => switchMode('work'));
modeButtons[1].addEventListener('click', () => switchMode('short'));
modeButtons[2].addEventListener('click', () => switchMode('long'));

// SLIDER

slider.addEventListener('input', function () {

    longBreakAfter = parseInt(this.value);

    cycleValue.textContent = this.value + ' cycles';

});

// NOTIFICATION SOUND

function playNotification() {

    const audio = new Audio(
        'media/notification-057-494255.mp3'
    );

    audio.play();
}

// TODO LIST

function saveTodos() {

    const todos = [];

    document.querySelectorAll('.todo-item').forEach(item => {

        todos.push({
            text: item.querySelector('.todo-text').textContent,
            completed: item.classList.contains('completed')
        });

    });

    localStorage.setItem('pomodoroTodos', JSON.stringify(todos));
}

function createTodo(text, completed = false) {

    const item = document.createElement('div');
    item.className = `todo-item glass ${completed ? 'completed' : ''}`;

    item.innerHTML = `
        <div class="todo-checkbox ${completed ? 'checked' : ''}"></div>
        <span class="todo-text">${text}</span>
        <button class="todo-delete">×</button>
    `;

    const checkbox = item.querySelector('.todo-checkbox');

    checkbox.addEventListener('click', () => {

        checkbox.classList.toggle('checked');
        item.classList.toggle('completed');

        saveTodos();
    });

    item.querySelector('.todo-delete').addEventListener('click', () => {

        item.remove();

        saveTodos();
    });

    todoList.appendChild(item);

    saveTodos();
}

function loadTodos() {

    const todos = JSON.parse(
        localStorage.getItem('pomodoroTodos')
    ) || [];

    todoList.innerHTML = '';

    todos.forEach(todo => {
        createTodo(todo.text, todo.completed);
    });
}

todoAddBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keydown', e => {

    if (e.key === 'Enter') {
        addTodo();
    }

});

function addTodo() {

    const text = todoInput.value.trim();

    if (!text) return;

    createTodo(text);

    todoInput.value = '';
}

updateDisplay();

loadTodos();