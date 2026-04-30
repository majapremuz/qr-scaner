import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KapetanPage } from './kapetan.page';

describe('KapetanPage', () => {
  let component: KapetanPage;
  let fixture: ComponentFixture<KapetanPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(KapetanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
