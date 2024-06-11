const express = require("express");
const router = express.Router();
const wrapAsync = require("../../utils/wrapAsync.js")
const {listingSchema } = require("..//../schema.js")
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("./models/listing.js");
const {isLoggedIn, isOwner , validateListing} = require("..middleware.js");


const validateListing = (req, res ,next) => {
    let {error} = listingSchema.validate(req.body); 
  
    if(error){
       let errMsg = error.details.map((el) => el.message).join(" , ")
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
  };
 
  //Index Route
router.get("/", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  });
  
  //New Route
  router.get("/new",isLoggedIn, (req, res) => {

    res.render("listings/new.ejs");
  });

//Show Route
// router.get(
//     "/listings/:id" , 
//     wrapAsync(async (req, res) => {
//     let {id} = req.params;
//     const listing = await Listing.findById(id).populate("reviews");
//     res.render("Listings/show.ejs", {listing});
//   })
//   );

//Create Route
router.post(
    "/",   
    isLoggedIn,
    validateListing,
    wrapAsync(async (req, res, next) => {
     
      const newListing = new Listing(req.body.listing);
        await newListing.save();
        req.flash("success" , "New Listing Created");
        res.redirect("/listings");
      })
  );

//Update Route
router.put("/:id",
  isLoggedIn, 
validateListing,
wrapAsync(async (req, res) => {
  let { id } = req.params;
  let listing  = await Listing.findById(id);
  if(listing.owner._id.equals(currUser._id)){
    req.flash("error" , "You don't have permission to edit");
    res.redirect(`/listings/${id}`);
  }

  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete(
  "/:id",
  isLoggedIn,
 wrapAsync(async (req, res) => {
  let{id}  = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  req.flash("success" , "Listing Deleted!");
  res.redirect("/listings");
})
);

// Show Route GPT Ka Code
// Show Route
router.get("/:id", async (req, res, next) => {
    try {
      let id = req.params.id.trim(); // Trim the ID to remove any leading or trailing spaces
  
      // Validate the ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid listing ID");
      }
  
      const listing = await Listing.findById(id);
      if (!listing) {
        req.flash("error", "Listing you requested for does not exists");
        throw new ExpressError(404, "Listing not found");
      }
      res.render("listings/show.ejs", { listing });
    } catch (err) {
      next(err); // Pass errors to the error handling middleware
    }
  });

  //Edit Route
//   app.get(
//     "/listings/:id/edit",
//    wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit.ejs", { listing });
//   })
//   );

// Edit Route GPT Ka Code
router.get("/:id/edit", async (req, res, next) => {
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
  

  module.exports = router;