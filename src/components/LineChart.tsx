import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({data}:{ data: number[] }) => {
  const chartData = {
    labels: Array.from({ length: data.length }, (_, i) => i.toString()),
    datasets: [
      {
        data: data,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        pointRadius: 0, // Remove the dots
        pointHoverRadius: 0, // Remove the dots on hover
      },
    ],
  };

  return <div className='w-[320px] h-[200px]'><Line data={chartData} options={{animation: {duration: 0}, scales: {
    y: {
      min: 0.05,
      max: 0.16
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
}}/></div>;
};

export default LineChart;
