import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Importar y registrar iconos de Ionicons
import { addIcons } from 'ionicons';
import {
  closeOutline, carSportOutline, planetOutline, hammerOutline, peopleOutline, footballOutline, bulbOutline, sparklesOutline, bodyOutline, gitBranchOutline, peopleCircleOutline, handLeftOutline, cubeOutline, shuffleOutline, earthOutline, flashOutline, happyOutline, skullOutline, constructOutline, leafOutline,
  chevronForward, chevronBackOutline, chevronForwardOutline, listOutline, star, starOutline, apertureOutline, closeCircle, businessOutline, checkmarkCircle, checkmarkCircleOutline
} from 'ionicons/icons';

addIcons({
  'close-outline': closeOutline,
  'car-sport-outline': carSportOutline,
  'planet-outline': planetOutline,
  'hammer-outline': hammerOutline,
  'people-outline': peopleOutline,
  'football-outline': footballOutline,
  'bulb-outline': bulbOutline,
  'sparkles-outline': sparklesOutline,
  'body-outline': bodyOutline,
  'git-branch-outline': gitBranchOutline,
  'people-circle-outline': peopleCircleOutline,
  'hand-left-outline': handLeftOutline,
  'cube-outline': cubeOutline,
  'shuffle-outline': shuffleOutline,
  'earth-outline': earthOutline,
  'flash-outline': flashOutline,
  'happy-outline': happyOutline,
  'skull-outline': skullOutline,
  'construct-outline': constructOutline,
  'leaf-outline': leafOutline,
  'chevron-forward': chevronForward,
  'chevron-back-outline': chevronBackOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'list-outline': listOutline,
  'star': star,
  'star-outline': starOutline,
  'aperture-outline': apertureOutline,
  'close-circle': closeCircle,
  'business-outline': businessOutline,
  checkmarkCircle,
  checkmarkCircleOutline
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
  ],
});
