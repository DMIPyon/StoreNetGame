import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StarRatingComponent } from '../components/star-rating/star-rating.component';
import { ActivatedRoute } from '@angular/router';

import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, StarRatingComponent, HomePage],
      providers: [
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar el mensaje de bienvenida si no hay juegos destacados', () => {
    component.featuredGames = [];
    fixture.detectChanges();
    const bannerTitle = fixture.debugElement.query(By.css('.main-banner-title'));
    expect(bannerTitle.nativeElement.textContent).toContain('¡Bienvenido a NetGames!');
  });

  it('debería llamar a addToCart al hacer clic en el botón Añadir', () => {
    spyOn(component, 'addToCart');
    // Simular juegos filtrados
    component.filteredGames = [{ id: 1, name: 'Juego Test', price: 1000 } as any];
    component.isLoading = false;
    fixture.detectChanges();
    const addButton = fixture.debugElement.query(By.css('.add-to-cart-btn'));
    addButton.nativeElement.click();
    expect(component.addToCart).toHaveBeenCalled();
  });

  it('debería mostrar el mensaje de no resultados si no hay juegos filtrados', () => {
    component.filteredGames = [];
    component.isLoading = false;
    fixture.detectChanges();
    const noResults = fixture.debugElement.query(By.css('.no-results-container'));
    expect(noResults).toBeTruthy();
    expect(noResults.nativeElement.textContent).toContain('No se encontraron juegos');
  });
});
