// import express from "express" ;

// import {signup,login} from "./auth.controller.js" ;
const express = require('express');
const {signup,login} = require('./auth.controller') ;

const router = express.Router() ;

router.post("/signup",signup) ;
router.post("/login",login) ;

// export default router ;
module.exports = router ;
