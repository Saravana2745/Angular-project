import { Component,OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import {FormsModule} from '@angular/forms';
import { NgIf,NgFor } from '@angular/common'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  title = 'booking';
  booking = {
    name: '',
    email: '',
    place:'',
    date:'',
    time:'',
    guests:1,
    amount:0,
};
bookings:any[]=[];
placeRates: Record<'Chennai' | 'Madurai' | 'Coimbatore' | 'Karur', number> = {
  Chennai: 500,
  Madurai: 400,
  Coimbatore: 450,
  Karur: 350
};
calculateAmount(): number {
  const rate = this.placeRates[this.booking.place as keyof typeof this.placeRates] || 0;
  this.booking.amount = Math.ceil(this.booking.guests / 1);
  return rate * this.booking.guests
}

constructor(private http: HttpClient) {}

ngOnInit(){
  this.fetchBookings();
}
fetchBookings(){
  this.http.get('http://localhost:5000/api/bookings').subscribe({
    next: (response: any) => {
      this.bookings = response;
      console.log('Bookings:', this.bookings); 
    },
    error: (error) => {
      console.error('Error fetching bookings:', error);
      alert('Failed to fetch bookings. Please try again later.');
    }
  });
}

submitBooking() {
  this.http.post('http://localhost:5000/api/bookings', this.booking).subscribe({
next: (response:any) => {
  alert('Booking successful!');
  this.bookings.push(response);
  this.fetchBookings();
  this.booking = {name:'', email:'',place:'', date:'', time:'', guests:1,amount:0};
  this.calculateAmount();
},
error: (error) => {
  alert('Error: ' + error.message);
  console.error('There was an error!', error);
}
});
}

cancelBooking(booking_Id: string) {
  console.log('Booking ID to cancel:', booking_Id);
  if(!booking_Id) {
    alert('invalid booking ID!');
    return;
  }
  if (confirm('Are you sure you want to cancel this booking? A 10% cancellation charge will apply.')) {
    this.http.delete<{ cancellationCharge: number; balanceAmount: number }>(`http://localhost:5000/api/bookings/${booking_Id}`).subscribe({
      next: (response) => {
        alert(`Booking cancelled successfully!\nCancellation Charge: ₹${response.cancellationCharge}\nBalance Amount: ₹${response.balanceAmount}`);
        this.fetchBookings();
      },
      error: (error) => {
        alert('Error: ' + error.message);
      }
    });
  }
}
}