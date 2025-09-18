import {Component, OnInit} from '@angular/core';
import { Booking } from '../booking.model';
import {Subscription} from 'rxjs';
import { BookingService } from 'src/app/services/booking.service';
import {AlertController} from "@ionic/angular";
import { TimeSlot } from '../time-slot.model';

@Component({
  selector: 'app-my-rides',
  templateUrl: './my-rides.page.html',
  styleUrls: ['./my-rides.page.scss'],
})
export class MyRidesPage implements OnInit {

  bookings: Booking[] = [];
  private bookingsSub: Subscription | undefined;

  constructor(private bookingService: BookingService, private alertCtrl: AlertController) {
  }
  

  ngOnInit() {
    this.bookingsSub = this.bookingService.bookings.subscribe(bookings => {
      this.bookings = bookings;
    });
    this.bookingService.getBookings();
  }

  ngOnDestroy() {
    if (this.bookingsSub) {
      this.bookingsSub.unsubscribe();
    }
  }

  onCancelBooking(bookingId: string, date: string | undefined, timeSlot: TimeSlot) {
    // @ts-ignore
    this.presentConfirmAlert(bookingId, date, timeSlot);
  }

  async presentConfirmAlert(bookingId: string, date: string, timeSlot: TimeSlot) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Cancellation',
      message: 'Are you sure you want to delete this reservation?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.bookingService.deleteBooking(bookingId, date, timeSlot).subscribe(
              () => {
                this.bookings = this.bookings.filter(res => res.id !== bookingId);
                this.presentCancellationSuccessAlert();
              },
              (error) => {
                this.presentErrorAlert();
                console.error('Error deleting reservation:', error);
              }
            );
          }
        }
      ]
    });

    await alert.present();
  }

  async presentCancellationSuccessAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Cancellation Successful',
      message: 'Your reservation has been successfully cancelled.',
      buttons: ['OK']
    });

    await alert.present();
  }

  async presentErrorAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Cancellation Failed',
      message: 'There was an error cancelling your reservation. Please try again later.',
      buttons: ['OK']
    });

    await alert.present();
  }

}
