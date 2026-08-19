import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgIf } from "@angular/common";
import { finalize } from 'rxjs';
import { Auth } from '../../services/auth';
 

@Component({
  selector: 'app-navigation',
  imports: [RouterModule, NgIf ],
  templateUrl: './navigation.html',
  styleUrl: './navigation.less',
})
export class Navigation {
  showLogoutConfirm = false;
  isLoggingOut = false;


  constructor(private auth: Auth, private router: Router) {}


  confirmLogout(): void {
    this.isLoggingOut = true;
    this.auth.logout().pipe(
      finalize(() => {
        this.isLoggingOut = false;
        this.showLogoutConfirm = false;

      })
    ).subscribe({
      next: () => {
 
        localStorage.removeItem('token');
        this.router.navigate(['/accountSelection']);
      },
      error: (err) => {
        console.log('Message Laravel:', err.error);
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}
