// const mongoose = require("mongoose");

// const User = require("../../models/user.model");
// const { Match } = require("../../models/match.model");
// const { GAME_STATES } = require("./game.engine");
// const { updateRatings } = require("../user/rating.service");

// function isPersistableUserId(userId) {
//     return mongoose.Types.ObjectId.isValid(userId);
// }

// function canPersistGame(game) {
//     return (
//         game &&
//         !game.persisted &&
//         Array.isArray(game.playerIds) &&
//         game.playerIds.length === 2 &&
//         game.playerIds.every(isPersistableUserId)
//     );
// }

// function getScores(game) {
//     return Object.fromEntries(
//         game.playerIds.map((playerId) => [
//             playerId,
//             game.players[playerId]?.currentQuestionIndex ?? 0
//         ])
//     );
// }

// async function persistTerminalGame(game) {
//     if (!canPersistGame(game)) {
//         return null;
//     }

//     game.persisted = true;

//     const [player1Id, player2Id] = game.playerIds;
//     const scores = getScores(game);
//     const duration = game.startedAt && game.endedAt
//         ? Math.max(0, Math.round((game.endedAt - game.startedAt) / 1000))
//         : undefined;

//     if (game.state === GAME_STATES.COMPLETED && game.winner) {
//         const winnerId = game.winner;
//         const loserId = game.playerIds.find((playerId) => playerId !== winnerId);
//         const ratingResult = await updateRatings(winnerId, loserId);

//         if (!ratingResult) {
//             return null;
//         }

//         const ratingByUser = {
//             [winnerId]: {
//                 before: ratingResult.winnerRatingBefore,
//                 after: ratingResult.winnerRatingAfter
//             },
//             [loserId]: {
//                 before: ratingResult.loserRatingBefore,
//                 after: ratingResult.loserRatingAfter
//             }
//         };

//         return Match.create({
//             roomId: game.id,
//             gameType: "math-race",
//             players: game.playerIds.map((playerId) => ({
//                 user: playerId,
//                 score: scores[playerId],
//                 ratingBefore: ratingByUser[playerId].before,
//                 ratingAfter: ratingByUser[playerId].after
//             })),
//             winner: winnerId,
//             status: "completed",
//             duration
//         });
//     }

//     if (game.state === GAME_STATES.ABORTED) {
//         const users = await User.find({
//             _id: {
//                 $in: [player1Id, player2Id]
//             }
//         }).select("rating");

//         const ratingByUser = Object.fromEntries(
//             users.map((user) => [
//                 user._id.toString(),
//                 user.rating
//             ])
//         );

//         return Match.create({
//             roomId: game.id,
//             gameType: "math-race",
//             players: game.playerIds.map((playerId) => ({
//                 user: playerId,
//                 score: scores[playerId],
//                 ratingBefore: ratingByUser[playerId] ?? 1000,
//                 ratingAfter: ratingByUser[playerId] ?? 1000
//             })),
//             status: "abandoned",
//             duration
//         });
//     }

//     game.persisted = false;
//     return null;
// }

// module.exports = {
//     persistTerminalGame,
//     isPersistableUserId
// };

const mongoose = require("mongoose");

const User = require("../../models/user.model");
const { Match } = require("../../models/match.model");
const { GAME_STATES } = require("./game.engine");
const { updateRatings } = require("../user/rating.service");

function isPersistableUserId(userId) {
    return mongoose.Types.ObjectId.isValid(userId);
}

function canPersistGame(game) {
    return (
        game &&
        !game.persisted &&
        Array.isArray(game.playerIds) &&
        game.playerIds.length === 2 &&
        game.playerIds.every(isPersistableUserId)
    );
}

// function getScores(game) {
//     const scores = {};

//     for (const playerId of game.playerIds) {
//         scores[playerId] =
//             game.players[playerId]?.currentQuestionIndex ?? 0;
//     }

//     return scores;
// }
function getScores(game) {
    const scores = {};

    for (const playerId of game.playerIds) {
        const player = game.players[playerId];

        // survival uses score, blitz uses currentQuestionIndex
        scores[playerId] = player?.score ?? player?.currentQuestionIndex ?? 0;
    }

    return scores;
}

function getDuration(game) {
    if (!game.startedAt || !game.endedAt) {
        return undefined;
    }

    return Math.max(
        0,
        Math.round((game.endedAt - game.startedAt) / 1000)
    );
}

function getWinnerLoser(game) {
    const winnerId = game.winner;
    const loserId = game.playerIds.find(
        (playerId) => playerId !== winnerId
    );

    return { winnerId, loserId };
}

function buildCompletedPlayers(game, scores, ratingResult) {
    const { winnerId, loserId } = getWinnerLoser(game);

    const ratings = {
        [winnerId]: {
            before: ratingResult.winnerRatingBefore,
            after: ratingResult.winnerRatingAfter
        },
        [loserId]: {
            before: ratingResult.loserRatingBefore,
            after: ratingResult.loserRatingAfter
        }
    };

    return game.playerIds.map((playerId) => ({
        user: playerId,
        score: scores[playerId],
        ratingBefore: ratings[playerId].before,
        ratingAfter: ratings[playerId].after
    }));
}

async function getCurrentRatings(playerIds) {
    const users = await User.find({
        _id: { $in: playerIds }
    }).select("rating");

    const ratings = {};

    for (const user of users) {
        ratings[user._id.toString()] = user.rating;
    }

    return ratings;
}

function buildAbortedPlayers(game, scores, ratings) {
    return game.playerIds.map((playerId) => ({
        user: playerId,
        score: scores[playerId],
        ratingBefore: ratings[playerId] ?? 1000,
        ratingAfter: ratings[playerId] ?? 1000
    }));
}

// async function persistCompletedGame(game, scores, duration) {
//     const { winnerId, loserId } = getWinnerLoser(game);

//     const ratingResult = await updateRatings(
//         winnerId,
//         loserId
//     );

//     if (!ratingResult) {
//         return null;
//     }

//     return Match.create({
//         roomId: game.id,
//         gameType: "math-race",
//         players: buildCompletedPlayers(
//             game,
//             scores,
//             ratingResult
//         ),
//         winner: winnerId,
//         status: "completed",
//         duration
//     });
// }
async function persistCompletedGame(game, scores, duration) {
    const { winnerId, loserId } = getWinnerLoser(game);

    const ratingResult = await updateRatings(winnerId, loserId);

    if (!ratingResult) return null;

    return Match.create({
        roomId: game.id,
        gameType: game.type ?? "Blitz",   // ← use actual type
        players: buildCompletedPlayers(game, scores, ratingResult),
        winner: winnerId,
        status: "completed",
        duration
    });
}

async function persistAbortedGame(game, scores, duration) {
    const ratings = await getCurrentRatings(game.playerIds);

    return Match.create({
        roomId: game.id,
        gameType: game.type ?? "Blitz",   // ← use actual type
        players: buildAbortedPlayers(game, scores, ratings),
        status: "abandoned",
        duration
    });
}

async function persistAbortedGame(game, scores, duration) {
    const ratings = await getCurrentRatings(
        game.playerIds
    );

    return Match.create({
        roomId: game.id,
        gameType: "Blitz",
        players: buildAbortedPlayers(
            game,
            scores,
            ratings
        ),
        status: "abandoned",
        duration
    });
}

async function persistTerminalGame(game) {
    if (!canPersistGame(game)) {
        return null;
    }

    game.persisted = true;

    const scores = getScores(game);
    const duration = getDuration(game);

    if (
        game.state === GAME_STATES.COMPLETED &&
        game.winner
    ) {
        return persistCompletedGame(
            game,
            scores,
            duration
        );
    }

    if (
        game.state === GAME_STATES.ABORTED
    ) {
        return persistAbortedGame(
            game,
            scores,
            duration
        );
    }

    game.persisted = false;
    return null;
}

module.exports = {
    persistTerminalGame,
    isPersistableUserId
};