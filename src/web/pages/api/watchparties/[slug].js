import { executeOnDb } from '../../../lib/Db.js'
import logger from '../../../lib/logger'

export default async function handler(req, res) {
    return new Promise(async resolve => {
        const { slug } = req.query
        try {
            await executeOnDb(async dbs => {
                const watchparties = await dbs.watchparties.query(watchparty => watchparty.slug === slug)
                if (watchparties.length === 0) {
                    res.status(404).json({})
                } else {
                    const organizerId = await dbs.organizers.get(slug)
                    const organizer = await dbs.candidateParticipants.get(organizerId)[0]
                    const candidateParticipants = await dbs.candidateParticipants.query(participant => participant.watchparty === slug)
                    const cohorts = await dbs.cohorts.query(cohort => organizer.cohorts.includes(cohort._id))
                    res.status(200).json({ ...watchparties[0], organizer, participants: candidateParticipants.length, cohorts })   
                }
            })
        } catch(e) {
            logger.error(e)
            res.status(500).json({ error: 'Unexpected error : ' + e })                 
        } finally {
            resolve()
        }
    })
}