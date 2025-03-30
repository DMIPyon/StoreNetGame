import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  cartOutline, personOutline, searchOutline, homeOutline, 
  heartOutline, heartSharp, calendarOutline, cloudDownloadOutline,
  codeSlashOutline, desktopOutline, gameControllerOutline, 
  hardwareChipOutline, layersOutline, saveOutline, tvOutline, 
  alertCircleOutline, arrowBackOutline, closeCircleOutline,
  trashOutline, removeCircleOutline, addCircleOutline, cardOutline,
  flameOutline, mapOutline, bulbOutline, footballOutline, 
  appsOutline, airplaneOutline, happyOutline, flashOutline,
  pricetagOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet, RouterModule],
})
export class AppComponent {
  constructor() {
    // Registrar los iconos que usamos en la aplicación
    addIcons({
      cartOutline, personOutline, searchOutline, homeOutline, 
      heartOutline, heartSharp, calendarOutline, cloudDownloadOutline,
      codeSlashOutline, desktopOutline, gameControllerOutline, 
      hardwareChipOutline, layersOutline, saveOutline, tvOutline, 
      alertCircleOutline, arrowBackOutline, closeCircleOutline,
      trashOutline, removeCircleOutline, addCircleOutline, cardOutline,
      flameOutline, mapOutline, bulbOutline, footballOutline, 
      appsOutline, airplaneOutline, happyOutline, flashOutline,
      pricetagOutline
    });
  }
}
