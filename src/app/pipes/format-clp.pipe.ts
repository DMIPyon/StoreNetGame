import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatClp',
  standalone: true
})
export class FormatClpPipe implements PipeTransform {
  transform(value: number | undefined): string {
    if (value === undefined || value === null) {
      return '$0';
    }
    
    // Redondear al entero más cercano
    const roundedValue = Math.round(value);
    
    // Formatear con punto como separador de miles para pesos chilenos
    return '$' + roundedValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
} 