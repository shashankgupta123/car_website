import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const RentalChartStatus = () => {
    const [rentalData, setRentalData] = useState([]);  // State to store fetched data
    const [loading, setLoading] = useState(true);      // Loading state
    const [error, setError] = useState(null);          // Error state

    // Helper function to generate a random color
    const getRandomColor = () => {
        const randomColor = () => Math.floor(Math.random() * 256); // Generate a random number between 0 and 255
        return `rgb(${randomColor()}, ${randomColor()}, ${randomColor()})`;  // Return a random rgb color
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/purchase/car-status"); // Replace with actual API URL
                setRentalData(response.data);
            } catch (err) {
                setError("Failed to fetch rental data. Please try again.");
                console.error("Error fetching rental data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData(); // Fetch data initially

        // Set interval to fetch data every 5 seconds (or adjust based on your needs)
        const intervalId = setInterval(fetchData, 5000);

        // Clean-up the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // If data is loading, show a message
    if (loading) return <p>Loading rental data...</p>;

    // If there is an error, show the error message
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    // Extracting labels (Month - Week)
    const labels = rentalData.map(item => `Week ${item._id.week}, ${months[item._id.month - 1]}`);

    // Preparing Data for Chart
    const currentRentals = rentalData.map(item =>
        item.currentRentals.reduce((sum, rental) => sum + rental.carCount, 0)
    );

    const pastRentals = rentalData.map(item =>
        item.pastRentals.reduce((sum, rental) => sum + rental.carCount, 0)
    );

    // Random colors for each dataset
    const currentRentalsColor = getRandomColor();
    const pastRentalsColor = getRandomColor();

    const chartData = {
        labels,
        datasets: [
            {
                label: "Current Rentals",
                data: currentRentals,
                backgroundColor: currentRentalsColor,
                borderColor: currentRentalsColor,
                borderWidth: 1
            },
            {
                label: "Past Rentals",
                data: pastRentals,
                backgroundColor: pastRentalsColor,
                borderColor: pastRentalsColor,
                borderWidth: 1
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Car Rentals (Current vs Past) by Week & Month" }
        },
        scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true }
        }
    };

    return <Bar data={chartData} options={options} />;
};

export default RentalChartStatus;
