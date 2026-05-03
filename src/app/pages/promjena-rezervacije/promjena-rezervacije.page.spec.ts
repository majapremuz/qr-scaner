import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PromjenaRezervacijePage } from './promjena-rezervacije.page';

describe('PromjenaRezervacijePage', () => {
  let component: PromjenaRezervacijePage;
  let fixture: ComponentFixture<PromjenaRezervacijePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PromjenaRezervacijePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
