import { Component } from '@angular/core';
// import { FormsModule, NgForm, NgModel } from '@angular/forms';
// import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { RouterOutlet } from '@angular/router';

interface Task {
  id: number;
  userName: string;
  taskName: string;
  status: 'Pending' | 'Completed';
}

@Component({
  selector: 'app-todos',
  imports: [FormsModule],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.scss',
})
export class TodosComponent {
  userName: string = '';
  taskName: string = '';
  allTasks: Task[] = [
    {
      id: 1,
      userName: 'Alice',
      taskName: 'Buy groceries',
      status: 'Pending',
    },
    {
      id: 2,
      userName: 'Bob',
      taskName: 'Finish report',
      status: 'Completed',
    },
    {
      id: 3,
      userName: 'Charlie',
      taskName: 'Call client',
      status: 'Pending',
    },
  ];
  searchText: string = '';
  selectedFilter: 'All' | 'Pending' | 'Completed' = 'All';

  tasks: Task[] = [];

  handleSubmit() {
    const newTask: Task = {
      id: Date.now(),
      userName: this.userName,
      taskName: this.taskName,
      status: 'Pending',
    };

    this.allTasks.push(newTask);
    this.tasks = [...this.allTasks];

    console.log(this.tasks);

    // Reset input fields
    this.userName = '';
    this.taskName = '';
  }

  deleteTask(task: Task) {
    this.allTasks = this.allTasks.filter((t) => t.id !== task.id);
    this.tasks = [...this.allTasks];
  }

  toggleStatus(task: Task) {
    task.status = task.status === 'Pending' ? 'Completed' : 'Pending';
  }

  onUserNameChange(value: string) {
    console.log('User Name changed:', value);
  }

  // filterTasks() {
  //   if (this.selectedFilter === 'All') {
  //     this.tasks = [...this.allTasks];
  //     return;
  //   }

  //   if (this.allTasks.length === this.tasks.length) {
  //     this.tasks = this.allTasks.filter((task) => task.status === filter);
  //   } else {
  //     this.tasks = this.tasks.filter((task) => task.status === filter);
  //   }
  // }

  input: string = '';
  filter: string = 'All';

  searchByTextAndFilter() {
    this.tasks = this.allTasks.filter(
      (task) =>
        task.taskName.toLowerCase().includes(this.searchText) &&
        task.status.includes(this.selectedFilter)
    );
  }

  searchTasks(value: string) {
    const searchTerm = value.toLowerCase();

    if (searchTerm === '') {
      this.tasks = [...this.allTasks];
    }

    if (this.allTasks.length === this.tasks.length) {
      this.tasks = this.allTasks.filter(
        (task) =>
          task.taskName.toLowerCase().includes(searchTerm) ||
          task.userName.toLowerCase().includes(searchTerm)
      );
    } else {
      this.tasks = this.tasks.filter(
        (task) =>
          task.taskName.toLowerCase().includes(searchTerm) ||
          task.userName.toLowerCase().includes(searchTerm)
      );
    }
  }
}
