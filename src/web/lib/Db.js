import { create } from 'ipfs'
import OrbitDB from 'orbit-db'

// Why this pattern of creating a node - doing operation - immediately closing ?
// Creating a node makes the process acquire a lock in the form of files in the IPFS folder. This lock
// is not released before either node.stop() is called, or the process terminates.
// Problem: in dev, NextJs tends to recompile the project quite often. This does not terminate the process
// but the node variable is garbage collected, then there is no other way to go on than recreating a node,
// which fails because the file-based lock is still active on the node. This is an blocking issue when using 
// NextJs for development, and this is the only workaround I found (hopefully it won't affect perf too much,
// in which case I'll have to make some logic to close and recreate a node only when we are in dev)
export async function executeOnDb(operations, repoPath)  {
    const createNode = () => create({
      preload: { enabled: false },
      repo: repoPath,
      EXPERIMENTAL: { pubsub: true },
      config: {
        Bootstrap: [],
        Addresses: { Swarm: [] }
      }
    })

    const node = await createNode()
    const orbitDb = await OrbitDB.createInstance(node)
    const cohorts = await orbitDb.docstore('cohorts', { accessController: { write: [orbitDb.identity.id] }})
    const watchparties = await orbitDb.docstore('watchparties', { indexBy: 'slug', accessController: { write: [orbitDb.identity.id] }})
    const candidateParticipants = await orbitDb.docstore('candidateParticipants', { accessController: { write: [orbitDb.identity.id] }})
    const organizers = await orbitDb.keyvalue('organizers')
    await cohorts.load()
    await watchparties.load()
    await candidateParticipants.load()
    await organizers.load()
    const dbs = { cohorts, watchparties, node, candidateParticipants, organizers }
    try {
      await operations(dbs)
    }
    finally {
      orbitDb.stop()
      node.stop()
    }
}