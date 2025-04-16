import { Component, input, output } from '@angular/core';
import { Todo } from '../../model/todo.type';
import { Status } from '../../model/status.type';

@Component({
  selector: 'app-todo-item',
  imports: [],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.scss'
})

export class TodoItemComponent {

  todo = input.required<Todo>();
  deleteEvent= output<number>();
  index = input.required<number>();
  updateStatusEvent= output<Status>();
  
  deleteFn(){
    this.deleteEvent.emit(this.index());
  }
  updateStatusFn(){
    this.updateStatusEvent.emit({id:this.index(),status:!this.todo().completed})
  }
}
