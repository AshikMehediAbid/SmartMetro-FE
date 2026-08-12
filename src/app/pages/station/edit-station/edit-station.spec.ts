import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStation } from './edit-station';

describe('EditStation', () => {
  let component: EditStation;
  let fixture: ComponentFixture<EditStation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditStation],
    }).compileComponents();

    fixture = TestBed.createComponent(EditStation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
