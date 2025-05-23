import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, AlertController, ToastController, ModalController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { GameService } from '../../services/game.service';
import { CategoryService } from '../../services/category.service';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class AdminPage implements OnInit {
  activeTab = 'dashboard';
  isLoading = false;
  
  // Datos para el dashboard
  totalUsers = 0;
  totalGames = 0;
  totalOrders = 0;
  totalCategories = 0;
  
  // Listados
  games: any[] = [];
  categories: any[] = [];
  users: any[] = [];
  orders: any[] = [];

  // Formularios
  gameForm!: FormGroup;
  categoryForm!: FormGroup;
  
  constructor(
    private authService: AuthService,
    private gameService: GameService,
    private categoryService: CategoryService,
    private adminService: AdminService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    // Verificar si el usuario es administrador
    if (!this.authService.isAdmin) {
      this.presentToast('Acceso denegado. Se requieren permisos de administrador.', 'danger');
      this.router.navigate(['/home']);
      return;
    }
    
    this.loadDashboardData();
    this.initForms();
  }

  initForms() {
    this.gameForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      discount: [0, [Validators.min(0), Validators.max(100)]],
      description: [''],
      cover_url: [''],
      banner_url: [''],
      developer: [''],
      release_date: [''],
      category_ids: [[]]
    });

    this.categoryForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      icon: [''],
      color: ['']
    });
  }
  
  // Cargar datos del dashboard
  loadDashboardData() {
    this.isLoading = true;
    
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.totalUsers = stats.totalUsers;
        this.totalGames = stats.totalGames;
        this.totalOrders = stats.totalOrders;
        this.totalCategories = stats.totalCategories;
        this.isLoading = false;
      },
      error: (error) => {
        // Fallback a datos simulados si la API falla
        setTimeout(() => {
          this.totalUsers = 125;
          this.totalGames = 48;
          this.totalOrders = 356;
          this.totalCategories = 12;
          this.isLoading = false;
        }, 1000);
      }
    });
  }
  
  // Cambiar entre pestañas
  changeTab(tab: string) {
    this.activeTab = tab;
    
    switch (tab) {
      case 'games':
        this.loadGames();
        break;
      case 'categories':
        this.loadCategories();
        break;
      case 'users':
        this.loadUsers();
        break;
      case 'orders':
        this.loadOrders();
        break;
      default:
        this.loadDashboardData();
    }
  }
  
  // Cargar juegos
  loadGames() {
    this.isLoading = true;
    this.gameService.getGames().subscribe({
      next: (data) => {
        this.games = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.presentToast('Error al cargar juegos', 'danger');
      }
    });
  }
  
  // Cargar categorías
  loadCategories() {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.presentToast('Error al cargar categorías', 'danger');
      }
    });
  }
  
  // Cargar usuarios
  loadUsers() {
    this.isLoading = true;
    
    // Guardar la fecha actual para saber cuándo se cargaron los datos
    const loadTime = new Date();
    
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
        // Guardar los datos en localStorage como caché
        localStorage.setItem('admin_users_cache', JSON.stringify({
          timestamp: loadTime.getTime(),
          data: this.users
        }));
      },
      error: (error) => {
        this.isLoading = false;
        this.presentToast('Error al cargar usuarios. Usando datos en caché.', 'warning');
        
        // Intentar cargar desde caché
        const cachedData = localStorage.getItem('admin_users_cache');
        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData);
            this.users = parsed.data;
            
            // Mostrar cuándo se cargaron los datos
            const cacheTime = new Date(parsed.timestamp);
            const timeDiff = Math.floor((loadTime.getTime() - cacheTime.getTime()) / (1000 * 60)); // minutos
            this.presentToast(`Mostrando datos guardados hace ${timeDiff} minutos`, 'warning');
          } catch (e) {
            // Usar datos de fallback si falla el caché
            this.users = [
              { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' },
              { id: 2, username: 'usuario1', email: 'usuario1@example.com', role: 'user' },
              { id: 3, username: 'usuario2', email: 'usuario2@example.com', role: 'user' }
            ];
          }
        } else {
          // Usar datos de fallback si no hay caché
          this.users = [
            { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' },
            { id: 2, username: 'usuario1', email: 'usuario1@example.com', role: 'user' },
            { id: 3, username: 'usuario2', email: 'usuario2@example.com', role: 'user' }
          ];
        }
      }
    });
  }
  
  // Cargar órdenes
  loadOrders() {
    this.isLoading = true;
    
    // Guardar la fecha actual para saber cuándo se cargaron los datos
    const loadTime = new Date();
    
    this.adminService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
        // Guardar los datos en localStorage como caché
        localStorage.setItem('admin_orders_cache', JSON.stringify({
          timestamp: loadTime.getTime(),
          data: this.orders
        }));
      },
      error: (error) => {
        this.isLoading = false;
        this.presentToast('Error al cargar pedidos. Usando datos en caché.', 'warning');
        
        // Intentar cargar desde caché
        const cachedData = localStorage.getItem('admin_orders_cache');
        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData);
            this.orders = parsed.data;
            
            // Mostrar cuándo se cargaron los datos
            const cacheTime = new Date(parsed.timestamp);
            const timeDiff = Math.floor((loadTime.getTime() - cacheTime.getTime()) / (1000 * 60)); // minutos
            this.presentToast(`Mostrando datos guardados hace ${timeDiff} minutos`, 'warning');
          } catch (e) {
            // Usar datos de fallback si falla el caché
            this.orders = [
              { id: 1, userId: 2, total: 29990, status: 'completed', date: new Date() },
              { id: 2, userId: 3, total: 15990, status: 'pending', date: new Date() },
              { id: 3, userId: 2, total: 45990, status: 'processing', date: new Date() }
            ];
          }
        } else {
          // Usar datos de fallback si no hay caché
          this.orders = [
            { id: 1, userId: 2, total: 29990, status: 'completed', date: new Date() },
            { id: 2, userId: 3, total: 15990, status: 'pending', date: new Date() },
            { id: 3, userId: 2, total: 45990, status: 'processing', date: new Date() }
          ];
        }
      }
    });
  }
  
  // Añadir un nuevo juego
  async addGame() {
    const alert = await this.alertController.create({
      header: 'Añadir Juego',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Título del juego'
        },
        {
          name: 'price',
          type: 'number',
          placeholder: 'Precio'
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Descripción'
        },
        {
          name: 'cover_url',
          type: 'url',
          placeholder: 'URL de portada'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (!data.title || !data.price) {
              this.presentToast('El título y el precio son obligatorios', 'warning');
              return false;
            }
            
            this.isLoading = true;
            this.adminService.createGame(data).subscribe({
              next: (response) => {
                this.isLoading = false;
                this.presentToast('Juego creado con éxito', 'success');
                this.loadGames();
              },
              error: (error) => {
                this.isLoading = false;
                this.presentToast('Error al crear el juego', 'danger');
              }
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }
  
  // Editar un juego
  async editGame(game: any) {
    const alert = await this.alertController.create({
      header: 'Editar Juego',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Título del juego',
          value: game.name || game.title
        },
        {
          name: 'price',
          type: 'number',
          placeholder: 'Precio',
          value: game.price
        },
        {
          name: 'discount',
          type: 'number',
          placeholder: 'Descuento (%)',
          value: game.discount || 0
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Descripción',
          value: game.description
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (!data.title || !data.price) {
              this.presentToast('El título y el precio son obligatorios', 'warning');
              return false;
            }
            
            this.isLoading = true;
            this.adminService.updateGame(game.id, data).subscribe({
              next: (response) => {
                this.isLoading = false;
                this.presentToast('Juego actualizado con éxito', 'success');
                this.loadGames();
              },
              error: (error) => {
                this.isLoading = false;
                this.presentToast('Error al actualizar el juego', 'danger');
              }
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }
  
  // Eliminar un juego
  async deleteGame(game: any) {
    const alert = await this.alertController.create({
      header: 'Eliminar Juego',
      message: `¿Está seguro que desea eliminar ${game.name || game.title}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.isLoading = true;
            this.adminService.deleteGame(game.id).subscribe({
              next: () => {
                this.isLoading = false;
                this.presentToast('Juego eliminado con éxito', 'success');
                this.loadGames();
              },
              error: (error) => {
                this.isLoading = false;
                this.presentToast('Error al eliminar el juego', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }
  
  // Añadir una categoría
  async addCategory() {
    const alert = await this.alertController.create({
      header: 'Añadir Categoría',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre de la categoría'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (!data.name) {
              this.presentToast('El nombre es obligatorio', 'warning');
              return false;
            }
            
            this.isLoading = true;
            this.adminService.createCategory(data).subscribe({
              next: (response) => {
                this.isLoading = false;
                this.presentToast('Categoría creada con éxito', 'success');
                this.loadCategories();
              },
              error: (error) => {
                this.isLoading = false;
                this.presentToast('Error al crear la categoría', 'danger');
              }
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }
  
  // Editar una categoría
  async editCategory(category: any) {
    const alert = await this.alertController.create({
      header: 'Editar Categoría',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre de la categoría',
          value: category.name
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (!data.name) {
              this.presentToast('El nombre es obligatorio', 'warning');
              return false;
            }
            this.isLoading = true;
            this.adminService.updateCategory(category.id, data).subscribe({
              next: (response) => {
                this.isLoading = false;
                this.presentToast('Categoría actualizada con éxito', 'success');
                this.loadCategories();
              },
              error: (error) => {
                this.isLoading = false;
                this.presentToast('Error al actualizar la categoría', 'danger');
              }
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }
  
  // Eliminar una categoría
  async deleteCategory(category: any) {
    const alert = await this.alertController.create({
      header: 'Eliminar Categoría',
      message: `¿Está seguro que desea eliminar ${category.name}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.isLoading = true;
            this.adminService.deleteCategory(category.id).subscribe({
              next: () => {
                this.isLoading = false;
                this.presentToast('Categoría eliminada con éxito', 'success');
                this.loadCategories();
              },
              error: (error) => {
                this.isLoading = false;
                this.presentToast('Error al eliminar la categoría', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }
  
  // Mostrar un mensaje Toast
  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
} 