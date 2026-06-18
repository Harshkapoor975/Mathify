const User = require("../../models/user.model");

const K_FACTOR = 32;

const redis = require("../../config/redis") ;

function calcElo(winnerRating, loserRating) {
    const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const expectedLoser  = 1 - expectedWinner;
    return {
        winnerDelta: Math.round(K_FACTOR * (1 - expectedWinner)),
        loserDelta:  Math.round(K_FACTOR * (0 - expectedLoser)),   // negative
    };
}

async function updateRatings(winnerId, loserId) {
    const [winner, loser] = await Promise.all([
        User.findById(winnerId),
        User.findById(loserId),
    ]);

    if (!winner || !loser) return;

    const { winnerDelta, loserDelta } = calcElo(winner.rating, loser.rating);
    const winnerRatingBefore = winner.rating;
    const loserRatingBefore = loser.rating;
    const winnerRatingAfter = winner.rating + winnerDelta;
    const loserRatingAfter = loser.rating + loserDelta;

    await Promise.all([
        User.findByIdAndUpdate(winnerId, {
            $inc: { rating: winnerDelta, wins: 1, gamesPlayed: 1 },
        }),
        User.findByIdAndUpdate(loserId, {
            $inc: { rating: loserDelta, losses: 1, gamesPlayed: 1 },
        }),
    ]);

    // Update the leaderboard in Redis
    await redis.zadd("leaderboard", winner.rating + winnerDelta, winner.username);
    await redis.zadd("leaderboard", loser.rating + loserDelta, loser.username);

    return {
        winnerDelta,
        loserDelta,
        winnerRatingBefore,
        loserRatingBefore,
        winnerRatingAfter,
        loserRatingAfter
    };
}

module.exports = { updateRatings, calcElo };
