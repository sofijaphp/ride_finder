/* import {Component, OnInit} from '@angular/core';
import {BookingService} from "../../services/booking.service";
import {Booking} from "../booking.model";
import {map, Observable, Subscription, switchMap} from "rxjs";
import {AlertController} from "@ionic/angular";
import {TimeSlot} from "../time-slot.model";
import { AuthService } from 'src/app/auth/auth.service';
import {HttpClient} from "@angular/common/http";
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-book',
  templateUrl: './book.page.html',
  styleUrls: ['./book.page.scss'],
})
export class BookPage implements OnInit {

  /* classType: string | undefined;
  name: string | undefined;
  email: string | undefined;
  rideDate: string | undefined;
  bookings: Booking[] = [];
  timeSlots: TimeSlot[] = [];
  private bookingsSub: Subscription | undefined;
  departure?: string;
  arrival?: string; */

/*
  classType: string | null = null;
  departure: string | null = null;
  arrival: string | null = null;
  name: string | null = null;
  email: string | undefined;
  private bookingsSub: Subscription | undefined;
  // LAK DATUM
  rideDate: string | null = new Date().toISOString().slice(0,10); // "YYYY-MM-DD"
  presetTimes: string[] = ['08:00','10:00','12:00','14:00','16:00'];
  selectedTime: TimeSlot | null = null;
  bookings: Booking[] = [];
  timeSlots: TimeSlot[] = [];
  selectedTimeSlot: TimeSlot | undefined | null;

  constructor(private bookingService: BookingService, private alertCtrl: AlertController, private authService: AuthService, private nav: NavController, private http: HttpClient) {
  }

  ngOnInit() {

    this.rideDate = new Date().toISOString().slice(0,10);

    this.bookingsSub = this.bookingService.bookings.subscribe(bookings => {
      this.bookings = bookings;
    });
    this.loadTimeSlots();
  }


  ngOnDestroy() {
    if (this.bookingsSub) {
      this.bookingsSub.unsubscribe();
    }
  }

  selectSlot(slot: TimeSlot) {
    this.selectedTimeSlot = slot;
  }

  loadTimeSlots() {
    if (this.rideDate) {
      const selectedDate = this.rideDate.split('T')[0]; 
      this.bookingService.getTimeSlotsByDate(selectedDate).subscribe(slots => {
        console.log("Available slots:", slots);
        // @ts-ignore
        this.timeSlots = slots?.timeSlots;
        //this.timeSlots.date = selectedDate;
      });
    }
  }

    onDateChange(date: string | null) {
  if (!date) { this.timeSlots = []; this.selectedTimeSlot = null; return; }

  // date je već "YYYY-MM-DD"
  const selectedDate = date;

  this.bookingService.getTimeSlotsByDate(selectedDate).subscribe(res => {
    const slots = Array.isArray(res) ? res : res?.timeSlots;
    // uzmi samo 'available'
    this.timeSlots = (slots || []).filter((s: any) => s.status === 'available');

    // resetuj prethodni izbor vremena pri promeni datuma
    this.selectedTimeSlot = null;
  });
}

  
onSubmit() {
  console.log('SUBMIT ->', {
  classType: this.classType,
  date: this.rideDate,
  selectedTimeSlot: this.selectedTimeSlot
});
  if (!this.classType  || !this.selectedTimeSlot) return;

  const dateToSend = this.rideDate ?? new Date().toISOString().slice(0,10);

  this.bookingService.addBooking(this.classType, dateToSend, this.selectedTimeSlot).subscribe({
    next: () => this.nav.navigateRoot(['/tabs/my-rides']),
    error: (err) => console.error('[Book] addBooking error:', err)
  });
}

    
} */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, take } from 'rxjs';
import { NavController, AlertController } from '@ionic/angular';

import { BookingService } from '../../services/booking.service';
import { Booking } from '../booking.model';
import { TimeSlot } from '../time-slot.model';

@Component({
  selector: 'app-book',
  templateUrl: './book.page.html',
  styleUrls: ['./book.page.scss'],
})
export class BookPage implements OnInit, OnDestroy {
  // tvoja polja sa forme
  classType: string | null = null;           // npr. 'Small car'/'Bus'...
  departure: string | null = null;
  arrival: string | null = null;
  name: string | null = null;
  email: string | undefined;

  // datum i slotovi
  rideDate: string | null = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  timeSlots: TimeSlot[] = [];
  selectedTimeSlotIndex: number | null = null; // <<< biramo index, ne ceo objekat

  // ostalo
  bookings: Booking[] = [];
  private bookingsSub?: Subscription;

  constructor(
    private bookingService: BookingService,
    private nav: NavController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    // ako želiš lokalni prikaz rezervacija:
    this.bookingsSub = this.bookingService.bookings
      .pipe(take(1))
      .subscribe(list => (this.bookings = list || []));

    this.loadTimeSlots(); // učitaj slotove za današnji dan
  }

  ngOnDestroy() {
    this.bookingsSub?.unsubscribe();
  }

  // promene datuma iz datepickera
  onDateChange(date: string | null) {
    this.rideDate = date ?? new Date().toISOString().slice(0, 10);
    this.selectedTimeSlotIndex = null; // reset izbora kad se promeni datum
    this.loadTimeSlots();
  }

  defaultTimes: string[] = ['08:00', '10:00', '12:00', '14:00', '16:00'];

  // dohvat termina za izabrani dan
  private loadTimeSlots() {
  if (!this.rideDate) { this.timeSlots = []; this.selectedTimeSlotIndex = null; return; }
  const day = this.rideDate; // "YYYY-MM-DD"

  this.bookingService.getTimeSlotsByDate(day).subscribe({
    next: (res) => {
      // uzmi šta god postoji u bazi
      const fetched = res?.timeSlots || [];
      // prikaži samo available (mala slova!)
      let slots = fetched.filter(s => (s.status || '').toLowerCase() === 'available');

      // ako nema ničega u bazi — prikaži default slotove (front-end)
      if (slots.length === 0) {
        slots = this.defaultTimes.map((t, idx) => ({
          startTime: t,
          status: 'available',
          index: idx
        } as any));
      }

      this.timeSlots = slots;
      this.selectedTimeSlotIndex = null;
    },
    error: (err) => {
      console.error('[Book] getTimeSlotsByDate error:', err?.error || err);
      // fallback i kad poziv padne
      this.timeSlots = this.defaultTimes.map((t, idx) => ({
        startTime: t, status: 'available', index: idx
      } as any));
      this.selectedTimeSlotIndex = null;
    }
  });
}

  // submit forme
  async onSubmit(): Promise<void> {
    // validacije sa jasnim porukama
    if (!this.classType) {
      await this.showAlert('Please choose a class type.');
      return;
    }
    if (!this.rideDate) {
      await this.showAlert('Please choose a date.');
      return;
    }
    if (this.selectedTimeSlotIndex == null) {
      await this.showAlert('Please choose a time slot.');
      return;
    }

    // uzmi slot iz niza i dopiši njegov index
    const idx = this.selectedTimeSlotIndex;
    const base = this.timeSlots[idx];
    if (!base) {
      await this.showAlert('Selected time slot not found.');
      return;
    }
    const slotWithIndex: TimeSlot = { ...base, index: idx };

    const dateToSend = this.rideDate; // "YYYY-MM-DD"

    this.bookingService
      .addBooking(this.classType, dateToSend, slotWithIndex, this.departure, this.arrival)
      .subscribe({
        next: () => {
          console.log('[Book] booking saved');
          this.nav.navigateRoot(['/tabs/my-rides']);
        },
        error: async (err) => {
          console.error('[Book] addBooking error:', err?.error || err);
          const msg =
            err?.error?.error ||
            err?.error?.message ||
            err?.message ||
            'Could not save the booking.';
          await this.showAlert(msg);
        },
      });
  }

  // helper za poruke
  private async showAlert(message: string) {
    const a = await this.alertCtrl.create({
      header: 'Booking',
      message,
      buttons: ['OK'],
    });
    await a.present();
  }
}
