import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StarRatingComponent } from './star-rating.component';

describe('StarRatingComponent', () => {
  let component: StarRatingComponent;
  let fixture: ComponentFixture<StarRatingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [StarRatingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StarRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería renderizar la cantidad correcta de estrellas llenas según el rating', () => {
    component.rating = 3;
    component.maxRating = 5;
    component.ngOnChanges({ rating: { currentValue: 3, previousValue: 0, firstChange: true, isFirstChange: () => true } });
    fixture.detectChanges();
    expect(component.stars.filter(s => s.filled).length).toBe(3);
    expect(component.stars.length).toBe(5);
  });
});
