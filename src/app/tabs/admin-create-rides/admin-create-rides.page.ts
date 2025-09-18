import {Component, OnInit} from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-admin-create-rides',
  templateUrl: './admin-create-rides.page.html',
  styleUrls: ['./admin-create-rides.page.scss'],
})
export class AdminCreateRidesPage implements OnInit {

  minDate: string;
  maxDate: string;

  wholeMonth: boolean = false;

  selectedDate: string;
  selectedMonth: string;

  constructor(private authService: AuthService, private adminService: AdminService) {

    this.selectedDate = new Date().toISOString();
    this.selectedMonth = new Date().toISOString();

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

   
    this.minDate = new Date(currentYear, currentMonth, 1).toISOString();
    this.maxDate = new Date(currentYear + 1, 11, 31).toISOString();
  }

  ngOnInit() {
  }

  addRides() {

    const selectedMonth = new Date(this.selectedMonth);
    const selectedDate = new Date(this.selectedDate);

    if (this.wholeMonth) {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      this.adminService.generateRidesForMonth(year, month).subscribe({
        next: () => {
          console.log('Rides for the whole month were added successfully');
        },
        error: (err) => {
          console.error('Failed to add rides', err);
        }
      });
    } else {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      this.adminService.generateRidesForDay(year, month, selectedDate.getDate()).subscribe({
        next: () => {
          console.log('Rides for the selected day were added successfully');
        },
        error: (err) => {
          console.error('Failed to add rides', err);
        }
      });
    }
  }
}
