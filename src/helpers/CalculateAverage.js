const calculateAverage = (chartData) => {
    if (!chartData || chartData.length === 0) {
        return 0;
    }

    let sum = 0;
    for (let i = 0; i < chartData.length; i++) {
        sum += chartData[i][1];
    }

    return sum / chartData.length;
};

export default calculateAverage;
