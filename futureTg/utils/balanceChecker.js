async function getChainBalance(address, chain) {
    const providers = {
        eth: new ethers.JsonRpcProvider(process.env.ETH_RPC_URL),
        bsc: new ethers.JsonRpcProvider(process.env.BSC_RPC_URL),
        monad: new ethers.JsonRpcProvider(process.env.MONAD_RPC_URL)
    };

    const symbols = {
        eth: 'ETH',
        bsc: 'BNB',
        monad: 'MON'
    };

    try {
        const balance = await providers[chain].getBalance(address);
        return {
            chain: chain,
            symbol: symbols[chain],
            balance: ethers.formatEther(balance)
        };
    } catch (error) {
        console.error(`Error fetching ${chain} balance:`, error);
        return {
            chain: chain,
            symbol: symbols[chain],
            balance: '0.0000'
        };
    }
}

async function getAllBalances(address) {
    const chains = ['eth', 'bsc', 'monad'];
    const balances = await Promise.all(
        chains.map(chain => getChainBalance(address, chain))
    );
    return balances;
}