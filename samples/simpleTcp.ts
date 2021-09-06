// import mvc, { MapRow } from '../src/index'
import mvc, { MapRow } from 'memvis-clients'
import { Socket } from 'net'

async function main() {
    let client = new mvc.TCPMVClient("127.0.0.1", 2160, () => new Socket())
    await client._connect()
    await client.getPtrSize()
    const mapState = await client.getMaps()
    console.log('Received map state: ', mapState)
    let nfm: MapRow;
    for(let mp of mapState.maps) {
        if(mp.type == 'USED') {
            nfm = mp
            break
        }
    }
    const delta = ((x, y) => x > y ? x : y)(nfm.end - nfm.start, BigInt(200))
    const memRow = await client.memr(nfm.start, nfm.start + delta)
    console.log('Received data: ', memRow)
    process.exit(0)
}

main()