import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Function to generate a random color
const getRandomColor = () => {
  const randomColor = () => Math.floor(Math.random() * 256);
  return `rgba(${randomColor()}, ${randomColor()}, ${randomColor()}, 0.5)`;
};

const RentalChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch data and set it to the chart
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/purchase/cars-lent-by-week"); // Replace with your actual API URL
      const data = response.data;

      if (data) {
        // Extract all unique weeks
        const weeks = data.map(item => `Week ${item._id.week}`);

        // Extract all unique car names across all weeks
        const allCarNames = [...new Set(data.flatMap(item => item.cars.map(car => car.carName)))];

        // Prepare dataset for each car with dynamic color generation
        const datasets = allCarNames.map((carName, index) => ({
          label: carName,
          data: data.map(item => {
            const car = item.cars.find(car => car.carName === carName);
            return car ? car.carCount : 0;
          }),
          backgroundColor: getRandomColor(), // Generate random color for each car
          borderColor: getRandomColor(),
          borderWidth: 1,
        }));

        setChartData({
          labels: weeks,
          datasets: datasets,
        });
      }
    } catch (error) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initial data
    fetchData();

    // Set interval to fetch data every 5 seconds (or adjust based on your needs)
    const intervalId = setInterval(fetchData, 5000);

    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Car Rentals by Week</h2>
      {chartData && (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            scales: {
              x: { stacked: true },
              y: { stacked: true },
            },
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Car Rentals by Week" },
            },
          }}
        />
      )}
    </div>
  );
};

export default RentalChart;
