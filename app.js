if (process.env.NODE_ENV != "production") {
  require('dotenv').config();

}

// console.log(process.env);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const bookingRouter = require("./routes/booking.js");
const middleware = require("./middleware");

const listingController = require("./controllers/listing");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, '/public')));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};


// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  // res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  //  console.log("--- Middleware Debug ---");
  //   console.log("req.user:", req.user);
  //   console.log("res.locals.currUser:", res.locals.currUser);
  //   console.log("------------------------");

  // console.log(res.locals.success);
  next();
});


// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student"
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld");
//   res.send(registeredUser);
// });






app.use("/listings", listingRouter);
app.get("/", listingController.index);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/listings/:id/bookings", bookingRouter);




// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });

// app.all(/.*/, (req, res, next) => {
//   next(new ExpressError(404, "Page Not Found!"));
// });

app.use((err, req, res, next) => {
  console.error(err.stack);
  let {statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
  // res.send("something went wrong");

  // res.status(statusCode).render("error.ejs", { message });
  
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});




// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
// const ExpressError = require("./utils/ExpressError.js");
// const session = require("express-session");
// const flash = require("connect-flash");
// const passport = require("passport");
// const LocalStrategy = require("passport-local");
// const User = require("./models/user.js");

// const listingRouter = require("./routes/listing.js");
// const reviewRouter = require("./routes/review.js");
// const userRouter = require("./routes/user.js");
// // const bookingRouter = require("./routes/booking.js"); // Uncomment if using

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// // Connect to MongoDB
// async function main() {
//   await mongoose.connect(MONGO_URL);
// }
// main()
//   .then(() => console.log("Connected to DB"))
//   .catch((err) => console.error(err));

// // App setup
// app.engine("ejs", ejsMate);
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
// app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride("_method"));
// app.use(express.static(path.join(__dirname, "public")));

// // Session setup
// const sessionOptions = {
//   secret: "mysupersecretcode",
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//     httpOnly: true,
//   },
// };
// app.use(session(sessionOptions));
// app.use(flash());

// // Passport setup
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// // Flash middleware
// app.use((req, res, next) => {
//   res.locals.success = req.flash("success");
//   res.locals.error = req.flash("error");
//   res.locals.currUser = req.user;
//   next();
// });

// // Routes
// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });

// app.use("/listings", listingRouter);
// app.use("/listings/:id/reviews", reviewRouter);
// app.use("/", userRouter);
// // app.use("/listings/:id/bookings", bookingRouter); 

// // 404 handler
// app.all("*", (req, res, next) => {
//   next(new ExpressError(404, "Page Not Found!"));
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error("Error stack:", err.stack);
//   const { statusCode = 500 } = err;
//   const message = err.message || "Something went wrong!";
//   res.status(statusCode).render("error", { message });
// });

// // Start server
// app.listen(8080, () => {
//   console.log("Server is listening on port 8080");
// });