import React, { useState } from "react";
import "./Firmware.css";
import { supabase } from "../../supabaseClient";
import { PopupNotification } from "../../components/notifications/PopUpNotification";
import { LoadingPopup } from "../../components/loaders/LoadingPopUp";
import { PuffLoader } from "react-spinners";

const Firmware = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    title: "",
    message: "",
    variant: "success",
    icon: "info",
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith(".bin")) {
      setFile(selectedFile);
    } else {
      setFile(null);
      setNotification({
        show: true,
        title: "Invalid File",
        message: "Please select a valid .bin file",
        variant: "error",
        icon: "error",
      });
    }
  };

  const triggerFileInput = () => {
    document.getElementById("fileInput").click();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      if (droppedFile.name.endsWith(".bin")) {
        setFile(droppedFile);
      } else {
        setNotification({
          show: true,
          title: "Invalid File",
          message: "Please select a valid .bin file",
          variant: "error",
          icon: "error",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setNotification({
        show: true,
        title: "No File Selected",
        message: "Please select a .bin file to upload",
        variant: "error",
        icon: "error",
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmUpload = async () => {
    setShowConfirmModal(false);
    setUploading(true);

    try {
      const fileName = `${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("firmware")
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("firmware")
        .getPublicUrl(fileName);

      // Get all hub IDs
      const { data: hubs, error: fetchError } = await supabase
        .from("hubs")
        .select("id");

      if (fetchError) {
        throw fetchError;
      }

      // Update all hubs with the new firmware URL
      if (hubs && hubs.length > 0) {
        const { error: updateError } = await supabase
          .from("hubs")
          .update({ update_command_url: urlData.publicUrl })
          .in(
            "id",
            hubs.map((h) => h.id)
          );

        if (updateError) {
          throw updateError;
        }
      }

      setNotification({
        show: true,
        title: "Success",
        message: "Firmware uploaded successfully",
        variant: "success",
        icon: "check_circle",
      });
      setFile(null);
      document.getElementById("fileInput").value = "";
    } catch (error) {
      console.error("Error uploading firmware:", error);
      setNotification({
        show: true,
        title: "Upload Failed",
        message: error.message || "Error uploading firmware",
        variant: "error",
        icon: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <LoadingPopup
        show={uploading}
        message="Uploading firmware..."
        Loader={PuffLoader}
        color="#007bff"
      />
      <PopupNotification
        show={notification.show}
        title={notification.title}
        message={notification.message}
        variant={notification.variant}
        icon={notification.icon}
        onClose={() =>
          setNotification({ ...notification, show: false })
        }
      />

      {showConfirmModal && (
        <div className="firmware-modal-overlay">
          <div className="firmware-modal">
            <div className="firmware-modal-icon">
              <span className="material-icons">upload</span>
            </div>
            <div className="firmware-modal-content">
              <span className="firmware-modal-title">Confirm Upload</span>
              <span className="firmware-modal-message">
                Are you sure you want to upload <strong>{file?.name}</strong>?
              </span>
            </div>
            <div className="firmware-modal-actions">
              <button
                className="firmware-modal-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="firmware-modal-confirm"
                onClick={confirmUpload}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="firmware-container">
        <div className="firmware-card">
          <div className="firmware-header">
            <span className="material-icons">system_update</span>
            <h2>Upload Firmware</h2>
          </div>

          <div className="firmware-content">
            <div className="firmware-section">
              <label className="file-label">Select .bin File</label>
              <div
              className={`file-input-wrapper ${dragActive ? "drag-active" : ""}`}
              onClick={triggerFileInput}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
                <input
                  id="fileInput"
                  type="file"
                  accept=".bin"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <div className="file-input-placeholder">
                  <span className="material-icons">cloud_upload</span>
                  <p>
                    {file ? (
                      <>
                        Selected: <strong>{file.name}</strong>
                      </>
                    ) : (
                      "Click to select or drag and drop your .bin file"
                    )}
                  </p>
                </div>
              </div>
            </div>

            {file && (
              <div className="file-info">
                <div className="file-detail">
                  <span className="label">File Name:</span>
                  <span className="value">{file.name}</span>
                </div>
                <div className="file-detail">
                  <span className="label">File Size:</span>
                  <span className="value">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="firmware-actions">
            <button
              className="firmware-btn firmware-btn-primary"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              <span className="material-icons">upload</span>
              {uploading ? "Uploading..." : "Upload Firmware"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Firmware;