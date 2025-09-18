import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import { AuthService } from '../auth/auth.service';
import {catchError, map, Observable, of, switchMap, take, tap, throwError} from "rxjs";

interface TimeSlot {
  index: number
  startTime: string;
  status: string;
  userId: string | null;
}

interface DayRides {
  timeSlots: TimeSlot[];
}

interface MonthRides {
  [day: string]: DayRides;
}

interface YearRides {
  [month: string]: MonthRides;
}

@Injectable({
  providedIn: 'root'
})

export class AdminService {

  baseUrl = 'https://ride-finder-2cf7e-default-rtdb.europe-west1.firebasedatabase.app';

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  generateRidesForDay(year: number, month: number, day: number) {
    console.log(year, month, day);
    return this.authService.token.pipe(
      switchMap(token => {
        const monthKey = `${(month + 1).toString().padStart(2, '0')}`;
        const yearKey = `${year}`;
        const dayKey = `${day.toString().padStart(2, '0')}`;

        const date = new Date(year, month, day);
        if (date.getDay() !== 0 && date.getDay() !== 6) { 
          const timeSlots: TimeSlot[] = [];
          let index = 0;

          for (let hour = 9; hour <= 15; hour++) {
            timeSlots.push({
              index: index,
              startTime: `${hour < 10 ? '0' + hour : hour}:00`,
              status: 'available',
              userId: null
            });
            index += 1;
            timeSlots.push({
              index: index,
              startTime: `${hour < 10 ? '0' + hour : hour}:30`,
              status: 'available',
              userId: null
            });
            index += 1;
          }

          
          const rides = {[yearKey]: {[monthKey]: {[dayKey]: {timeSlots}}}};

          const path = `${this.baseUrl}/rides/${yearKey}/${monthKey}/${dayKey}.json?auth=${token}`;
          return this.http.put(path, rides[yearKey][monthKey][dayKey]);
        } else {
          return of({message: "No rides can be booked on weekends."});
        }
      })
    );
  }

  generateRidesForMonth(year: number, month: number) {
    return this.authService.token.pipe(
      switchMap(token => {
        const rides: Record<string, YearRides> = {};
        const monthKey = `${(month + 1).toString().padStart(2, '0')}`;
        const yearKey = `${year}`;

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        for (let day = startDate; day <= endDate; day.setDate(day.getDate() + 1)) {
          if (day.getDay() !== 0 && day.getDay() !== 6) { 
            const timeSlots: TimeSlot[] = [];
            let index = 0;

            for (let hour = 9; hour <= 15; hour++) {
              timeSlots.push({
                index: index,
                startTime: `${hour < 10 ? '0' + hour : hour}:00`,
                status: 'available',
                userId: null
              });
              index += 1;
              timeSlots.push({
                index: index,
                startTime: `${hour < 10 ? '0' + hour : hour}:30`,
                status: 'available',
                userId: null
              });
              index += 1;
            }

            const monthKey = `${(month + 1).toString().padStart(2, '0')}`;
            const dayKey = `${day.getDate().toString().padStart(2, '0')}`;
            const yearKey = `${year}`;

            if (!rides[yearKey]) {
              rides[yearKey] = {};
            }
            if (!rides[yearKey][monthKey]) {
              rides[yearKey][monthKey] = {};
            }
            rides[yearKey][monthKey][dayKey] = {timeSlots};
          }
        }

        const path = `${this.baseUrl}/rides/${yearKey}/${monthKey}.json?auth=${token}`;
        return this.http.patch(path, rides[yearKey][monthKey]);
      })
    );
  }

  getAllBookedRides(): Observable<any[]> {
    return this.authService.token.pipe(
      take(1), 
      switchMap(token => {
        const url = `${this.baseUrl}/rides.json?auth=${token}`;
        return this.http.get<any>(url).pipe(
          map(responseData => {
            const bookedRides: any[] = [];
            if (responseData) {
              Object.keys(responseData).forEach(year => {
                Object.keys(responseData[year]).forEach(month => {
                  Object.keys(responseData[year][month]).forEach(day => {
                    const timeSlots = responseData[year][month][day]['timeSlots'];
                    if (timeSlots && Array.isArray(timeSlots)) {
                      timeSlots.forEach((slot, index) => {
                        if (slot.status === 'booked') {
                          bookedRides.push({
                            classType: slot.classType,
                            year,
                            month,
                            day,
                            slot,
                            index
                          });
                        }
                      });
                    }
                  });
                });
              });
            }
            return bookedRides;
          })
        );
      })
    );
  }

  getUser(userID: string) {
    return this.authService.token.pipe(
      take(1),  
      switchMap(token => {
        const url = `${this.baseUrl}/users/${userID}.json?auth=${token}`;
        return this.http.get<any>(url).pipe(
          take(1),
          catchError(error => {
            console.error('Error fetching user:', error);
            return of('Error fetching user');
          })
        );
      })
    );
  }

  approveTimeSlot(year: string, month: string, day: string, slotIndex: number): Observable<any> {
    return this.authService.token.pipe(
      switchMap(token => {
        const formattedMonth = month.padStart(2, '0');
        const formattedDay = day.padStart(2, '0');
        const slotUpdateUrl = `https://ride-finder-2cf7e-default-rtdb.europe-west1.firebasedatabase.app/rides/${year}/${formattedMonth}/${formattedDay}/timeSlots/${slotIndex}.json?auth=${token}`;
        return this.http.patch(slotUpdateUrl, {status: 'approved'});
      })
    );
  }
  declineTimeSlot(year: string, month: string, day: string, slotIndex: number): Observable<any> {
    return this.authService.token.pipe(
      switchMap(token => {
        const formattedMonth = month.padStart(2, '0');
        const formattedDay = day.padStart(2, '0');
        const slotUpdateUrl = `https://ride-finder-2cf7e-default-rtdb.europe-west1.firebasedatabase.app/rides/${year}/${formattedMonth}/${formattedDay}/timeSlots/${slotIndex}.json?auth=${token}`;
        return this.http.patch(slotUpdateUrl, {status: 'available', userId: null });
      })
    );
  }

  updateBookingToApproved(year: any, month: any, day: any, slot: any): Observable<any> {
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    const date = `${year}-${formattedMonth}-${formattedDay}`;
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        const bookingsUrl = `https://ride-finder-2cf7e-default-rtdb.europe-west1.firebasedatabase.app/bookings.json?auth=${token}&orderBy="rideDate"&equalTo="${date}"`;
        return this.http.get<{ [key: string]: any }>(bookingsUrl).pipe(
          map(bookings => {
            if (!bookings) {
              throw new Error('No reservations found for the given date');
            }
            const bookingKey = Object.keys(bookings).find(key => bookings[key].timeSlot.startTime === slot.startTime);
            if (!bookingKey) {
              throw new Error('No matching slot found');
            }
            return { key: bookingKey, token: token };
          }),
          switchMap(({ key, token }) => {
            const updatePath = `https://ride-finder-2cf7e-default-rtdb.europe-west1.firebasedatabase.app/bookings/${key}/timeSlot.json?auth=${token}`;
            return this.http.patch(updatePath, { status: 'approved' });
          })
        );
      }),
      catchError(error => {
        console.error("Greška u RxJS lancu:", error);
        return throwError(() => new Error('Update failed: ' + error));
      })
    );
  }
  updateBookingToDeclined(year: any, month: any, day: any, slot: any): Observable<any> {
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    const date = `${year}-${formattedMonth}-${formattedDay}`;
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        const bookingsUrl = `https://ride-finder-2cf7e-default-rtdb.europe-west1.firebasedatabase.app/bookings.json?auth=${token}&orderBy="rideDate"&equalTo="${date}"`;
        return this.http.get<{ [key: string]: any }>(bookingsUrl).pipe(
          map(bookings => {
            if (!bookings) {
              throw new Error('No reservations found for the given date');
            }
            const bookingKey = Object.keys(bookings).find(key => bookings[key].timeSlot.startTime === slot.startTime);
            if (!bookingKey) {
              throw new Error('No matching slot found');
            }
            return { key: bookingKey, token: token };
          }),
          switchMap(({ key, token }) => {
            const updatePath = `https://ride-finder-2cf7e-default-rtdb.europe-west1.firebasedatabase.app/bookings/${key}/timeSlot.json?auth=${token}`;
            return this.http.patch(updatePath, { status: 'declined' });
          })
        );
      }),
      catchError(error => {
        console.error("Greška u RxJS lancu:", error);
        return throwError(() => new Error('Update failed: ' + error));
      })
    );
  }
}