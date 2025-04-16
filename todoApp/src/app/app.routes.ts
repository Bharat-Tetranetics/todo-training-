import { Routes } from '@angular/router';
import { TodosComponent } from './components/todos/todos.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  {
    path: 'sachinTodo',
    component: TodosComponent,
  },
  {
    path:'harshTodo',
    pathMatch:'full',
    loadComponent() {
        return import('./harsh-todo/harsh-todo.component').then(m => m.HarshTodoComponent);
    },
},
];
