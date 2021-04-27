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
                    <button class="todo-edit"></button>
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

    animate(li, updown, isDel, fun) {
        let compress = 100;
        let idFrame, idFrame1;
        let step = 0;
        const ulTop = li.parentNode.getBoundingClientRect().top;
        const liTop = li.getBoundingClientRect().top;
        const ulBtm = li.parentNode.getBoundingClientRect().bottom;
        const marginBottom = isDel ? window.innerHeight - liTop : ulBtm - liTop;
        const marginTop = liTop - ulTop;

        const fallDown = () => {
            step += isDel ? 30 : 10;
            console.log(step);
            li.style.top = step + 'px';
            if (step > marginBottom) {
                cancelAnimationFrame(idFrame1);
                fun();
                return;
            }
            idFrame1 = requestAnimationFrame(fallDown);
        };

        const fallUp = () => {
            step -= 10;
            li.style.top = step + 'px';
            if (Math.abs(step) >= marginTop) {
                cancelAnimationFrame(idFrame1);
                fun();
                return;
            }
            idFrame1 = requestAnimationFrame(fallUp);
        };

        const smoothCompress = () => {
            compress -= 5;
            li.style.width = compress + '%';
            if (isDel) {
                li.style.opacity = compress + '%';
            }

            if (compress <= 10) {
                cancelAnimationFrame(idFrame);
                updown ? fallUp() : fallDown();
                return;
            }
            idFrame = requestAnimationFrame(smoothCompress);
        };
        smoothCompress();
    }

    deleteItem(liDel) {
        for (const item of this.todoData) {
            if (item[0] === liDel.key) {
                this.todoData.delete(item[0]);
                break;
            }
        }
        this.animate(liDel, false, true, this.render.bind(this));

    }


    completed(liComp) {
        for (const item of this.todoData) {
            if (item[0] === liComp.key) {
                item[1].completed = !item[1].completed;
                break;
            }
        }
        if (liComp.closest('ul').classList.contains('todo-completed')) {

            this.animate(liComp, true, false, this.render.bind(this));

        } else {

            this.animate(liComp, false, false, this.render.bind(this));
        }

    }

    editItem(li) {

        const todoText = li.querySelector('.text-todo');
        todoText.setAttribute('contenteditable', 'true');
        todoText.focus();

        todoText.addEventListener('keydown', e => {
            if (e.keyCode === 13) {
                e.preventDefault();
                todoText.setAttribute('contenteditable', 'false');
            }
        });

        todoText.addEventListener('focusout', () => {
            if (todoText.textContent.trim() === '') {
                alert('Поле не может быть пустым');
                this.render();
                return;
            }
            for (const item of this.todoData) {
                if (item[0] === li.key) {
                    item[1].value = todoText.textContent;
                    break;
                }
            }
            todoText.setAttribute('contenteditable', 'false');
            this.addToStorage();
        });
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

        if (target.matches('.todo-edit')) {
            this.editItem(target.closest('li'));
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
