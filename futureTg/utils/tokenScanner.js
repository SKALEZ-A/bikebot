// tokenScanner.js
const axios = require('axios');

// Helper Functions
function formatPrice(price) {
  const num = parseFloat(price);
  if (isNaN(num)) return '0.00';
  
  if (num < 0.000001) {
    return num.toExponential(4);
  }
  
  if (num < 0.01) {
    return num.toFixed(8);
  }
  
  return num.toFixed(2);
}

// Format number with commas and handle edge cases
function formatNumberWithCommas(number) {
  try {
    const num = parseFloat(number);
    if (isNaN(num)) return '0';
    
    if (num < 1000) {
      return num.toFixed(2);
    }
    
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  } catch (error) {
    console.error('Error formatting number:', error);
    return '0';
  }
}

// Format token amount with appropriate decimals
function formatTokenAmount(amount, decimals = 18) {
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (typeof num !== 'number' || isNaN(num)) {
      return '0';
    }

    if (num === 0) {
      return '0';
    }

    if (num < 0.000001) {
      return num.toExponential(4);
    }

    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
}
async function scanToken(address) {
    try {
        console.log(`Scanning token ${address} on all chains`);
        const url = `https://api.dexscreener.com/latest/dex/tokens/${address}`;
        console.log('DexScreener API URL:', url);

        const response = await axios.get(url);
        const pairs = response.data.pairs;

        if (!pairs || pairs.length === 0) {
            return { success: false, message: 'No liquidity pairs found' };
        }

        const ethPairs = pairs.filter(pair => pair.chainId === 'ethereum');
        const bscPairs = pairs.filter(pair => pair.chainId === 'bsc');
        const monadPairs = pairs.filter(pair => pair.chainId === 'monad');

        let selectedChain;
        let selectedPairs;

        // Compare liquidity across all chains
        const ethLiquidity = ethPairs.reduce((sum, pair) => sum + (parseFloat(pair.liquidity?.usd || 0)), 0);
        const bscLiquidity = bscPairs.reduce((sum, pair) => sum + (parseFloat(pair.liquidity?.usd || 0)), 0);
        const monadLiquidity = monadPairs.reduce((sum, pair) => sum + (parseFloat(pair.liquidity?.usd || 0)), 0);

        // Select chain with highest liquidity
        if (monadLiquidity > ethLiquidity && monadLiquidity > bscLiquidity) {
            selectedChain = 'monad';
            selectedPairs = monadPairs;
        } else if (ethLiquidity > bscLiquidity) {
            selectedChain = 'eth';
            selectedPairs = ethPairs;
        } else {
            selectedChain = 'bsc';
            selectedPairs = bscPairs;
        }

        return {
            success: true,
            chain: selectedChain,
            data: selectedPairs[0],
            pairs: selectedPairs
        };
    } catch (error) {
        console.error('Error scanning token:', error);
        return { success: false, message: error.message };
    }
}


// Position-specific scanner for fetching current token data for positions
async function fetchPositionTokenData(chain, tokenAddress) {
  try {
    const chainPath = chain.toLowerCase() === 'eth' ? 'ethereum' : 'bsc';
    console.log(`Fetching position data for ${tokenAddress} on ${chainPath}`);
    
    // Use the latest API endpoint for positions as well
    const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
    console.log('Position Scanner URL:', url);

    const response = await axios.get(url, { 
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.data || !response.data.pairs || !Array.isArray(response.data.pairs)) {
      console.log('Invalid response format from DexScreener');
      return null;
    }

    // Filter for the correct chain
    const chainPairs = response.data.pairs.filter(pair => 
      pair.chainId === (chain.toLowerCase() === 'eth' ? 'ethereum' : 'bsc')
    );

    if (chainPairs.length === 0) {
      console.log('No pairs found for position');
      return null;
    }

    // Sort by liquidity and get the most liquid pair
    const sortedPairs = chainPairs.sort((a, b) => {
      const liquidityA = parseFloat(a.liquidity?.usd || 0);
      const liquidityB = parseFloat(b.liquidity?.usd || 0);
      return liquidityB - liquidityA;
    });

    // Return position-specific data structure
    const mainPair = sortedPairs[0];
    return {
      priceUsd: parseFloat(mainPair.priceUsd || 0),
      priceNative: parseFloat(mainPair.priceNative || 0),
      marketCap: parseFloat(mainPair.marketCap || mainPair.fdv || 0),
      liquidity: {
        usd: parseFloat(mainPair.liquidity?.usd || 0),
        base: parseFloat(mainPair.liquidity?.base || 0),
        quote: parseFloat(mainPair.liquidity?.quote || 0)
      },
      volume: mainPair.volume || {},
      txns: mainPair.txns || {},
      dexId: mainPair.dexId,
      pairAddress: mainPair.pairAddress,
      baseToken: mainPair.baseToken,
      quoteToken: mainPair.quoteToken,
      priceChange: mainPair.priceChange || {},
      labels: mainPair.labels || [],
      info: mainPair.info || {},
      tax: mainPair.tax || { buy: 3, sell: 3 }
    };

  } catch (error) {
    console.error('Error fetching position token data:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    return null;
  }
}

// Helper function to extract token data
function extractTokenData(scanData) {
  try {
    const mainPair = scanData.pairs[0];
    return {
      symbol: mainPair.baseToken.symbol,
      name: mainPair.baseToken.name,
      address: mainPair.baseToken.address,
      marketCap: parseFloat(mainPair.marketCap || mainPair.fdv || 0),
      price: parseFloat(mainPair.priceUsd || 0),
      priceNative: parseFloat(mainPair.priceNative || 0),
      liquidity: {
        usd: parseFloat(mainPair.liquidity?.usd || 0),
        base: parseFloat(mainPair.liquidity?.base || 0),
        quote: parseFloat(mainPair.liquidity?.quote || 0)
      },
      volume24h: parseFloat(mainPair.volume?.h24 || 0),
      priceChange: mainPair.priceChange || {},
      txns24h: mainPair.txns?.h24 || {}
    };
  } catch (error) {
    console.error('Error extracting token data:', error);
    return null;
  }
}

// Calculate price impact
function calculatePriceImpact(data, chainName) {
    try {
        const testAmount = 5;
        const liquidity = Number(data.liquidity?.quote) || 0;
        if (liquidity === 0) return 'N/A';
        
        const impact = (testAmount / liquidity) * 100;
        return impact.toFixed(2);
    } catch (error) {
        return 'N/A';
    }
}

module.exports = {
  scanToken,
  fetchPositionTokenData,
  extractTokenData,
  formatNumberWithCommas,
  formatPrice,
  formatTokenAmount
};
