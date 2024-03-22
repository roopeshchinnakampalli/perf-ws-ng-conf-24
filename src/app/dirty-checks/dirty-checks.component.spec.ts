import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirtyChecksComponent } from './dirty-checks.component';

describe('DirtyChecksComponent', () => {
  let component: DirtyChecksComponent;
  let fixture: ComponentFixture<DirtyChecksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirtyChecksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DirtyChecksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
