import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios'; // To make API calls
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

// Register the necessary components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const PieChart = () => {
  const [chartData, setChartData] = useState(null);  // State to hold the chart data
  const [isLoading, setIsLoading] = useState(true);  // State for loading status
  const [error, setError] = useState(null);  // State for error handling
  const [totalIncome, setTotalIncome] = useState(0);  // State to hold the total income

  // Helper function to generate a random color
  const getRandomColor = () => {
    const randomColor = () => Math.floor(Math.random() * 256); // Generate a random number between 0 and 255
    return `rgb(${randomColor()}, ${randomColor()}, ${randomColor()})`;  // Return a random rgb color
  };

  useEffect(() => {
    // Fetch data from the backend
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/purchase/total-income');  // Replace with your backend API endpoint
        const data = response.data;

        // Prepare chart data
        const labels = [];  // To store car names
        const values = [];  // To store total purchases sum
        const colors = [];  // To store colors for each car
        let total = 0;  // Variable to store total income

        // Assign random colors to each car and calculate the total price for each car
        data.forEach(item => {
          labels.push(item._id.carName);
          const totalPrice = item.totalPurchases.reduce((sum, purchase) => sum + purchase.price, 0);  // Sum of all prices for the car
          values.push(totalPrice);
          colors.push(getRandomColor());  // Get a random color for the pie chart segment
          total += totalPrice;  // Add to the total income
        });

        // Set the chart data
        setChartData({
          labels: labels,  // Car names as labels
          datasets: [{
            data: values,  // Total price for each car
            backgroundColor: colors,  // Car colors
            hoverOffset: 4,
          }],
        });

        // Set the total income
        setTotalIncome(total);
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();  // Call the fetch function

    // Set interval to fetch data every 5 seconds (or adjust based on your needs)
    const intervalId = setInterval(fetchData, 5000);

    // Clean-up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);  // Empty dependency array means this effect runs once when the component mounts

  // If data is still loading, show a loading indicator
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If there was an error, show an error message
  if (error) {
    return <div>{error}</div>;
  }

  // Pie chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',  // Position legend at the top
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            // Format the tooltip label
            const carName = tooltipItem.label;
            const totalIncome = tooltipItem.raw;
            return `${carName}: Rs.${totalIncome}`;
          },
        },
      },
    },
  };

  return (
    <div>
      <h2>Total Purchases by Car</h2>
      <Pie data={chartData} options={options} />

      {/* Display the total income below the pie chart */}
      <div style={{ marginTop: '20px', fontWeight: 'bold', fontSize: '18px' }}>
        Total Income: Rs.{totalIncome}
      </div>
    </div>
  );
};

export default PieChart;
