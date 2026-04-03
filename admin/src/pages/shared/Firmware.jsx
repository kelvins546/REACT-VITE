import React, { useState, useEffect } from "react";
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
  const [firmwareReleases, setFirmwareReleases] = useState([]);
  const [loadingReleases, setLoadingReleases] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [newVersion, setNewVersion] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    title: "",
    message: "",
    variant: "success",
    icon: "info",
  });

  useEffect(() => {
    fetchFirmwareReleases();
  }, []);

  const fetchFirmwareReleases = async () => {
    try {
      setLoadingReleases(true);
      const { data, error } = await supabase
        .from("firmware_releases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFirmwareReleases(data || []);
    } catch (error) {
      console.error("Error fetching firmware releases:", error);
      setNotification({
        show: true,
        title: "Error",
        message: "Failed to load firmware releases",
        variant: "error",
        icon: "error",
      });
    } finally {
      setLoadingReleases(false);
    }
  };

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
    if (!newVersion.trim()) {
      setNotification({
        show: true,
        title: "Version Required",
        message: "Please enter a firmware version",
        variant: "error",
        icon: "error",
      });
      return;
    }

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

      // Insert new firmware release
      const { data: releaseData, error: releaseError } = await supabase
        .from("firmware_releases")
        .insert({
          version: newVersion.trim(),
          download_url: urlData.publicUrl,
          notes: newNotes.trim() || null,
          is_active: true,
        })
        .select()
        .single();

      if (releaseError) {
        throw releaseError;
      }

      // Deactivate previous active releases
      await supabase
        .from("firmware_releases")
        .update({ is_active: false })
        .neq("id", releaseData.id);

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
        message: `Firmware ${newVersion} uploaded successfully`,
        variant: "success",
        icon: "check_circle",
      });

      // Reset form
      setFile(null);
      setNewVersion("");
      setNewNotes("");
      document.getElementById("fileInput").value = "";

      // Refresh releases list
      setCurrentPage(1);
      fetchFirmwareReleases();
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
              <span className="firmware-modal-title">Upload Firmware</span>
              <span className="firmware-modal-message">
                Upload <strong>{file?.name}</strong> as a new firmware release
              </span>

              <div className="firmware-modal-inputs">
                <div className="input-group">
                  <label htmlFor="version">Version *</label>
                  <input
                    id="version"
                    type="text"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    placeholder="e.g., v1.2.3"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="notes">Release Notes</label>
                  <textarea
                    id="notes"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Optional release notes..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="firmware-modal-actions">
              <button
                className="firmware-modal-cancel"
                onClick={() => {
                  setShowConfirmModal(false);
                  setNewVersion("");
                  setNewNotes("");
                }}
              >
                Cancel
              </button>
              <button
                className="firmware-modal-confirm"
                onClick={confirmUpload}
                disabled={!newVersion.trim()}
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

        <div className="firmware-releases-section">
          <div className="table-container">
            <div
              style={{
                padding: "20px 25px",
                borderBottom: "1px solid var(--border)",
                fontWeight: 700,
                fontSize: "16px",
                color: "#fff",
              }}
            >
              Firmware Release History
            </div>
            <div className="table-container-scrollable">
              <table>
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th style={{ textAlign: "right" }}>Release Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingReleases ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                        Loading releases...
                      </td>
                    </tr>
                  ) : firmwareReleases.length > 0 ? (
                    firmwareReleases
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((release) => (
                      <tr key={release.id}>
                        <td style={{ fontWeight: 600, color: "#fff" }}>
                          {release.version}
                        </td>
                        <td>
                          <span
                            className={`stat-badge ${
                              release.is_active ? "st-solved" : "stat-archived"
                            }`}
                          >
                            {release.is_active ? "Active" : "Archived"}
                          </span>
                        </td>
                        <td style={{ maxWidth: "300px", wordBreak: "break-word" }}>
                          {release.notes || "—"}
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            color: "#888",
                            fontSize: "12px",
                          }}
                        >
                          {new Date(release.created_at).toLocaleDateString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          color: "#666",
                          fontSize: "13px",
                        }}
                      >
                        No firmware releases found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="a-pagination">
              <div style={{ fontSize: "14px", color: "#666" }}>
                Showing {(currentPage - 1) * itemsPerPage + 1}
                {"–"}
                {Math.min(currentPage * itemsPerPage, firmwareReleases.length)} of {firmwareReleases.length}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="u-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  {"<"}
                </button>

                {Array.from({ length: Math.max(1, Math.ceil(firmwareReleases.length / itemsPerPage)) }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      className={`u-page-btn ${page === currentPage ? "active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  className="u-page-btn"
                  disabled={currentPage >= Math.ceil(firmwareReleases.length / itemsPerPage)}
                  onClick={() => setCurrentPage((p) => Math.min(Math.ceil(firmwareReleases.length / itemsPerPage), p + 1))}
                >
                  {">"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Firmware;
