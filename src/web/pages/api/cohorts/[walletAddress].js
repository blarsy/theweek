import { executeOnDb } from '../../../lib/Db.js'
import logger from '../../../lib/logger'

export default async function handler(req, res) {
    return new Promise(async resolve => {
        const { walletAddress } = req.query
        try {
            await executeOnDb(async dbs => {
                res.status(200).json(await dbs.cohorts.query(cohort => cohort.facilitatorAddress === walletAddress))    
            })
        } catch(e) {
            logger.error(e)
            res.status(500).json({ error: 'Unexpected error : ' + e })                 
        } finally {
            resolve()
        }
    })
}