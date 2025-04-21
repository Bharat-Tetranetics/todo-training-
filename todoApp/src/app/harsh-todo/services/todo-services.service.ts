import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Todo } from '../model/todo.type';
import { TodoObj } from '../model/todoObj.type';

@Injectable({
  providedIn: 'root'
})
export class TodoServicesService {
  apiUrl = 'http://localhost:5900/api/todo';
  http=inject(HttpClient);

  getTodos(filter:{searchParam:string,status:string}){
    let url=`${this.apiUrl}/?`;
    if(filter.searchParam.length){
      url+=`searchParam=${filter.searchParam}&`
    }
    if(filter.status.length){
      url+=`status=${filter.status}&`
    }
    console.log(url);
    return this.http.get<{success:boolean,data:TodoObj[]}>(url)
  }
  addTodo(task:{task:string,username:string}){
    return this.http.post<{success:boolean,data:TodoObj[]}>(this.apiUrl,task)
  }
  deleteTodo(id:string|number){
   return this.http.delete<{success:boolean,data:TodoObj[]}>(`${this.apiUrl}/${id}`)
  }
  updateStatus(task:{id:string|number,status:string}){
    return this.http.patch<{success:boolean,data:TodoObj[]}>(`${this.apiUrl}/status`,task)
  }
  updateTask(task:{id:string|number,task:string}){
    return this.http.patch<{success:boolean,data:TodoObj[]}>(`${this.apiUrl}/task`,task)
  }

  constructor() { }

}
