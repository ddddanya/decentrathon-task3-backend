async function getTransaction(hash:string) {
    const req = await fetch(`https://gnfd-testnet-fullnode-tendermint-us.bnbchain.org/tx?hash=${hash}`)
    const res = await req.json()

    return res
}

export default getTransaction