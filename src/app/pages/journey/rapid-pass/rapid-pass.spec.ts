import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapidPass } from './rapid-pass';

describe('RapidPass', () => {
  let component: RapidPass;
  let fixture: ComponentFixture<RapidPass>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RapidPass],
    }).compileComponents();

    fixture = TestBed.createComponent(RapidPass);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
