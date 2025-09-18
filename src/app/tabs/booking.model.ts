import {TimeSlot} from "./time-slot.model";

export interface Booking {
  id: string;
  classType?: string | undefined;
  rideDate: string | undefined;
  timeSlot: TimeSlot;
  userId: string;
  departure?: string | null;
  arrival?: string | null;
}
