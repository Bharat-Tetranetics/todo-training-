import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Todo } from './model/todo.type';
import { TodoItemComponent } from './components/todo-item/todo-item.component';
import { ThisReceiver } from '@angular/compiler';
import { Status } from './model/status.type';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TodoItemComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  task=signal('');
  user=signal('');
  filter1=signal('NA');
  filter2=signal<string>('');
  
  filteredArray= signal<Array<Todo>>([]);
  itemArray = signal<Array<Todo>>([]);

  addTodo(){

   if(this.task().length && this.user().length ) {

     this.itemArray.update(item=>[...item, { 
    name:this.user(),
    completed:false,
    description:this.task()}]);
    this.filteredArray.set([...this.itemArray()])
    this.task.set('');
    this.user.set('')
  
  }
   else alert("Missing fields required")
   
  }

  deleteTodo(id:Number){
    this.itemArray.update(item=>item.filter((todo,ind)=>ind!=id))
    this.filteredArray.set([...this.itemArray()])
  }

  updateStatus(status:Status){
    this.itemArray.update(item=>item.map((todo,ind)=>{
      if(status.id==ind) return {...todo, completed:status.status}
      else return todo;
      }));
      this.filteredArray.set([...this.itemArray()]);
  }
  statusFilter(){
    console.log( typeof this.filter1(),"--",this.filter2());
    this.filteredArray.set([...this.itemArray()]);
    
    this.filteredArray.update(items =>
      items.filter(data => {
        if (this.filter1() == 'NA') {
          return data.description.includes(this.filter2()) || data.name.includes(this.filter2());
        } 
        else if (this.filter1()=="false") {
          return (data.description.includes(this.filter2()) || data.name.includes(this.filter2())) && data.completed == false;
        } 
        else {
          return (data.description.includes(this.filter2()) || data.name.includes(this.filter2())) &&   data.completed == true;
        }
      })
    );

  }

}
