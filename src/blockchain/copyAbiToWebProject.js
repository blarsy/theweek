const { open, writeFile } = require('fs/promises')

async function main() {
    const fd = await open('./build/contracts/Locker.json')
    const fileContent =  await fd.readFile()
    const contractMetadata = JSON.parse(fileContent)
    const abi = contractMetadata.abi
    
    await writeFile('../web/pages/locker-abi.json', JSON.stringify(abi))
}
main().then(() => console.log('Done.'))