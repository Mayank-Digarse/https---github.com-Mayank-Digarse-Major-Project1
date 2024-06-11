modeule.exports.isLoggedIn = (req, res, next)=>{
    console.log(req.path,".." , req.originalUrl);
    if(!req.isAuthenticated()){
        //redirectUrl save
        req.session.redirectUrl=req.originalUrl;
        req.flash("error" , "you must be logged in to create listing");
        return res.redirect("/login");
    }
    next();
}