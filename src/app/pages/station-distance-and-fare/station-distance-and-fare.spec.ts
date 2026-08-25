import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StationDistanceAndFare } from './station-distance-and-fare';

describe('StationDistanceAndFare', () => {
  let component: StationDistanceAndFare;
  let fixture: ComponentFixture<StationDistanceAndFare>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StationDistanceAndFare],
    }).compileComponents();

    fixture = TestBed.createComponent(StationDistanceAndFare);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
