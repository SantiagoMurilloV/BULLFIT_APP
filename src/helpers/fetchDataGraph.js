const fetchData = async (selectedCoinId) => {
    try {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${selectedCoinId}/market_chart?vs_currency=usd&days=30&interval=daily`
        );
        const data = await response.json();
        return data.prices;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export default fetchData;
