import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDashbord } from './user-dashbord';

describe('UserDashbord', () => {
  let component: UserDashbord;
  let fixture: ComponentFixture<UserDashbord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDashbord]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDashbord);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
