import { executeOnDb } from '../../lib/Db.js'
import { randomUUID } from 'crypto'
import logger from '../../lib/logger'

export default async function handler(req, res) {
    return new Promise(async resolve => {
        if(req.method === 'PUT') {
            try {
                if(!req.body.address || !req.body.cohorts || !req.body.txLock || !req.body.watchpartySlug ) {
                    res.status(500).json({ error: 'Some mandatory fields are missing.' })
                } else {
                    await executeOnDb(async dbs => {
                        const organizer = await dbs.organizers.get(req.body.watchpartySlug)
                        const participantId = randomUUID()
                        const cidParticipantStr = await dbs.candidateParticipants.put({
                            _id: participantId,
                            address: req.body.address,
                            cohorts: req.body.cohorts,
                            txLock: req.body.txLock,
                            watchparty: req.body.watchpartySlug
                        })
                        if(!organizer) {
                            dbs.organizers.put(req.body.watchpartySlug, participantId)
                        }
                        res.status(200).json({ _id: participantId })
                    })
                }
            }
            catch(e) {
                logger.error(e)
                res.status(500).json({ error: 'Unexpected error : ' + e })
            } finally {
                resolve()
            }
        } else {
            res.status(501).end()
            resolve()
        }
    })
}