import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../styles/grap.css';
import fetchData from '../helpers/fetchDataGraph';
import calculateAverage from '../helpers/CalculateAverage.js';

const Graph = ({ selectedCoinId }) => {
    const [chartData, setChartData] = useState(null);
    const [selectedBarIndex, setSelectedBarIndex] = useState(null);

    const fetchHistory = async () => {
        const data = await fetchData(selectedCoinId);
        setChartData(data);
    };

    useEffect(() => {
        if (selectedCoinId) {
            fetchHistory();
        }
    }, [selectedCoinId]);

    const averageValue = calculateAverage(chartData);

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
                    label: selectedCoinId,
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
            <div className="text">
                <p>
                    Here you can visualize the different cryptocurrencies to observe their behavior of their value with
                    respect to time.
                    <br />
                    The data is taken from coingecko....
                </p>
            </div>
            <Bar className="grap" data={chartConfig.data} options={chartOptions} />
            <h3 className="uni">Average in USD</h3>
            <div className="current_price">
                <h1>${averageValue.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ",").replace('.', ',')} </h1>
            </div>
            <div className='nameCoin'>
                <p>{selectedCoinId}</p>
            </div>
        </div>
    );
};

export default Graph;
