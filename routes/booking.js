// const express = require("express");
// const router = express.Router({ mergeParams: true });
// const wrapAsync = require("../utils/wrapAsync.js");
// const ExpressError = require("../utils/ExpressError.js");
// const { isLoggedIn } = require("../middleware.js"); 
// const Booking = require("../models/booking.js");
// const Listing = require("../models/listing.js");

// // New Booking Form
// router.get("/new",  isLoggedIn,  wrapAsync(async (req, res) => { 
//   const { id } = req.params;
//   const listing = await Listing.findById(id);
//   if (!listing) {
//     req.flash("error", "Listing not found!");
//     return res.redirect("/listings");
//   }
//   res.render("bookings/new.ejs", { listing });
// }));

// // Create New Booking
// router.post("/",  isLoggedIn,  wrapAsync(async (req, res) => { 
//   const { id } = req.params;
//   const listing = await Listing.findById(id);
//   if (!listing) {
//     req.flash("error", "Listing not found!");
//     return res.redirect("/listings");
//   }



// const newBooking = new Booking({
//   ...req.body.booking,
//   listing: listing._id,
//   user: req.user._id,
// });
// await newBooking.save();

// // Update the listing with the new booking
// listing.bookings.push(newBooking._id);
// await listing.save();

// req.flash("success", "Booking successful!");
// res.redirect(`/listings/${id}`);
// }));

// // Show Booking (Optional - for users to see their bookings)
// router.get("/:bookingId",  isLoggedIn,  wrapAsync(async (req, res) => { 
//   const { id, bookingId } = req.params;
//   const booking = await Booking.findById(bookingId).populate("listing").populate("user");

// if (!booking || !booking.user._id.equals(req.user._id)) {
//     req.flash("error", "Booking not found or unauthorized!");
//     return res.redirect(`/listings/${id}`);
//   }
//   res.render("bookings/show.ejs", { booking });
// }));

// // Delete Booking (Optional - for users to cancel bookings)
// router.delete("/:bookingId",  isLoggedIn,  wrapAsync(async (req, res) => { 
//   const { id, bookingId } = req.params;
//   const booking = await Booking.findByIdAndDelete(bookingId);
// //   // TEMPORARY CHECK - Adjust if you have a way to identify a temporary user
// //   if (!booking || booking.user.toString() !== "TEMP_USER_ID") {
// //     req.flash("error", "Booking not found or unauthorized!");
// //     return res.redirect(`/listings/${id}`);
// //   }
// //   req.flash("success", "Booking cancelled!");
// //   res.redirect(`/listings/${id}`);
// // }));
// if (!booking || !booking.user._id.equals(req.user._id)) {
//   req.flash("error", "Booking not found or unauthorized!");
//   return res.redirect(`/listings/${id}`);
// }
// req.flash("success", "Booking cancelled!");
// res.redirect(`/listings/${id}`);
// }));

// module.exports = router;

const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, validateBooking, isBookingAuthor } = require("../middleware");
const Booking = require("../models/booking");
const Listing = require("../models/listing");

// New booking form
router.get("/new", 
    isLoggedIn,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        res.render("bookings/new", { listing });
    })
);

// Create booking
router.post("/", 
    isLoggedIn,
    validateBooking,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        
        const { checkIn, checkOut, guests } = req.body.booking;
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        
        const nights = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);
        const totalPrice = nights * listing.price;
        
        const newBooking = new Booking({
            listing: id,
            user: req.user._id,
            checkIn,
            checkOut,
            guests,
            totalPrice
        });
        
        await newBooking.save();
        listing.bookings.push(newBooking._id);
        await listing.save();
        
        req.flash("success", "Booking created successfully!");
        res.redirect("/my-bookings");
    })
);

// Delete booking (only route we're keeping for modifications)
router.delete("/:bookingId", 
    isLoggedIn,
    isBookingAuthor,
    wrapAsync(async (req, res) => {
        const { id, bookingId } = req.params;
        
        
        // Remove booking from listing
        await Listing.findByIdAndUpdate(id, { $pull: { bookings: bookingId }});
        
        await Booking.findByIdAndDelete(bookingId);
        
        req.flash("success", "Booking cancelled successfully!");
        res.redirect("/my-bookings");
    })
);



module.exports = router;