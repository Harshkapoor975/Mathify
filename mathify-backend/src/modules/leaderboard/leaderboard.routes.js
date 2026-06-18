const express = require("express");
const { getLeaderboard, getMyRank } = require("./leaderboard.controller");
const { verifyJWT } = require("../../middlewares/auth");

const router = express.Router();

router.get("/", getLeaderboard);           
router.get("/me", verifyJWT, getMyRank);    

module.exports = router;