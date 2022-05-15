import { executeOnDb } from '../pages/lib/Db.js'

process.chdir('../.')
executeOnDb(async dbs => {
    const results = await dbs.candidateParticipants.query(() => true)
    //const results = await dbs.organizers.all
    console.log(results)
}, './ipfs').then(result => {
    console.log('done')
})