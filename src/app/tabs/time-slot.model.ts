export interface TimeSlot {
  id?: string;
  date?: string;
  startTime: string;
  status: 'available' | 'booked' | 'approved' | string;
  isAvailable?: boolean;
  index?: number;
}