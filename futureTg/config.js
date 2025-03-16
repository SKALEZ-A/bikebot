require('dotenv').config();

// ABIs
const ROUTER_V2_ABI = [
    "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
    "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function WETH() external pure returns (address)"
];

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string)",
    "function name() external view returns (string)"
];

// Default RPC fallbacks if env vars are not set
const DEFAULT_ETH_RPC = "https://ethereum.publicnode.com";
const DEFAULT_BSC_RPC = "https://bsc-dataseed1.binance.org/";

// Network Configurations with proper fallbacks for RPC URLs
const NETWORKS = {
    ETH: {
        name: 'Ethereum',
        rpc: process.env.ALCHEMY_API_KEY 
            ? `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
            : (process.env.ETH_RPC_URL || DEFAULT_ETH_RPC),
        chainId: 1,
        nativeCurrency: 'ETH',
        addresses: {
            EDGE_ROUTER: "0xDfB50fB4BE4A0F7E9A7e5641944471bB0D2902D9",
            V2: {
                ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap V2 Router
                WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"  // WETH on Ethereum
            },
            V3: {
                ROUTER: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", // Uniswap V3 Router
                QUOTER: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e", // Uniswap V3 Quoter
                WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"  // WETH on Ethereum
            }
        }
    },
    BSC: {
        name: 'BSC',
        rpc: process.env.QUICKNODE_BSC_URL || DEFAULT_BSC_RPC,
        chainId: 56,
        nativeCurrency: 'BNB',
        addresses: {
            EDGE_ROUTER: "0xDfB50fB4BE4A0F7E9A7e5641944471bB0D2902D9",
            V2: {
                ROUTER: "0x10ED43C718714eb63d5aA57B78B54704E256024E", // PancakeSwap V2 Router
                WETH: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"  // WBNB on BSC
            },
            V3: {
                ROUTER: "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4", // PancakeSwap V3 Router
                QUOTER: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997", // PancakeSwap V3 Quoter
                WETH: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"  // WBNB on BSC
            }
        }
    },
    MONAD: {
        name: 'Monad Testnet',
        rpc: process.env.MONAD_RPC_URL || 'https://monad-testnet.g.alchemy.com/v2/JR7qnZW40eavpINEfVB4AHZIKvcnP1NS',
        chainId: 10143,
        nativeCurrency: 'MON',
        explorer: 'https://testnet.monadexplorer.com',
        addresses: {
            EDGE_ROUTER: "0x3ae6d8a282d67893e17aa70ebffb33ee5aa65893",
            V2: {
                FACTORY: "0x733e88f248b742db6c14c0b1713af5ad7fdd59d0",
                ROUTER: "0x3ae6d8a282d67893e17aa70ebffb33ee5aa65893", // Using Universal Router
                WETH: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701"
            },
            V3: {
                FACTORY: "0x961235a9020b05c44df1026d956d1f4d78014276",
                ROUTER: "0x3ae6d8a282d67893e17aa70ebffb33ee5aa65893", // Using Universal Router
                WETH: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701"
            }
        }
    }
};

// Direct exports for provider initialization
const ETH_RPC_URL = NETWORKS.ETH.rpc;
const BSC_RPC_URL = NETWORKS.BSC.rpc;

console.log('Ethereum RPC URL:', ETH_RPC_URL);
console.log('BSC RPC URL:', BSC_RPC_URL);

module.exports = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    EVA_API_KEY: process.env.EVA_API_KEY,
    EVA_API_BASE_URL: process.env.EVA_API_BASE_URL,
    BASE_URL: process.env.BASE_URL || 'https://refuel-backend-5h8h.onrender.com/api/future-edge',
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    QUICKNODE_BSC_URL: process.env.QUICKNODE_BSC_URL,
    ETH_RPC_URL,
    BSC_RPC_URL,
    NETWORKS,
    ROUTER_V2_ABI,
    ERC20_ABI
};