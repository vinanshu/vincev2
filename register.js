import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import QRCode from "qrcode"; // Import QRCode for generating base64 string

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [IDnumber, setIDnumber] = useState("");
  const [course, setCourse] = useState(""); // New state for course
  const [year, setYear] = useState(""); // New state for year
  const [section, setSection] = useState(""); // New state for section
  const [qrCodeData, setQrCodeData] = useState(""); // State to store QR code data
  const [qrCodeImage, setQrCodeImage] = useState(""); // State to store base64 QR code image URL
  const navigate = useNavigate(); // Initialize useNavigate

  const checkIfUserExists = async (IDnumber, email) => {
    // Check if the user with the same IDnumber exists in Firestore
    const userDocRefByEmail = doc(db, "Users", email);
    const userDocByEmail = await getDoc(userDocRefByEmail);

    if (userDocByEmail.exists()) {
      toast.error("Email is already registered!", { position: "bottom-center" });
      return true;
    }

    // Check if the user with the same IDnumber exists in Firestore
    const userDocRefByID = doc(db, "Users", IDnumber);
    const userDocByID = await getDoc(userDocRefByID);

    if (userDocByID.exists()) {
      toast.error("ID Number is already registered!", { position: "bottom-center" });
      return true;
    }

    return false; // No duplicates found
  };

  const handleRegister = async (e) => {
    e.preventDefault();
  
    // Check if the user already exists
    const userExists = await checkIfUserExists(IDnumber, email);
    if (userExists) return; // Prevent registration if user exists
  
    try {
      // Create a new user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      if (user) {
        // Generate QR code data (this can be user.email or any other data)
        const qrData = `ID: ${IDnumber}\nEmail: ${user.email}\nFirst Name: ${fname}\nLast Name: ${lname}\nCourse: ${course}\nYear: ${year}\nSection: ${section}`;
        setQrCodeData(qrData); // Store QR data

        // Generate QR code as base64 string using the QRCode package
        QRCode.toDataURL(qrData, async (err, url) => {
          if (err) {
            console.error("Error generating QR code:", err);
            toast.error("Failed to generate QR code", {
              position: "bottom-center",
            });
          } else {
            setQrCodeImage(url); // Store base64 image URL of the QR code
            
            // Save user details and the generated QR code to Firestore after the QR code is generated
            await setDoc(doc(db, "Users", user.uid), {
              email: user.email,
              firstName: fname,
              lastName: lname,
              IDnumber: IDnumber,
              password: password,
              course: course,
              year: year,
              section: section,
              qrCode: url, // Save the base64 QR code image in Firestore
            });
  
            console.log("User Registered Successfully!");
            toast.success("User Registered Successfully!", {
              position: "top-center",
            });
  
            // Redirect to login page after 5 seconds
            setTimeout(() => {
              navigate("/login"); // Redirect to login page
            }, 5000);
          }
        });
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h3>Sign Up</h3>

      <div className="mb-3">
        <label>First name</label>
        <input
          type="text"
          className="form-control"
          placeholder="First name"
          onChange={(e) => setFname(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label>Last name</label>
        <input
          type="text"
          className="form-control"
          placeholder="Last name"
          onChange={(e) => setLname(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label>Email address</label>
        <input
          type="email"
          className="form-control"
          placeholder="Enter email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label>ID Number</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter ID number"
          onChange={(e) => setIDnumber(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {/* New Input for Course */}
      <div className="mb-3">
        <label>Course</label>
        <select
          className="form-control"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          required
        >
          <option value="">Select Course</option>
          <option value="IT">IT</option>
          <option value="TCM">TCM</option>
          <option value="EMIT">EMIT</option>
        </select>
      </div>

      {/* New Input for Year */}
      <div className="mb-3">
        <label>Year</label>
        <select
          className="form-control"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        >
          <option value="">Select Year</option>
          <option value="1ST">1ST</option>
          <option value="2ND">2ND</option>
          <option value="3RD">3RD</option>
          <option value="4TH">4TH</option>
        </select>
      </div>

      {/* New Input for Section */}
      <div className="mb-3">
        <label>Section</label>
        <select
          className="form-control"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          required
        >
          <option value="">Select Section</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
          <option value="F">F</option>
          <option value="G">G</option>
        </select>
      </div>

      {/* Display the generated QR Code (Optional) */}
      {qrCodeImage && (
        <div>
          <h5>Your QR Code</h5>
          <img src={qrCodeImage} alt="QR Code" />
        </div>
      )}

      <div className="d-grid">
        <button type="submit" className="btn btn-primary">
          Sign Up
        </button>
      </div>

      <p className="forgot-password text-right">
        Already registered? <a href="/login">Login</a>
      </p>
    </form>
  );
}

export default Register;
