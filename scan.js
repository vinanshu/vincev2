import React, { useState } from "react";
import { QrReader } from "react-qr-reader"; // Correct import
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { db } from "../config/firebase"; // Import Firestore
import { doc, getDoc, setDoc, collection } from "firebase/firestore"; // Firestore functions
import { Timestamp } from "firebase/firestore"; // Timestamp for storing the attendance time

function Scan() {
  const [scanResult, setScanResult] = useState(null);
  const [userData, setUserData] = useState(null); // State to store fetched user data
  const navigate = useNavigate(); // useNavigate hook for programmatic navigation

  const handleScan = async (data) => {
    if (data) {
      setScanResult(data.text); // Set the scanned result

      // Show attendance success message
      alert("Attendance Success!");

      // Fetch user details from Firestore based on scanned data (e.g., user ID or email)
      try {
        const userRef = doc(db, "Users", data.text); // Assuming the scanned QR contains a user ID or similar
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const user = userDoc.data();
          setUserData(user); // Store the fetched user data

          console.log("User Data: ", user); // Log the fetched user data

          // Now store attendance data in Firestore
          const attendanceRef = collection(db, "Attendance"); // Reference to Attendance collection
          await setDoc(doc(attendanceRef, data.text + "_" + Timestamp.now().seconds), {
            userId: data.text,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            IDnumber: user.IDnumber,
            course: user.course,
            year: user.year,
            section: user.section,
            timestamp: Timestamp.now(), // Record the exact time of attendance
          });

          console.log("Attendance stored successfully!");
        } else {
          alert("No user found with this ID in Firestore!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        alert("An error occurred while fetching user data.");
      }
    }
  };

  const handleError = (error) => {
    console.error("Scan error: ", error);
  };

  return (
    <div>
      <h3>Scan QR Code</h3>

      {/* QR code scanner always visible */}
      <div style={{ marginTop: "20px" }}>
        <QrReader
          onResult={(result, error) => {
            if (result) handleScan(result);
            if (error) handleError(error);
          }}
          style={{ width: "100%" }}
        />
      </div>

      {/* Display the scanned result */}
      {scanResult && <p>Scanned Result: {scanResult}</p>}

      {/* Display user data fetched from Firestore */}
      {userData && (
        <div>
          <h4>User Details</h4>
          <p><strong>First Name:</strong> {userData.firstName}</p>
          <p><strong>Last Name:</strong> {userData.lastName}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>ID Number:</strong> {userData.IDnumber}</p>
          <p><strong>Course:</strong> {userData.course}</p>
          <p><strong>Year:</strong> {userData.year}</p>
          <p><strong>Section:</strong> {userData.section}</p>
        </div>
      )}

      {/* Add a retry button */}
      <button
        className="btn btn-primary"
        onClick={() => setUserData(null)} // Reset the user data to allow retry
      >
        Try Again
      </button>
    </div>
  );
}

export default Scan;
