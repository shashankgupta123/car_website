import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserPurchase = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get the email from local storage
    const email = localStorage.getItem('email');

    useEffect(() => {
        const fetchPurchaseDetails = async () => {
            console.log(`Fetching all purchase details for email: ${email}`);
            if (!email) {
                setError('Email is missing');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`http://localhost:5000/api/allpurchases/${email}`);
                console.log('All purchase details fetched successfully:', response.data);
                if (response.data) {
                    setPurchases(response.data);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching purchase details:', error);
                setError(error.response?.data?.message || 'An error occurred');
                setLoading(false);
            }
        };

        if (email) {
            fetchPurchaseDetails();
        }
    }, [email]);

    const handlePayment = async (sessionId, purchaseId) => {
        console.log(`Initiating payment for session ID: ${sessionId}`);
        if (!sessionId) {
            console.error("Session ID is undefined!");
            return;
        }

        try {
            // Make API request to your backend to create a Stripe Checkout session
            const response = await axios.post(`http://localhost:5000/api/payBalance/${sessionId}`);

            // Stripe Checkout URL returned from the backend
            const { checkoutUrl } = response.data;

            // Redirect the user to Stripe's hosted payment page
            if (checkoutUrl) {
                window.location.href = checkoutUrl;

                // After successful payment, update the purchase status and balance
                const updateResponse = await axios.put(`http://localhost:5000/api/updatePurchase/${purchaseId}`, {
                    balance: 0,
                    status: 'past',
                });

                console.log('Purchase updated:', updateResponse.data);

                // Optionally, display a receipt
                alert('Payment successful. Receipt generated!');
            } else {
                alert('Payment session could not be created');
            }
        } catch (error) {
            console.error('Error initiating payment:', error);
            alert('Error initiating payment: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="purchase-page">
            <h1>All Purchase Details</h1>

            {purchases.length > 0 ? (
                purchases.map((purchase) => (
                    <div className="purchase-details" key={purchase.purchaseId}>
                        <h2>Purchase {purchase.purchaseId}</h2>
                        <p><strong>Car Name:</strong> {purchase.carName}</p>
                        <p><strong>Pickup Date:</strong> {new Date(purchase.pickupDate).toLocaleDateString()}</p>
                        <p><strong>Dropoff Date:</strong> {new Date(purchase.dropoffDate).toLocaleDateString()}</p>
                        <p><strong>Pickup Location:</strong> {purchase.pickupLocation}</p>
                        <p><strong>Dropoff Location:</strong> {purchase.dropoffLocation}</p>
                        <p><strong>Security Deposit:</strong> ₹{purchase.securityDeposit}</p>
                        <p><strong>Balance:</strong> ₹{purchase.balance}</p>
                        <p><strong>Status:</strong> {purchase.status}</p>

                        {purchase.balance > 0 && purchase.status === 'current' ? (
                            <div>
                                <h3>Pay the remaining balance:</h3>
                                <button onClick={() => handlePayment(purchase.stripeSessionId, purchase.purchaseId)}>
                                    Pay Balance and Generate Receipt
                                </button>
                            </div>
                        ) : (
                            <p>Payment already made or no balance remaining.</p>
                        )}
                    </div>
                ))
            ) : (
                <p>No purchases found.</p>
            )}
        </div>
    );
};

export default UserPurchase;
