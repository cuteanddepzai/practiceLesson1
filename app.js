const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const User = require('./models/userModel');
const app = express();

app.use(cors());
app.use(express.static('./public/img'));
app.use(express.json());
app.use(cookieParser());



app.use('/api/v1/products', productRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/reviews', reviewRoutes);

module.exports = app;
