import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getCarByName } from '../service/carServices';
import RentalForm from '../component/Form/RentalForm';
import '../CSS/CarDetails.css';

const CarDetails = () => {
    const { name } = useParams();
    const [car, setCar] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const carTitleRef = useRef(null);
    const [showRentalForm, setShowRentalForm] = useState(false);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        const storedEmail = localStorage.getItem('email');
        const storedUsername = localStorage.getItem('username');
        const storedPhone = localStorage.getItem('phone');
        if (storedUserId) setUserId(storedUserId);
        if (storedEmail) setEmail(storedEmail);
        if (storedUsername) setUsername(storedUsername);
        if (storedPhone) setPhone(storedPhone);
    }, []);

    useEffect(() => {
        const fetchCarDetails = async () => {
            if (!name) {
                setError('Car name is undefined.');
                return;
            }
            try {
                const response = await getCarByName(name);
                if (response) {
                    setCar(response);
                    setSelectedColor(response.colors[0]);  // Set the first color as selected by default
                } else {
                    setError('Car details not found.');
                }
            } catch (err) {
                setError(`Error fetching car details: ${err.message}`);
            }
        };
        fetchCarDetails();
    }, [name]);

    const handleColorChange = (color) => {
        const selected = car.colors.find(c => c.color === color);
        setSelectedColor(selected);
    };

    const addToFavorites = async () => {
        if (!userId) {
            setError('You need to be logged in to add a car to your favorites.');
            return;
        }
        const selectedColorDetails = car.colors.find(color => color.color === selectedColor?.color);
        const carDetails = {
            userId,
            carDetails: {
                name: car.name,
                model_no: car.model_no,
                variant: car.variant,
                mileage: car.mileage,
                description: car.description,
                offers: car.offers,
                colors: [{
                    color: selectedColorDetails?.color,
                    price: selectedColorDetails?.price,
                    images: selectedColorDetails?.images,
                }],
            },
        };

        try {
            const response = await fetch('http://localhost:5000/api/users/add-favourite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(carDetails),
            });

            const result = await response.json();
            if (response.status === 200) {
                alert('Car added to your favorites!');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError(`Error adding to favorites: ${err.message}`);
        }
    };

    const buyNow = async () => {
        if (!userId) {
            setError('You need to be logged in to proceed with the purchase.');
            return;
        }

        const selectedColorDetails = car.colors.find(color => color.color === selectedColor?.color);
        const userDetails = {
            userId,
            username,
            email,
            phone,
            carName: car.name,
            modelNo: car.model_no,
            variant: car.variant,
            mileage: car.mileage,
            description: car.description,
            selectedColor: {
                color: selectedColorDetails?.color,
                price: selectedColorDetails?.price,
                images: selectedColorDetails?.images,
            },
            offers: car.offers,
        };

        try {
            const response = await fetch('http://localhost:5000/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: selectedColorDetails.price,
                    userDetails,
                }),
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url; // Redirect to payment gateway
            } else {
                setError('Error redirecting to payment gateway.');
            }
        } catch (err) {
            setError(`Error during payment process: ${err.message}`);
        }
    };

    const handleRentNow = () => {
        // Log car details before passing to rental form
        console.log('Car Details:', car);  // Highlighted: Log car details before rental form
        setShowRentalForm(true); // Set state to show rental form
    };


    if (error) {
        return <p className="error-message">{error}</p>;
    }
    if (!car) {
        return <p>Loading car details...</p>;
    }
    

    return (
        <div className="car-details-container">
            <div className="car-image-container">
                <img
                    src={selectedColor?.images?.[0]}
                    alt={car.name}
                    className="car-detail-image"
                />
            </div>
            <div className="car-details">
                <h1 ref={carTitleRef}>{car.name}</h1>
                <p><strong>Model:</strong> {car.model_no}</p>
                <p><strong>Variant:</strong> {car.variant}</p>
                <p><strong>Mileage:</strong> {car.mileage} km/l</p>
                <p><strong>Description:</strong> {car.description}</p>
                <p><strong>Colors:</strong></p>
                <div className="color-selection-container">
                    {car.colors.map((color, index) => (
                        <button
                            key={index}
                            className="color-circle"
                            style={{
                                backgroundColor: color.color,
                                border: selectedColor?.color === color.color ? '2px solid black' : 'none',
                            }}
                            onClick={() => handleColorChange(color.color)}
                        />
                    ))}
                </div>
                <p><strong>Price:</strong> ₹{selectedColor?.price?.toLocaleString() || 'N/A'}</p>
                <p><strong>Offers:</strong> {car.offers || 'No offers available'}</p>
                <button onClick={addToFavorites} className="add-favorite-button">
                    Add to Favorites
                </button>
                {/* <button onClick={buyNow} className="buy-now-button">
                    Buy Now
                </button> */}
                <button onClick={handleRentNow} className="rent-now-button">
                    Rent Now
                </button>
            </div>
            {showRentalForm && (
                <RentalForm 
                    car={car} 
                    selectedColor={selectedColor}  // Pass selected color and price to the rental form
                    onClose={() => setShowRentalForm(false)} 
                    onSubmit={(data) => console.log('Rental form data:', data)} 
                />
            )}
        </div>
    );
};

export default CarDetails;
