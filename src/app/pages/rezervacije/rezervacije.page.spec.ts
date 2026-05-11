import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RezervacijePage } from './rezervacije.page';

describe('RezervacijePage', () => {
  let component: RezervacijePage;
  let fixture: ComponentFixture<RezervacijePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RezervacijePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
