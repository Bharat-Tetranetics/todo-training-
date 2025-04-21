import { Component, signal,OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Todo } from './model/todo.type';
import { TodoItemComponent } from './components/todo-item/todo-item.component';
import { Status } from './model/status.type';
import { TodoServicesService } from './services/todo-services.service';
import { catchError } from 'rxjs';
import { TodoObj } from './model/todoObj.type';

@Component({
  selector: 'app-harsh-todo',
  imports: [TodoItemComponent],
  templateUrl: './harsh-todo.component.html',
  styleUrl: './harsh-todo.component.scss'
})
export class HarshTodoComponent implements OnInit {
  task=signal('');
  user=signal('');
  filter1=signal('NA');
  filter2=signal<string>('');
  toDoservice=inject(TodoServicesService);
  
  //filteredArray= signal<Array<TodoObj>>([]);
  itemArray = signal<Array<TodoObj>>([]);
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.toDoservice.getTodos({searchParam:"",status:""}).pipe(
      catchError((err)=>{
        throw err;
      })
     ).subscribe((todos)=>{
      this.itemArray.set(todos.data);
     // this.filteredArray.set(todos.data);
     }
    )
   
    
  }

  addTodo(){
   if(this.task().length && this.user().length ) {
    const task={
      task:this.task(),
      username:this.user()
    }
    this.toDoservice.addTodo(task).pipe(
      catchError((err)=>{
        throw err;
      })
    ).subscribe((todos)=>{
      this.itemArray.update(item=>[...item, ...todos.data])
     // this.filteredArray.set([...this.itemArray()])
      this.task.set('');
      this.user.set('')
     }
    )

  }
   else alert("Missing fields required")
   
  }

  deleteTodo(id:number){
    this.toDoservice.deleteTodo(id).pipe(
      catchError((err)=>{
        throw err;
      })
    ).subscribe((todo)=>{
      this.itemArray.update(item=>item.filter((Alltodo)=>todo.data[0].id!=Alltodo.id))
      //this.filteredArray.set([...this.itemArray()])
    })
    
  }

  updateStatus(task:{id:number|string,status:string}){
    this.toDoservice.updateStatus(task).pipe(
      catchError((err)=>{
        throw err;
      })
    ).subscribe((todo)=>{
      this.itemArray.update(item=>item.map((Alltodo)=>{
        if(Alltodo.id==todo.data[0].id) return {...Alltodo, status:todo.data[0].status}
        else return Alltodo;
        }));
       // this.filteredArray.set([...this.itemArray()]);
    })
    
  }
  statusFilter(){

    this.toDoservice.getTodos({searchParam:this.filter2(),status:this.filter1()}).pipe(
      catchError((err)=>{
        throw err;
      })
     ).subscribe((todos)=>{
      this.itemArray.set(todos.data);
     // this.filteredArray.set(todos.data);
     }
    )

  }
  
}
