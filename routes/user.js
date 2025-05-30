const express = require("express");
const router = express.Router({mergeParams: true});
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync")
const passport = require("passport");
const Booking = require("../models/booking.js");
const { isLoggedIn } = require("../middleware");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js")

router.route("/signup")
.get( userController.rendersignupForm)
.post( wrapAsync (userController.signup)
);

router.route("/login")
.get( userController.renderLoginForm)
.post( saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true}) , userController.login
);




// router.get("/signup", userController.renderSignupForm);

// router.post("/signup", wrapAsync (userController.signup)
// );

// router.get("/login", userController.renderLoginForm);

// router.post("/login" , saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true}) , userController.login
// );



router.get("/logout",  userController.logout);


router.get("/my-bookings", 
    isLoggedIn,
    wrapAsync( async (req, res) => {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('listing');
              console.log("Bookings data:", bookings); 
        res.render("users/myBookings", { bookings });
    })
);




module.exports = router;