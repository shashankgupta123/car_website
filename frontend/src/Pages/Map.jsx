import React, { useEffect, useState } from "react";
import emailjs from '@emailjs/browser';
import '../CSS/Map.css'

const Map = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [userMarker, setUserMarker] = useState(null);
  const [map, setMap] = useState(null);
  const [infowindows, setInfowindows] = useState([]);
  const [info, setInfo] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    storeName: "",
    name: "",
    message: "",
  });
  const [submitError, setSubmitError] = useState("");  
  const [submitCount, setSubmitCount] = useState(0);  

  const carDealerships = [
    { Name: "Car Dealership 1", Latitude: 19.279, Longitude: 72.861 },
    { Name: "Car Dealership 2", Latitude: 19.272, Longitude: 72.869 },
    { Name: "Car Dealership 3", Latitude: 19.265, Longitude: 72.855 },
    { Name: "Car Dealership 4", Latitude: 19.280, Longitude: 72.875 },
    { Name: "Car Dealership 5", Latitude: 19.285, Longitude: 72.870 },
    { Name: "Car Dealership 6", Latitude: 19.290, Longitude: 72.880 },
    { Name: "Car Dealership 7", Latitude: 19.295, Longitude: 72.860 },
    { Name: "Car Dealership 8", Latitude: 19.270, Longitude: 72.845 },
    { Name: "Car Dealership 9", Latitude: 19.260, Longitude: 72.850 },
    { Name: "Car Dealership 10", Latitude: 19.275, Longitude: 72.890 },
    { Name: "Car Dealership 11", Latitude: 19.250, Longitude: 72.840 },
    { Name: "Car Dealership 12", Latitude: 19.245, Longitude: 72.835 },
    { Name: "Car Dealership 13", Latitude: 19.300, Longitude: 72.870 },
    { Name: "Car Dealership 14", Latitude: 19.310, Longitude: 72.880 },
    { Name: "Car Dealership 15", Latitude: 19.320, Longitude: 72.890 },
    { Name: "Car Dealership 16", Latitude: 18.9322, Longitude: 18.9322 },
  ];
  
  useEffect(() => {
    const email = localStorage.getItem("email");
    setFormData((prev) => ({ ...prev, email }));
    if (window.google && window.google.maps) {
      initMap();
    }
  }, []);

  const initMap = () => {
    const newMap = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 19.272, lng: 72.862 },
      zoom: 13,
    });

    setMap(newMap);

    const userIcon = {
      url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      scaledSize: new window.google.maps.Size(40, 40),
    };
    

    const storeIcon = {
      url: "https://static.vecteezy.com/system/resources/previews/049/063/463/non_2x/black-glyph-car-location-pin-icon-showing-vehicle-position-vector.jpg",
      scaledSize: new window.google.maps.Size(30, 30),
    };

    carDealerships.forEach((store) => {
      const marker = new window.google.maps.Marker({
        position: { lat: store.Latitude, lng: store.Longitude },
        map: newMap,
        title: store.Name,
        icon: storeIcon,
      });

      const infowindow = new window.google.maps.InfoWindow({
        content: `<div>${store.Name}</div>`,
      });

      marker.addListener("click", () => {
        infowindows.forEach((iw) => iw.close());
        infowindow.open(newMap, marker);
        setFormData((prev) => ({ ...prev, storeName: store.Name }));
        setShowForm(true);
        updateDistanceAndTime(marker);
      });

      infowindows.push(infowindow);
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const marker = new window.google.maps.Marker({
            position: location,
            map: newMap,
            draggable: true,
            title: "Your Location",
            icon: userIcon,
          });

          setUserMarker(marker);
          setUserLocation(location);
          newMap.setCenter(location);

          marker.addListener("dragend", () => {
            setUserLocation(marker.getPosition());
          });
        },
        () => handleLocationError(true, newMap.getCenter())
      );
    } else {
      handleLocationError(false, newMap.getCenter());
    }
  };

  const updateDistanceAndTime = (storeMarker) => {
    if (userMarker && storeMarker) {
      const userLatLng = userMarker.getPosition();
      const storeLatLng = storeMarker.getPosition();

      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
        userLatLng,
        storeLatLng
      );
      const timeInHours = distance / 5000;

      const hours = Math.floor(timeInHours);
      const minutes = Math.round((timeInHours - hours) * 60);

      const distanceInKm = (distance / 1000).toFixed(2);
      setInfo(
        `Distance: ${distanceInKm} km | Estimated Time: ${hours}h ${minutes}m`
      );

      console.log(`Distance: ${distanceInKm} km`);
      console.log(`Estimated Time: ${hours} hours and ${minutes} minutes`);
    }
  };

  const handleLocationError = (browserHasGeolocation, pos) => {
    const infoWindow = new window.google.maps.InfoWindow({
      map: map,
      position: pos,
      content: browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation.",
    });
    setInfowindows((prev) => [...prev, infoWindow]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    if (submitCount >= 5) {
      setSubmitError("You have reached the maximum number of submissions.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/save-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        setSubmitCount(submitCount + 1);
        alert("Form submitted successfully!");
        setShowForm(false);
        setSubmitError("");
  
        const emailResponse = await sendEmail(formData);
        if (emailResponse) {
          console.log('Email sent successfully');
        } else {
          console.log('Error sending email');
        }
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again later.");
    }
  };
  
  const sendEmail = async (formData) => {
    const emailTemplateParams = {
      to_name:'Admin',
      from_name: formData.name,
      from_email: formData.email,
      message: formData.message,
      store_name: formData.storeName,
    };
  
    try {
      const result = await emailjs.send(
        'service_yk53sjg',
        'template_44ki8eh',
        emailTemplateParams,
        '9Hpu8LqB30mogNUKL'
      );
      return result;
    } catch (error) {
      console.error("Error sending email:", error);
      return null;
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div id="map" style={{ height: "500px", width: "100%" }}></div>
      <div style={{ marginTop: "10px", fontWeight: "bold" }}>{info}</div>

      {showForm && (
        <form
          onSubmit={handleFormSubmit}
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            maxWidth: "400px",
          }}
        >
          <h3>Contact Us</h3>
          {submitError && <div style={{ color: "red" }}>{submitError}</div>}

          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              style={{ width: "100%", marginBottom: "10px" }}
            />
          </label>
          <label>
            Store Name:
            <input
              type="text"
              name="storeName"
              value={formData.storeName}
              readOnly
              style={{ width: "100%", marginBottom: "10px" }}
            />
          </label>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              style={{ width: "100%", marginBottom: "10px" }}
              required
            />
          </label>
          <label>
            Message:
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              style={{ width: "100%", marginBottom: "10px" }}
              required
            />
          </label>
          <button type="submit" style={{ width: "100%" }}>
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default Map;
