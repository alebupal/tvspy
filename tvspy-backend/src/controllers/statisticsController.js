const registryRepository = require('../repositories/registryRepository');

class StatisticsController {
    async getGeneral(req, res) {
        try {
            const { type = 'time', daysAgo = 30, limit = 10 } = req.query;

            const stats = await registryRepository.getStatistics({
                type,
                daysAgo,
                limit
            });

            res.json(stats);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new StatisticsController();

