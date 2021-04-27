'use strict';

class Todo {
    constructor(form, input, todoList, todoCompleted, todoContainer) {
        this.form = document.querySelector(form);
        this.input = document.querySelector(input);
        this.todoList = document.querySelector(todoList);
        this.todoCompleted = document.querySelector(todoCompleted);
        this.todoContainer = document.querySelector(todoContainer);
        this.todoData = new Map(JSON.parse(localStorage.getItem('toDoList')));
    }

    addToStorage() {
        localStorage.setItem('toDoList', JSON.stringify([...this.todoData]));

    }

    render() {
        this.todoList.textContent = '';
        this.todoCompleted.textContent = '';

        //this в конце - для передачи контекста в createItem
        //можно было бы и не ставить, если переделать createItem в стрелочную функцию
        this.todoData.forEach(this.createItem, this);
        this.addToStorage();

    }

    createItem(todo) {
        const li = document.createElement('li');
        li.classList.add('todo-item');
        li.key = todo.key;
        li.insertAdjacentHTML('beforeend', `
                <span class="text-todo">${todo.value}</span>
				<div class="todo-buttons">
					<button class="todo-remove"></button>
					<button class="todo-complete"></button>
				</div>
        `);

        if (todo.completed) {
            this.todoCompleted.append(li);
        } else {
            this.todoList.append(li);
        }

    }


    addToDo(e) {
        e.preventDefault();
        if (this.input.value.trim()) {
            const newTodo = {
                value: this.input.value,
                completed: false,
                key: this.generateKey(),
            };
            this.todoData.set(newTodo.key, newTodo);
            this.render();
        } else {
            alert("Попытка добавить пустое дело!");
        }

    }

    generateKey() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    deleteItem(liDel) {
        for (let item of this.todoData) {
            if (item[0] === liDel.key) {
                this.todoData.delete(item[0]);
                break;
            }
        }
        this.render();
    }

    completed(liComp) {
        for (let item of this.todoData) {
            if (item[0] === liComp.key) {
                item[1].completed = !item[1].completed;
                break;
            }
        }
        this.render();
    }

    handler(e) {
        e.preventDefault();
        const target = e.target;
        if (target.matches('.todo-remove')) {
            this.deleteItem(target.closest('li'));
        }

        if (target.matches('.todo-complete')) {
            this.completed(target.closest('li'));
        }
    }

    init() {
        this.form.addEventListener('submit', this.addToDo.bind(this));
        this.todoContainer.addEventListener('click', this.handler.bind(this));
        this.render();

    }
}

const todo = new Todo('.todo-control', '.header-input', '.todo-list', '.todo-completed', '.todo-container');

todo.init();