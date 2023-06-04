import React, { useState, useEffect } from 'react';
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

    // useEffect(() => {
        if (selectedCoinId) {
            fetchHistory();
        }
    // }, [selectedCoinId]);


    const calculateAverage = () => {
        if (!chartData || chartData.length === 0) {
            return 0;
        }

        let sum = 0;
        for (let i = 0; i < chartData.length; i++) {
            sum += chartData[i][1];
        }

        return sum / chartData.length;
    };



    const averageValue = calculateAverage();


    if (!chartData) {
        return <div>Loading...</div>;
    }

    const chartOptions = {
        scales: {
            x: {
                display: true,
                position: 'top',
                grid: {
                    drawOnChartArea: false,
                    drawBorder: true,
                    color: '#C9EC4Cff',
                    padding: {
                        top: 90,
                    },
                },
                ticks: {
                    borderWidth: 5,
                    borderColor: '#C9EC4Cff',
                },

                offset: true,
                offsetOffset: 10,
                categorySpacing: 0.5,

            },
            y: {
                display: false,
                beginAtZero: false,
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
                    labelFontSize: 700,
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
            labels: chartData.map((item) => new Date(item[0]).toLocaleDateString()),
            datasets: [
                {
                    type: 'line',
                    data: chartData.map(() => averageValue),
                    borderColor: '#C9EC4Cff',
                    borderWidth: 3,
                    borderDash: [3, 3],
                    fill: false,
                    pointRadius: 0,
                    order: 0,
                },
                {
                    label: '',
                    data: chartData.map((item) => item[1]),
                    backgroundColor: chartData.map((_, index) =>
                        index === selectedBarIndex ? '#C9EC4Cff' : ' #545869ff'
                    ),
                    borderColor: 'black',
                    borderWidth: 4,
                    order: 1,
                    barPercentage: 0.95,
                    categoryPercentage: 1.0,
                },
            ],
        },
    };

    return (
        <div className="graph-container">
            <div className="grap-text">Sales Activity</div>
            <div className='text'>
                <p>
                    Here you can visualize the different cryptocurrencies
                    
                    to observe their behavior of their value with respect to time.<br />
                    The data is taken from coingecko....
                </p>
            </div>
            <Bar className='grap' data={chartConfig.data} options={chartOptions} />
        </div>

    );
};

export default GraphTest;
