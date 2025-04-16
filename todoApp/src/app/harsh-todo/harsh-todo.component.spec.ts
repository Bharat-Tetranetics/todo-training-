import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HarshTodoComponent } from './harsh-todo.component';

describe('HarshTodoComponent', () => {
  let component: HarshTodoComponent;
  let fixture: ComponentFixture<HarshTodoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HarshTodoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HarshTodoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
