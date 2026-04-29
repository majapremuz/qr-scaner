import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PotvrdaPage } from './potvrda.page';

describe('PotvrdaPage', () => {
  let component: PotvrdaPage;
  let fixture: ComponentFixture<PotvrdaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PotvrdaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
