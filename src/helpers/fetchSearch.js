export const fetchSearch = async (InputValue) => {
    try {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/search?query=${InputValue}`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

