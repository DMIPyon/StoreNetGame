import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatPrice',
  standalone: true
})
export class FormatPricePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) {
      return '0,00';
    }
    
    // Dividir por 100 y formatear con comas para miles y punto para decimales
    const formattedValue = (value/100).toFixed(2).replace('.', ',');
    
    // Agregar separadores de miles
    return formattedValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
} 