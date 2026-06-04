const { getMeService, getMyMatchesService } = require('./user.service');

const getMe = async (req, res) => {
    try {
        const result = await getMeService(req.user._id);
        res.status(200).json({
            success: true,
            message: 'Profile retrieved',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getMyMatches = async (req, res) => {
    try {
        const result = await getMyMatchesService(req.user._id);
        res.status(200).json({
            success: true,
            message: 'Matches retrieved',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { getMe, getMyMatches };