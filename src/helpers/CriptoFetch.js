
export const fetchCryptoList = async () => {
    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=30d&locale=en&precision=3'
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
