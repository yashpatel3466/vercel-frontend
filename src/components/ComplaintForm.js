import { useState } from "react";
import { complaintAPI } from "../utils/api";
import { openGoogleDrivePicker } from "../utils/googleDrivePicker";
import { getToken } from "../utils/api";
import "./ComplaintForm.css";

export default function ComplaintForm({ onSuccess, onCancel }) {
  // Check if user is authenticated
  const token = getToken();

  // All React hooks must be called at the top level
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",

    location: {
      address: "",
      latitude: "",
      longitude: ""
    }
  });
  const [photoMode, setPhotoMode] = useState(""); // "drive" | "file" | ""
  const [drivePhotoUrl, setDrivePhotoUrl] = useState("");
  const [filePhotoDataUrl, setFilePhotoDataUrl] = useState("");
  const [driveFileName, setDriveFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="complaint-form-container">
        <div className="auth-notice">
          <h3>Authentication Required</h3>
          <p>Please log in to submit a complaint.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const categories = [
    "Road Repair",
    "Water Supply",
    "Electricity",
    "Waste Management",
    "Street Lighting",
    "Drainage",
    "Parks & Recreation",
    "Public Safety",
    "Other"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }));
        },
        (error) => {
          setError("Unable to get location. Please enter manually.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const handlePhotoFileChange = async (e) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) {
      setFilePhotoDataUrl("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      e.target.value = "";
      return;
    }

    // Basic safety: limit very large base64 payloads
    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
      setError("Image is too large. Please upload an image under 5MB.");
      e.target.value = "";
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setFilePhotoDataUrl(dataUrl);
    } catch (err) {
      setError(err.message || "Failed to load image");
    }
  };

  // ... (keep convertGoogleDriveToBase64 if needed internally, though not used directly in JSX below) ...

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const images = [];
      if (photoMode === "drive" && drivePhotoUrl.trim()) {
        images.push(drivePhotoUrl.trim());
      }
      if (photoMode === "file" && filePhotoDataUrl) {
        images.push(filePhotoDataUrl);
      }

      // Require user to explicitly choose a photo source and attach a photo
      if (!photoMode || images.length === 0) {
        setError("Please attach a photo from Google Drive or from your device.");
        setLoading(false);
        return;
      }

      // Check if base64 image is too large
      const base64Images = images.filter(img => img.startsWith('data:'));
      for (const base64Img of base64Images) {
        const sizeInBytes = Math.round(base64Img.length * 0.75); // Approximate size
        const maxSize = 3 * 1024 * 1024; // 3MB limit for base64
        if (sizeInBytes > maxSize) {
          setError("Image is too large. Please use a smaller image (under 3MB).");
          setLoading(false);
          return;
        }
      }

      const complaintData = {
        ...formData,
        location: {
          ...formData.location,
          latitude: parseFloat(formData.location.latitude),
          longitude: parseFloat(formData.location.longitude)
        },
        images
      };

      await complaintAPI.create(complaintData);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complaint-form-container">
      <h2 className="form-title">Report a Complaint</h2>
      {error && <div className="error-alert">{error}</div>}

      <form onSubmit={handleSubmit} className="complaint-form">
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="Brief description of the issue"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="form-control form-textarea"
            placeholder="Detailed description of the problem"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="form-group">
          <label className="form-label">Location Address *</label>
          <input
            type="text"
            name="location.address"
            value={formData.location.address}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="Street address or landmark"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Latitude *</label>
            <div className="location-row">
              <input
                type="number"
                name="location.latitude"
                value={formData.location.latitude}
                onChange={handleChange}
                required
                step="any"
                className="form-control"
                placeholder="e.g., 28.6139"
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                className="btn-location"
                title="Use current location"
              >
                📍
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Longitude *</label>
            <input
              type="number"
              name="location.longitude"
              value={formData.location.longitude}
              onChange={handleChange}
              required
              step="any"
              className="form-control"
              placeholder="e.g., 77.2090"
            />
          </div>
        </div>

        <div className="form-group photo-section">
          <label className="form-label">Attach Photo (for location verification)</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="photoMode"
                value="drive"
                checked={photoMode === "drive"}
                onChange={() => setPhotoMode("drive")}
              />{" "}
              Google Drive
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="photoMode"
                value="file"
                checked={photoMode === "file"}
                onChange={() => setPhotoMode("file")}
              />{" "}
              Upload from device
            </label>
          </div>

          {photoMode === "drive" && (
            <div className="photo-input-container">
              <button
                type="button"
                onClick={() =>
                  openGoogleDrivePicker({
                    onPick: ({ url, name }) => {
                      setDrivePhotoUrl(url);
                      setDriveFileName(name);
                    },
                    onError: (err) => setError(err.message || "Failed to open Google Drive picker")
                  })
                }
                className="btn-location"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Pick from Google Drive
              </button>
              {driveFileName && (
                <div className="helper-text">
                  Selected: <strong>{driveFileName}</strong>
                </div>
              )}
              <div className="helper-text">
                The selected image will be verified for GPS location matching.
              </div>
            </div>
          )}

          {photoMode === "file" && (
            <div className="photo-input-container">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoFileChange}
                className="form-control"
              />
              {filePhotoDataUrl ? (
                <div className="photo-preview-container">
                  <img
                    src={filePhotoDataUrl}
                    alt="Uploaded preview"
                    className="photo-preview"
                  />
                </div>
              ) : null}
              <div className="helper-text">
                Select the complaint photo from your device. Photos without GPS metadata may not be verifiable.
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </div>
      </form>
    </div>
  );
}

