const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema , reviewSchema  } = require("./schema.js")
const Review = require("./models/review.js")

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

const validateListing = (req, res ,next) => {
  let {error} = listingSchema.validate(req.body); 

  if(error){
     let errMsg = error.details.map((el) => el.message).join(" , ")
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

const validateReview = (req, res ,next) => {
  let {error} = reviewSchema.validate(req.body); 

  if(error){
     let errMsg = error.details.map((el) => el.message).join(" , ")
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//Index Route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// //Show Route
// app.get("/listings/:id" , async (req, res) => {
//   let {id} = req.params;
//   const listing = await Listing.findById(id);
//   res.render("Listings/show.ejs", {listing});
// });

// Show Route GPT Ka Code
// Show Route
app.get("/listings/:id", async (req, res, next) => {
  try {
    let id = req.params.id.trim(); // Trim the ID to remove any leading or trailing spaces

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ExpressError(400, "Invalid listing ID");
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }
    res.render("listings/show.ejs", { listing });
  } catch (err) {
    next(err); // Pass errors to the error handling middleware
  }
});

//Create Route
app.post(
  "/listings",   
  validateListing,
  wrapAsync(async (req, res, next) => {
   
    const newListing = new Listing(req.body.listing);
      await newListing.save();
      res.redirect("/listings");
    })
);

// //Edit Route
// app.get("/listings/:id/edit",
//  wrapAsync(async (req, res) => {
//   let { id } = req.params;
//   const listing = await Listing.findById(id);
//   res.render("listings/edit.ejs", { listing });
// }));


// Edit Route GPT Ka Code
app.get("/listings/:id/edit", async (req, res, next) => {
  try {
    let id = req.params.id.trim(); // Trim the ID to remove any leading or trailing spaces

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ExpressError(400, "Invalid listing ID");
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }
    res.render("listings/edit.ejs", { listing });
  } catch (err) {
    next(err); // Pass errors to the error handling middleware
  }
});

//Update Route
app.put("/listings/:id", 
validateListing,
wrapAsync(async (req, res) => {
  if(!req.body.listing){
    throw new ExpressError(400,"Send valid data for listing");
  }
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id",
 wrapAsync(async (req, res) => {
  let{id}  = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  res.redirect("/listings");
})
);
 
//Reviews Post Route
app.post("/listing/:id/reviews",
validateReview, 
wrapAsync( async (req, res) =>{
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`);

}));

//Delete Review Route
app.delete("/listings/:id/reviews/:reviewId",
 wrapAsync(async(req, res) => {
  let {id, reviewId} = req.params;

 await Listing.findByIdAndUpdate(id, {$pull:{reviews:reviewId}}),
 await  Review.findByIdAndDelete(review);

res.redirect(`/listings/${id}`);
 }))

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

app.all("*",(req,res, next) =>{
  next(new ExpressError(404,"Page Not Found!"));
}) 

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message, err }); // pass err object
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});

