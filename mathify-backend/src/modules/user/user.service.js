const User = require("../../models/user.model");
const { Match } = require("../../models/match.model") ;

const getMeService = async(userId) => {
    const result = await User.findById(userId).select("-password") ;
    if(!result){
        throw new Error ("User not found") ; 
    }
    return result ;
}

const getMyMatchesService = async (
    userId,
    page = 1,
    limit = 20
) => {
    const matches = await Match.find({
        "players.user": userId
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("winner", "username _id")
    .populate("players.user", "username rating _id");

    // Format matches for frontend
    return matches.map(match => {
        const userPlayer = match.players.find((player) =>
            player.user?._id?.toString() === userId.toString()
        );
        const opponent = match.players.find((player) =>
            player.user?._id?.toString() !== userId.toString()
        );
        const ratingDelta = userPlayer
            ? userPlayer.ratingAfter - userPlayer.ratingBefore
            : 0;

        return {
            _id: match._id,
            winner: match.winner,
            opponent: opponent?.user || null,
            ratingDelta,
            endedAt: match.createdAt,
            status: match.status
        };
    });
};

module.exports = {
    getMeService ,
    getMyMatchesService 
}
