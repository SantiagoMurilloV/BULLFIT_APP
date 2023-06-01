import React from 'react';
import { Bar } from 'react-chartjs-2';

function ChartSchema({ data }) {
    return (
        <Bar
            className='chart'
            data={data}
        />
    );
}

export default ChartSchema;
