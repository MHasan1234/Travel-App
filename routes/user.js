const express = require("express");
const router = express.Router({mergeParams: true});
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync")
const passport = require("passport");
const Booking = require("../models/booking.js");
const { isLoggedIn } = require("../middleware");
const { saveRedirectUrl } = require("../middleware.js");

// const userController = require("../controllers/users.js")

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync (async(req, res) => {
    try { 
    let {username, email, password} = req.body;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
        if(err) {
            return next(err);
        }
   
    req.flash("success", "Welcome to Voyage!");
    res.redirect("/listings" );
    })
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }

})
);

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login" , saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true}) , async (req, res) => {
    req.flash("success","Welcome to Voyage!! You are logged in");

    
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}
);



router.get("/logout",  (req, res, next) => {
    req.logout((err) => {
        if(err) {
           return next(err);
        }
        req.flash("success", "you are logged out now");
        res.redirect("/listings");
    })
})


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