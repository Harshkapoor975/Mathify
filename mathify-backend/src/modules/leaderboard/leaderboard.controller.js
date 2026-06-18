const { getTopPlayers, getPlayerRank } = require("./leaderboard.service");

const getLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const players = await getTopPlayers(limit);

        res.status(200).json({
            success: true,
            data: players
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const getMyRank = async (req, res) => {
    try {
        const username = req.user.username;
        const result = await getPlayerRank(username);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Player not found in leaderboard"
            });
        }

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = { getLeaderboard, getMyRank };