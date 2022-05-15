import { executeOnDb } from '../../lib/Db.js'
import { CID } from 'ipfs'
import logger from '../../lib/logger'


function between(min, max) {  
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
function createSlug() {
    let result = ''
    for(let i = 0; i < 16; i++){
        result += chars[between(0, 35)]
    }
    return result
}

export default async function handler(req, res) {
    return new Promise(async resolve => {
        if(req.method === 'PUT') {
            try {
                if(!req.body.name) {
                    res.status(500).json({ error: 'Some mandatory fields are missing.' })
                } else {
                    const slug = createSlug()
                    await executeOnDb(async dbs => {
                        const cidStr = await dbs.watchparties.put({
                            name: req.body.name,
                            slug
                        })
                        const cid = CID.parse(cidStr)
                        res.status(200).json({ cid, slug })
                    }, process.env.IPFS_REPO)
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