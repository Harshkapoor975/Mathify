const express = require('express');
const { verifyJWT } = require('../../middlewares/auth');
const { getMe, getMyMatches } = require('./user.controller');

const router = express.Router();

router.get('/me', verifyJWT, getMe);
router.get('/me/matches', verifyJWT, getMyMatches);

module.exports = router;