import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class StarRatingComponent implements OnChanges {
  @Input() rating: number = 0;
  @Input() maxRating: number = 5;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() readOnly: boolean = true;
  
  stars: { filled: boolean, value: number }[] = [];
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rating'] || changes['maxRating']) {
      this.updateStars();
    }
  }
  
  private updateStars(): void {
    this.stars = Array(this.maxRating).fill(0).map((_, index) => {
      const value = index + 1;
      // Una estrella está llena si el valor es menor o igual al rating
      // Para medias estrellas, podríamos calcular si está parcialmente llena
      const filled = value <= this.rating;
      return { filled, value };
    });
  }
  
  // Para futuras versiones donde el usuario pueda calificar
  rate(value: number): void {
    if (!this.readOnly) {
      this.rating = value;
      this.updateStars();
      // Aquí podría emitir un evento para notificar al componente padre
    }
  }
}
