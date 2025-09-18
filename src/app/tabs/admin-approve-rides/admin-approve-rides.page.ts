import {Component, OnInit} from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import {map, Observable, switchMap, take, tap} from "rxjs";
import {AlertController} from "@ionic/angular";
import { BookingService } from 'src/app/services/booking.service';

@Component({
  selector: 'app-admin-approve-rides',
  templateUrl: './admin-approve-rides.page.html',
  styleUrls: ['./admin-approve-rides.page.scss'],
})
export class AdminApproveRidesPage implements OnInit {

  bookedRides: any[] = [];

  constructor(private adminService: AdminService, private alertCtrl: AlertController, private bookingService: BookingService) {
  }

  userNames: { [userId: string]: string } = {};


  ngOnInit() {
    this.adminService.getAllBookedRides().subscribe(
      (rides) => {
        this.bookedRides = rides;
        this.fetchUserNames();
      },
      error => {
        console.error('Error fetching booked rides:', error);
      }
    );
  }

  fetchUserNames() {
    this.bookedRides.forEach(rides => {
      if (rides.slot.userId && !this.userNames[rides.slot.userId]) {
        this.adminService.getUser(rides.slot.userId).subscribe(
          (userInfo) => {
            this.userNames[rides.slot.userId] = userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'Unknown User';
          },
          error => {
            console.error('Error fetching user data:', error);
            this.userNames[rides.slot.userId] = 'Error fetching user';
          }
        );
      }
    });
  }

  async presentApprovalAlert(ride: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Approval',
      message: 'Are you sure you want to approve this ride?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            ride.slot.status = 'approved';
            this.adminService.approveTimeSlot(ride.year, ride.month, ride.day, ride.index).pipe(
              take(1), 
              switchMap(() => {
                return this.adminService.updateBookingToApproved(ride.year, ride.month, ride.day, ride.slot);
              }),
              tap(() => {
                this.removeRideFromListInHtml(ride.year, ride.month, ride.day, ride.index);
                this.fetchUserNames();
              })
            ).subscribe(
              () => {
                this.presentApprovalSuccessAlert();
              },
              error => {
                ride.slot.status = 'booked'; 
                this.presentErrorAlert();
                console.error('Error during approval process:', error);
              }
            );
          }
        }
      ]
    });

    await alert.present();
  }

  async presentDeclinationAlert(ride: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Declination',
      message: 'Are you sure you want to decline this ride?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            ride.slot.status = 'declined';
            this.adminService.declineTimeSlot(ride.year, ride.month, ride.day, ride.index).pipe(
              take(1), 
              switchMap(() => {
                return this.adminService.updateBookingToDeclined(ride.year, ride.month, ride.day, ride.slot);
              }),
              tap(() => {
                this.removeRideFromListInHtml(ride.year, ride.month, ride.day, ride.index);
                this.fetchUserNames();
              })
            ).subscribe(
              () => {
                this.presentDeclinationSuccessAlert();
              },
              error => {
                ride.slot.status = 'booked';
                this.presentErrorAlert();
                console.error('Error during declination process:', error);
              }
            );
          }

        }
      ]
    });

    await alert.present();
  }

  async presentApprovalSuccessAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Approval Successful',
      message: 'The booking has been successfully approved.',
      buttons: ['OK']
    });

    await alert.present();
  }

  async presentDeclinationSuccessAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Declination Successful',
      message: 'Your booking has been successfully declined.',
      buttons: ['OK']
    });

    await alert.present();
  }

  async presentErrorAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Cancellation Failed',
      message: 'There was an error cancelling your booking. Please try again later.',
      buttons: ['OK']
    });

    await alert.present();
  }

  approveRide(ride: any) {
    const datePath = `${ride.year}/${ride.month}/${ride.day}`;
    const slotIndex = ride.index;

    return this.adminService.approveTimeSlot(ride.year, ride.month, ride.day, slotIndex).subscribe({
      next: () => {
        console.log('Ride approved successfully');
      },
      error: (err) => {
        console.error('Failed to approve ride', err);
      }
    });
  }

  onApproveRide(bookedRide: any) {
    this.presentApprovalAlert(bookedRide);
  }

  onDeclineRide(bookedRide: any) {
    this.presentDeclinationAlert(bookedRide);
  }

  removeRideFromListInHtml(year: string, month: string, day: string, index: number) {
    this.bookedRides = this.bookedRides.filter(ride =>
      !(ride.year === year && ride.month === month && ride.day === day && ride.index === index)
    );
  }
}
