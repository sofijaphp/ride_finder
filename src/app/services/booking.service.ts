import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  map,
  switchMap,
  take,
  tap,
  catchError
} from 'rxjs';

import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { Booking } from '../tabs/booking.model';
import { TimeSlot } from '../tabs/time-slot.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl = environment.firebase.databaseURL;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private _bookings = new BehaviorSubject<Booking[]>([]);
  get bookings() {
    return this._bookings.asObservable();
  }

  getBookings(): void {
    this.authService.token
      .pipe(
        take(1),
        switchMap((token) =>
          this.http.get<{ [key: string]: Booking }>(
            `${this.baseUrl}/bookings.json?auth=${token}`
          )
        ),
        switchMap((responseData) =>
          this.authService.userId.pipe(
            take(1),
            map((userId) => {
              const arr: Booking[] = [];
              for (const key in responseData) {
                if (
                  Object.prototype.hasOwnProperty.call(responseData, key) &&
                  responseData[key].userId === userId
                ) {
                  arr.push({ ...responseData[key], id: key });
                }
              }
              return arr;
            })
          )
        )
      )
      .subscribe((list) => this._bookings.next(list));
  }

  addBooking(
    classType: string | undefined,
    date: string | undefined,
    timeSlot: TimeSlot,
    departure?: string | null,
    arrival?: string | null
  ): Observable<any> {
    const dateToSend = date ?? new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    return this.authService.token.pipe(
      take(1),
      switchMap((token) =>
        this.authService.userId.pipe(
          take(1),
          switchMap((userId) => {
            if (!userId || !token) throw new Error('User not authenticated!');

            const newBooking: Booking = {
              id: '',
              classType,
              rideDate: dateToSend,
              timeSlot: {
                id: timeSlot.id,
                status: timeSlot.status,
                date: timeSlot.date,
                startTime: timeSlot.startTime,
                isAvailable: timeSlot.isAvailable,
                index: timeSlot.index
              },
              userId,
              departure: departure ?? null,
              arrival: arrival ?? null,
            };

            const postUrl = `${this.baseUrl}/bookings.json?auth=${token}`;

            return this.http
              .post<{ name: string }>(postUrl, newBooking)
              .pipe(
                switchMap((res) => {
                  const generatedId = res.name;
                  newBooking.id = generatedId;

                  const [y, m, d] = dateToSend.split('-');
                  const mm = (m ?? '').padStart(2, '0');
                  const dd = (d ?? '').padStart(2, '0');

                  const idx = newBooking.timeSlot.index;
                  if (idx === undefined || idx === null) {
                    throw new Error('TimeSlot index is missing.');
                  }

                  const patchUrl = `${this.baseUrl}/rides/${y}/${mm}/${dd}/timeSlots/${idx}.json?auth=${token}`;
                  return this.http.patch(patchUrl, {
                      status: 'booked',
                      userId: newBooking.userId,
                      classType: classType ?? null
                    }).pipe(
                      tap(() => {
                        newBooking.timeSlot.status = 'booked'; 
                        this._bookings.next([newBooking, ...this._bookings.getValue()]);
                      })
                    );
                })
              );
          })
        )
      )
    );
  }

  deleteBooking(
    bookingId: string,
    date: string,
    timeSlot: TimeSlot
  ): Observable<any> {
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        const deleteUrl = `${this.baseUrl}/bookings/${bookingId}.json?auth=${token}`;
        return this.http.delete(deleteUrl).pipe(
          tap(() => {
            const next = this._bookings
              .getValue()
              .filter((b) => b.id !== bookingId);
            this._bookings.next(next);
          }),
          map(() => token)
        );
      }),
      switchMap((token) => {
        const [year, month, day] = date.split('-');
        const mm = (month ?? '').padStart(2, '0');
        const dd = (day ?? '').padStart(2, '0');
        const slotUrl = `${this.baseUrl}/rides/${year}/${mm}/${dd}/timeSlots/${timeSlot.index}.json?auth=${token}`;
        return this.http.patch(slotUrl, {
          status: 'available',
          userId: null,
          classType: null
        });
      })
    );
  }

  getTimeSlotsByDate(date: string) {
  return this.authService.token.pipe(
    take(1),
    switchMap(token => {
      const [yy, mm, dd] = date.split('-').map(n => n.padStart(2,'0'));
      const url = `${this.baseUrl}/rides/${yy}/${mm}/${dd}.json?auth=${token}`;
      return this.http.get<{ timeSlots?: TimeSlot[] }>(url).pipe(
        map(res => {
          if (!res?.timeSlots) return { date, timeSlots: [] as TimeSlot[] };
          const withIndex = res.timeSlots.map((slot, idx) => ({ ...slot, index: idx }));
          return { date, timeSlots: withIndex };
        })
      );
    })
  );
}

  updateBookingToApproved(
    year: any,
    month: any,
    day: any,
    slot: any
  ): Observable<any> {
    const mm = month.toString().padStart(2, '0');
    const dd = day.toString().padStart(2, '0');
    const date = `${year}-${mm}-${dd}`;

    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        const bookingsUrl = `${this.baseUrl}/bookings.json?auth=${token}&orderBy="rideDate"&equalTo="${date}"`;
        return this.http.get<{ [key: string]: any }>(bookingsUrl).pipe(
          switchMap((bookings) => {
            if (!bookings) throw new Error('No reservations found for the given date');

            const updates: any = {};
            Object.keys(bookings).forEach((key) => {
              const b = bookings[key];
              if (b.timeSlot?.startTime === slot.startTime) {
                updates[`/bookings/${key}/timeSlot/status`] = 'approved';
              }
            });

            if (Object.keys(updates).length > 0) {
              return this.http.patch(
                `${this.baseUrl}/.json?auth=${token}`,
                updates
              );
            } else {
              throw new Error('No matching slot found');
            }
          })
        );
      }),
      catchError((error) => {
        console.error('Greška u updateBookingToApproved:', error);
        throw error;
      })
    );
  }
}

