class TradeExecutor {
    constructor(network) {
        this.network = network;
        this.provider = new ethers.JsonRpcProvider(network.rpc);
        
        // Add Monad-specific gas settings
        this.gasSettings = {
            'monad': {
                gasLimit: 300000,
                maxFeePerGas: ethers.parseUnits('1', 'gwei'),
                maxPriorityFeePerGas: ethers.parseUnits('1', 'gwei')
            },
            // ...existing chains...
        };
    }

    async estimateGas(transaction) {
        if (this.network.name === 'Monad Testnet') {
            // Monad-specific gas estimation
            return {
                gasLimit: this.gasSettings.monad.gasLimit,
                maxFeePerGas: this.gasSettings.monad.maxFeePerGas,
                maxPriorityFeePerGas: this.gasSettings.monad.maxPriorityFeePerGas
            };
        }
        // ...existing gas estimation logic...
    }
}