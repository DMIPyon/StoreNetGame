import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-login',
  templateUrl: './main-login.page.html',
  styleUrls: ['./main-login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class MainLoginPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
