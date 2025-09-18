import {Component, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService} from '../auth.service'; 
import {Router} from "@angular/router";
import {AlertController, LoadingController} from "@ionic/angular";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})

export class RegisterPage implements OnInit {

  constructor(private authService: AuthService, private router: Router, private loadingCtrl: LoadingController, private alertCtrl: AlertController) {
  }

 ngOnInit() {
  }

  onRegister(registerForm: NgForm) {
    this.loadingCtrl.create({ message: 'Registering...' }).then((loadingEl) => {
      loadingEl.present();
      this.authService.register({
        email: registerForm.value.email,
        password: registerForm.value.password,
        name: registerForm.value.name,
        surname: registerForm.value.surname,
        role: 'user',
        sex: registerForm.value.sex,
      }).subscribe(resData => {
          console.log('Registracija uspela!');
          console.log(resData);

          loadingEl.dismiss();
          this.router.navigateByUrl('/tabs/home');
        },
        
        errRes => {
  loadingEl.dismiss();

  console.log('REGISTER ERROR >>>', errRes?.error || errRes);

  const message =
    errRes?.error?.error?.message ||   
    errRes?.message ||
    'Something went wrong during registration';

  this.alertCtrl.create({
    header: 'Registration failed',
    message,
    buttons: ['Okay']
  }).then(a => a.present());

  registerForm.reset(); 
  });
    });
  }

}