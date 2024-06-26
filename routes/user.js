const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");


router.get("/signup", (req, res)=>{
    res.send('users/signup.ejs');
})  ()

router.post("/signup",
    wrapAsync( async(req,res) =>{
        try{
            let {username , email, password} = req.body;
            const newUser = new User({email, username});
            const registeredUser = await User.register(newUser , password);
            console.log(registeredUser);
            req.login(registeredUser, (err)=>{
                if(err){
                    return next(err);
                }
            })
            req.flash("success", "Welcome to WanderLust");
            res.redirect("/listings");
        }catch(e){
            req.flash("error", e.message);
            res.redirect("/signup");

        }
   

    })    
);

router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect:"/login",
        failureFlash:true,
    }) ,
    async (req,res) =>{
        req.flash("success", "Welcome back to Wanderlust!");
        res.redirect(req.session.redirectUrl);
    }
);
router.get("/logout", (req, res)=>{
    req.logout((err)=>{
        if(err){
           return next(err);
        }
        req.flash("success", "You are logged out Now");
        res.redirect("/listings");
    })
})



module.exports = router;
