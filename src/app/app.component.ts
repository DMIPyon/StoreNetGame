import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  cartOutline, personOutline, person, searchOutline, homeOutline, 
  heartOutline, heartSharp, calendarOutline, cloudDownloadOutline,
  codeSlashOutline, desktopOutline, gameControllerOutline, 
  hardwareChipOutline, layersOutline, saveOutline, tvOutline, 
  alertCircleOutline, arrowBackOutline, closeCircleOutline,
  trashOutline, removeCircleOutline, addCircleOutline, cardOutline,
  flameOutline, mapOutline, bulbOutline, footballOutline, 
  appsOutline, airplaneOutline, happyOutline, flashOutline,
  pricetagOutline, heart, checkmarkCircleOutline, informationCircleOutline,
  listOutline, optionsOutline, chevronForwardOutline, chevronBackOutline,
  businessOutline, starOutline, carSportOutline, extensionPuzzleOutline,
  skullOutline, fishOutline, cubeOutline, apertureOutline, 
  radioButtonOffOutline, radioButtonOnOutline, refreshOutline,
  cart, removeCircle, addCircle, filterOutline, star, chevronForward
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
      'heart-outline': heartOutline,
      'heart': heart,
      'cart-outline': cartOutline,
      'cart': cart,
      'person-outline': personOutline,
      'search-outline': searchOutline,
      'home-outline': homeOutline,
      'arrow-back-outline': arrowBackOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-circle-outline': closeCircleOutline,
      'remove-circle-outline': removeCircleOutline,
      'add-circle-outline': addCircleOutline,
      'information-circle-outline': informationCircleOutline,
      'alert-circle-outline': alertCircleOutline,
      'trash-outline': trashOutline,
      'list-outline': listOutline,
      'options-outline': optionsOutline,
      'game-controller-outline': gameControllerOutline,
      'flash-outline': flashOutline,
      'apps-outline': appsOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'chevron-forward': chevronForward,
      'chevron-back-outline': chevronBackOutline,
      'calendar-outline': calendarOutline,
      'business-outline': businessOutline,
      'star-outline': starOutline,
      'star': star,
      'flame-outline': flameOutline,
      'map-outline': mapOutline,
      'bulb-outline': bulbOutline,
      'football-outline': footballOutline,
      'airplane-outline': airplaneOutline,
      'happy-outline': happyOutline,
      'car-sport-outline': carSportOutline,
      'aperture-outline': apertureOutline,
      'extension-puzzle-outline': extensionPuzzleOutline,
      'skull-outline': skullOutline,
      'layers-outline': layersOutline,
      'fish-outline': fishOutline,
      'cube-outline': cubeOutline,
      'filter-outline': filterOutline,
      'radio-button-off-outline': radioButtonOffOutline,
      'radio-button-on-outline': radioButtonOnOutline,
      'refresh-outline': refreshOutline,
      'person': person
    });
  }
}
