import React, { useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react"; // Import QRCodeCanvas instead of default
import { useLocation } from "react-router-dom"; // Hook to access passed state

function Profile() {
  const location = useLocation(); // Get the location object to access passed state
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state
  const [error, setError] = useState(null); // Error state

  // Extract scanned data from location state (if available)
  const scannedData = location.state?.scannedData;

  // Fetch user data from Firestore
  const fetchUserData = async (user) => {
    try {
      if (user) {
        const docRef = doc(db, "Users", user.uid); // Reference to the user's document
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        } else {
          console.log("No user data found");
          setError("No user data found");
        }
      } else {
        setError("No user is logged in");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Error fetching user data");
    } finally {
      setLoading(false); // Always stop loading
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user);
      } else {
        setError("No user is logged in");
        setLoading(false); // Stop loading if no user
      }
    });

    return () => unsubscribe(); // Clean up the listener when the component unmounts
  }, []); // Empty dependency array ensures this only runs once

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = "/login"; // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  if (loading) {
    return <div className="loading-message">Loading your profile...</div>; // Show loading message while fetching data
  }

  if (error) {
    return <div className="error-message">{error}</div>; // Show error message if something goes wrong
  }

  return (
    <div className="container">
      <div className="profile-card">
        {/* Display a welcome message */}
        <h4 className="profile-header">Welcome, {userDetails?.firstName || "User"}</h4>

        {/* Display attendance success message if scanned data is available */}
        {scannedData && (
          <div className="attendance-success">
            <h5>Attendance: Success</h5>
          </div>
        )}

        {/* Display user information */}
        <div className="profile-info">
          <p><strong>First Name:</strong> {userDetails?.firstName}</p>
          <p><strong>Last Name:</strong> {userDetails?.lastName}</p>
          <p><strong>ID Number:</strong> {userDetails?.IDnumber}</p>
          <p><strong>Email:</strong> {userDetails?.email}</p>
        </div>

        {/* Display the QR Code */}
        {userDetails?.qrCode && (
          <div className="qr-code-container">
            <h5>Your QR Code:</h5>
            <QRCodeCanvas value={userDetails.qrCode} size={200} />
          </div>
        )}

        {/* Logout button */}
        <button className="btn btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;
