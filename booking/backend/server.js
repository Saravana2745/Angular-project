const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const { tick } = require('@angular/core/testing');


dotenv.config();

const app = express();


app.use(cors()); 
app.use(express.json()); 


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  place: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  guests: { type: Number, required: true },
  amount: { type: Number, required: true }
});
const placeRates = {
  Chennai: 500,
  Madurai: 400,
  Coimbatore: 450,
  Karur: 350,
};

const Booking = mongoose.model('Booking', bookingSchema);


app.post('/api/bookings', async (req, res) => {
  try {
    const{ name, email, place, date, time, guests } = req.body;
    const rate = placeRates[place] || 0;
    const amount = rate * guests;
    const tickets = Math.ceil(guests/1);
    const newBooking = new Booking({
      name,
      email,
      place,
      date,
      time,
      guests,
      amount
    });
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const booking_Id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(booking_Id)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    const booking = await Booking.findById(booking_Id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

  
    const cancellationCharge = booking.amount * 0.1; 
    const balanceAmount = booking.amount - cancellationCharge;

    
    await Booking.findByIdAndDelete(booking_Id);

    
    res.status(200).json({
      message: 'Booking cancelled successfully',
      cancellationCharge,
      balanceAmount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});