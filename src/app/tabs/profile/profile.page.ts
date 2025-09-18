import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

type ProfileDto = { firstName: string; lastName: string; username: string };

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnDestroy {
  profile: ProfileDto | null = null;
  private sub?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  ionViewWillEnter() {
    this.loadProfile();
  }

  private loadProfile() {
    this.sub?.unsubscribe();
    this.sub = this.authService.getUserProfile().subscribe({
      next: (p) => {
        this.profile = {
          firstName: p?.firstName ?? '',
          lastName:  p?.lastName  ?? '',
          username:  p?.username  ?? '',
        };
        console.log('[Profile] loaded:', this.profile);
      },
      error: (e) => {
        console.error('[Profile] getUserProfile error:', e);
        this.profile = null;
      },
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  async presentLogoutConfirm() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to log out?',
      buttons: [
        { text: 'Cancel', role: 'cancel', cssClass: 'secondary' },
        { text: 'Yes', handler: () => this.logOut() },
      ],
    });
    await alert.present();
  }

  private logOut() {
    this.authService.logout();
    this.router.navigate(['/log-in']);
  }
}
