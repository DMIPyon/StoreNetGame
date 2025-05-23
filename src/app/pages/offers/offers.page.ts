import { Component, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { Game } from '../../interfaces/game.interface';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-offers',
  standalone: true,
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule]
})
export class OffersPage implements OnInit {
  discountedGames: Game[] = [];
  isLoading = true;

  constructor(private gameService: GameService, private router: Router) {}

  ngOnInit() {
    this.gameService.getDiscountedGames().subscribe({
      next: (games) => {
        this.discountedGames = games;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  viewGameDetails(id: number) {
    this.router.navigate(['/game-details', id]);
  }
} 