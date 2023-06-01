import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart } from 'chart.js';
import { fetchHistory } from '../helpers/HistoryFetch';
import '../styles/grap.css';

export function Graph() {
    const [historyData, setHistoryData] = useState(null);

    const fetchDataHistory = async () => {
        try {
            const data = await fetchHistory();
            setHistoryData(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
  

    if (!historyData) {
        fetchDataHistory();
    }

    const getChartData = () => {
        if (historyData) {
            const chartData = {
                labels: historyData.prices.map(([timestamp]) =>
                    new Date(timestamp).toLocaleDateString()
                ),
                datasets: [
                    {
                        data: historyData.prices.map(([, price]) => price),
                        borderColor: 'rgba(104, 107, 127, 1)',
                        backgroundColor: 'rgba(104, 107, 127, 0.2)',
                        fill: true,
                    },
                ],
            };

            return chartData;
        }

        return null;
    };

    return (
        <div className='graphContainer'>
            <h2>Cripto</h2>
            {historyData ? (
                <Bar data={getChartData()} />
            ) : (
                <p>No data</p>
            )}
        </div>
    );
}

