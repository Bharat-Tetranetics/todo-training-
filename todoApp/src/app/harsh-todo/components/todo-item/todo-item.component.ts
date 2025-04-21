import { Component, input, output } from '@angular/core';
import { Todo } from '../../model/todo.type';
import { Status } from '../../model/status.type';
import { TodoObj } from '../../model/todoObj.type';

@Component({
  selector: 'app-todo-item',
  imports: [],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.scss'
})
export class TodoItemComponent {
  todo = input.required<TodoObj>();
  deleteEvent= output<number>();
  index = input.required<number>();
  updateStatusEvent= output<Status>();
  
  deleteFn(){
    this.deleteEvent.emit(this.todo().id);
  }
  updateStatusFn(task:{id:number|string,status:string}){
    this.updateStatusEvent.emit(task)
  }

}
