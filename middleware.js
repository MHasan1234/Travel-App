const Listing = require("./models/listing");
const Review = require("./models/review");
const Booking = require("./models/booking");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const { bookingSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {

  if(!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in to create listing!");
    return res.redirect("/login");
  }
  next();
  }

  module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
      res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
  }

  module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id )) {
      req.flash("error", "You are not the owner of this listing");
      return res.redirect(`/listings/${id}`);
    } 
    next();
  };    

  module.exports.validateListing = (res, req, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
  };

  module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
  };

  module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id )) {
      req.flash("error", "You are not the author of this review");
      return res.redirect(`/listings/${id}`);
    } 
    next();
  };    
  


//   module.exports.validateBooking = (req, res, next) => {
//     let { error } = bookingSchema.validate(req.body);
//     if (error) {
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }
// };

// // Add this authorization middleware
// module.exports.isBookingAuthor = async (req, res, next) => {
//     const { bookingId } = req.params;
//     const booking = await Booking.findById(bookingId);
    
//     if (!booking.user.equals(req.user._id)) {
//         req.flash("error", "You don't have permission to do that!");
//         return res.redirect(`/listings/${id}`);
//     }
    
//     next();
// };
  
// module.exports.isBookingAuthor = async (req, res, next) => {
//   const { bookingId } = req.params;
//   const booking = await Booking.findById(bookingId);
  
//   if (!booking) {
//       req.flash("error", "Booking not found!");
//       return res.redirect("/my-bookings");
//   }
  
//   if (!booking.user.equals(req.user._id)) {
//       req.flash("error", "You don't have permission to cancel this booking!");
//       return res.redirect("/my-bookings");
//   }
  
//   next();
// };


module.exports.validateBooking = (res, req, next) => {
  let { error } = bookingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// module.exports.isBookingAuthor = async (req, res, next) => {
//   let { id, bookingId } = req.params;
//   let booking = await Booking.findById(bookingId);
//   if (!booking.author.equals(res.locals.currUser._id )) {
//     req.flash("error", "You are not the author of this review");
//     return res.redirect(`/listings/${id}`);
//   } 
//   next();
// };    

module.exports.isBookingAuthor = async (req, res, next) => {
  let { id, bookingId } = req.params;
  let booking = await Booking.findById(bookingId);

  if (!booking || !booking.user) { // Changed 'author' to 'user' to match your booking model
      req.flash("error", "Booking not found!");
      return res.redirect(`/listings/${id}`);
  }

  if (!booking.user._id.equals(res.locals.currUser._id)) {
      req.flash("error", "You are not authorized to modify this booking.");
      return res.redirect(`/listings/${id}`);
  }
  next();
};