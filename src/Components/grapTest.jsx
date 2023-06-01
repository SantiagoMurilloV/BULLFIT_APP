import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../styles/grap.css';

const GraphTest = ({ selectedCoinId }) => {
    const [chartData, setChartData] = useState(null);
    const [selectedBarIndex, setSelectedBarIndex] = useState(null);

    const fetchHistory = async () => {
        try {
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/${selectedCoinId}/market_chart?vs_currency=usd&days=30&interval=daily`
            );
            const data = await response.json();
            setChartData(data.prices);
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    };

    if (selectedCoinId && !chartData) {
        fetchHistory();
        return <div>Loading...</div>;
    }

    const chartOptions = {
        scales: {
            x: {
                display: false,
            },
            y: {
                display: false,
                beginAtZero: true,
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltips: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        if (selectedBarIndex !== null && selectedBarIndex === context.dataIndex) {
                            return label + ' - Selected';
                        }
                        return label;
                    },
                },
            },
        },
        onHover: (_, activeElements) => {
            const [activeElement] = activeElements;
            setSelectedBarIndex(activeElement ? activeElement.index : null);
        },
        onLeave: () => {
            setSelectedBarIndex(null);
        },
    };

    const chartConfig = {
        type: 'bar',
        data: {
            labels: chartData?.map((item) => new Date(item[0]).toLocaleDateString()),
            datasets: [
                {
                    label: '',
                    data: chartData?.map((item) => item[1]),
                    backgroundColor: chartData?.map((_, index) =>
                        index === selectedBarIndex ? '#00FF00' : '#9C9DA2ff'
                    ),
                    borderColor: 'black',
                    borderWidth: 1,
                },
            ],
        },
    };

    return (
        <div className="graph-container">
            <Bar
                data={chartConfig.data}
                options={chartOptions}
            />
        </div>
    );
};

export default GraphTest;
