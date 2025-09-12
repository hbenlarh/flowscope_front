import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserOffre } from './user-offre';

describe('UserOffre', () => {
  let component: UserOffre;
  let fixture: ComponentFixture<UserOffre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserOffre]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserOffre);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
