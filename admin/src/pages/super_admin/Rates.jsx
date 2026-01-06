import React, { useState } from "react";
import "./Rates.css";
import "../../components/dropdowns/searchableDropdown.css"
import { PuffLoader } from "react-spinners";
import { PopupNotification } from "../../components/notifications/PopUpNotification";
import { LoadingPopup } from "../../components/loaders/LoadingPopUp";
import meralcoLogo from '../../assets/electricityProviders/MERALCO.png';
import vecoLogo from '../../assets/electricityProviders/DAVAO LIGHT.png';
import dlpcLogo from '../../assets/electricityProviders/VECO.png';

const Rates = () => {
  const [showModal, setShowModal] = useState(false);
  const [showMonthlyTrend, setshowMonthlyTrend] = useState(false);
  const [showYearlyTrend, setshowYearlyTrend] = useState(true);
  const [showTrendStatsMonthly, setshowTrendStatsMonthly] = useState(false);
  const [showTrendStatYearly, setshowTrendStatsYearly] = useState(true);
  const [electricityRate, setElectricityRate] = useState("");
  const [description, setDescription] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);

  const [notification, setNotification] = useState({
    show: false,
    title: "",
    message: "",
    variant: "success",
    icon: "info"
  });

  const [loader, setLoader] = useState({
    show: false,
    message: "Processing..."
  });

  const MAJOR_PROVIDERS = {
    Meralco: 12.5,
    VECO: 11.2,
    DLPC: 10.8
  };

  const DEFAULT_RATE = 9.75;

  const allProviders = [
    'Meralco', 'VECO', 'DLPC',
    'Abreco', 'AEC', 'AKELKO', 'ALECO', 'ANECO', 'ANTECO', 'ASELCO', 'AURELCO',
    'BALAMBAN', 'BANELCO', 'BASSELCO', 'BATANELCO', 'BETELEC I', 'BATELIC II',
    'BENECO', 'BILECO', 'BISELCO', 'BOHECO I', 'BOHECO II', 'BUSECO',
    'CAGELCO I', 'CAGELCO II', 'CAMELCO', 'CANORECO', 'CAPELCO',
    'CASURECO I', 'CASURECO II', 'CASURECO III', 'CASURECO IV',
    'CEBECCO I', 'CEBECCO II', 'CEBECCO III', 'CELCOR', 'CENPELCO',
    'CEPALCO', 'CLPC', 'COTELCO', 'DASURECO', 'DECORP', 'DIELCO',
    'DORELCO', 'ESAMELCO', 'FLECO', 'GUIMELCO', 'IFELCO',
    'ILECO I', 'ILECO II', 'ILECO III', 'ILPI', 'INEC',
    'ISECO', 'ISELCO I', 'ISELCO II', 'KAELCO', 'LANECO',
    'LEYECO II', 'LEYECO III', 'LEYECO IV', 'LEYEVO V',
    'LUELCO', 'MAGELCO', 'MARELCO', 'MECO', 'MOPRECO'
  ].sort((a, b) => a.localeCompare(b));

  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('Meralco');

  const searchLower = searchTerm.toLowerCase();

  const majorProviders = Object.keys(MAJOR_PROVIDERS)
    .filter(p => p.toLowerCase().includes(searchLower));

  const otherProviders = allProviders
    .filter(p => !Object.prototype.hasOwnProperty.call(MAJOR_PROVIDERS, p))
    .filter(p => p.toLowerCase().includes(searchLower));

  const providerLogos = {
    'Meralco': meralcoLogo,
    'DLPC': dlpcLogo,
    'VECO': vecoLogo,
  };

  const filteredOptions = allProviders.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    setLoader({
      show: true,
      message: "Exporting Report..."
    });

    setTimeout(() => {
      setLoader({
        show: false,
        message: "Processing..."
      });

      setNotification({
        show: true,
        title: "Processing",
        message: "Your report is being exported.",
        variant: "processing",
        icon: "progress_activity"
      });

      setShowExportModal(false);
    }, 2000);
  }

  const handleSelect = (option) => {
    setSelected(option);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleUpdate = async () => {
    if (!electricityRate || electricityRate.trim() === "") {
      setNotification({
        show: true,
        title: "Validation Error",
        message: "Please enter an electricity rate.",
        variant: "error",
        icon: "error"
      });
      return;
    }

    if (!description || description.trim() === "") {
      setNotification({
        show: true,
        title: "Missing Inputs",
        message: "Please enter a description.",
        variant: "warning",
        icon: "warning"
      });
      return;
    }

    if (isNaN(electricityRate) || Number(electricityRate) <= 0) {
      setNotification({
        show: true,
        title: "Missing Inputs",
        message: "Please enter a valid positive number for the electricity rate.",
        variant: "warning",
        icon: "warning"
      });
      return;
    }

    setLoader({
      show: true,
      message: "Updating Rate..."
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      setLoader({ show: false, message: "" });

      setNotification({
        show: true,
        title: "Electricity Rate Updated",
        message: "The electricity rate has been updated successfully.",
        variant: "success",
        icon: "check_circle"
      });

      setShowModal(false);
    } catch (error) {
      setLoader({ show: false, message: "" });
      setNotification({
        show: true,
        title: "Update Failed",
        message: error.message,
        variant: "error",
        icon: "error"
      });
    }
  };

  return (
    <>
      <PopupNotification
        show={notification.show}
        title={notification.title}
        message={notification.message}
        variant={notification.variant}
        icon={notification.icon}
        duration={3000}
        onClose={() =>
          setNotification((prev) => ({ ...prev, show: false }))
        }
      />
      <LoadingPopup
        show={loader.show}
        message={loader.message}
        Loader={PuffLoader}
        color="#0055ff"
      />
      <div className="page-header">
        <div>
          <div className="page-title">Utility Rates</div>
          <div style={{ color: "#888", fontSize: "14px", marginTop: "6px" }}>
            Configure pricing models.
          </div>
        </div>
        <button
          className="btn btn-secondary export-btn"
          onClick={() => setShowExportModal(true)}
        >
          <span className="material-icons">download</span>
          Export Report
        </button>

      </div>
      <div className="rates-scroll">
        <div className="rates-grid">
          <div className="rate-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  textAlign: "left",
                  fontWeight: 700,
                  color: "#fff",
                  fontSize: "16px",
                }}
              >
                Current Rate
              </div>
              <span
                className="material-icons"
                style={{ color: "var(--accent-blue)", fontSize: "20px" }}
              >
                info
              </span>
            </div>

            <div className="provider-dropdown">
              <button
                className={`dropdown-button ${isOpen ? "open" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
              >
                {selected}
                <span className="material-symbols-outlined"
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "0.3s"
                  }}
                >
                  keyboard_arrow_down
                </span>
              </button>

              {isOpen && (
                <div className="dropdown-menu">
                  <div className="searchBar">
                    <input
                      type="text"
                      placeholder="Search provider..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                      autoFocus
                    />
                  </div>

                  <ul className="options-list">
                    {majorProviders.length > 0 && (
                      <>
                        <li className="group-label">Major Providers</li>

                        {majorProviders.map((name) => {
                          const isSelected = selected === name;

                          return (
                            <li
                              key={name}
                              onClick={() => handleSelect(name)}
                              className={`provider-option ${isSelected ? "selected" : ""}`}
                            >
                              <div className="provider-left">
                                <div className="provider-logo">
                                  {providerLogos[name] ? (
                                    <img src={providerLogos[name]} alt={name} />
                                  ) : (
                                    <span>{name.charAt(0)}</span>
                                  )}
                                </div>

                                <div className="provider-info">
                                  <div className="provider-name">{name}</div>
                                  <div className="provider-sub">
                                    Rate: ₱ {MAJOR_PROVIDERS[name].toFixed(2)} / kWh
                                  </div>
                                </div>
                              </div>

                              {isSelected && <span className="checkmark material-symbols-outlined">
                                check
                              </span>}
                            </li>
                          );
                        })}
                      </>
                    )}

                    {otherProviders.length > 0 && (
                      <>
                        <li className="group-label">Cooperatives</li>

                        {otherProviders.map((name) => {
                          const isSelected = selected === name;

                          return (
                            <li
                              key={name}
                              onClick={() => handleSelect(name)}
                              className={`provider-option ${isSelected ? "selected" : ""}`}
                            >
                              <div className="provider-left">
                                <div className="provider-logo gray">
                                  <span>{name.charAt(0)}</span>
                                </div>

                                <div className="provider-info">
                                  <div className="provider-name">{name}</div>
                                  <div className="provider-sub muted">
                                    Rate: ₱ {DEFAULT_RATE.toFixed(2)} / kWh
                                  </div>
                                </div>
                              </div>

                              {isSelected && <div className="checkmark">✔</div>}
                            </li>
                          );
                        })}
                      </>
                    )}

                    {majorProviders.length === 0 && otherProviders.length === 0 && (
                      <li className="no-results">No results found</li>
                    )}
                  </ul>

                </div>
              )}
            </div>


            <div style={{ margin: "25px 0" }}>
              <div className="rate-main">₱ 12.50</div>
              <div style={{ color: "#888", fontSize: "14px" }}>per kWh</div>
            </div>

            <div className="rate-details">
              <div>
                <div className="rd-label">Effective Date</div>
                <div className="rd-val">Oct 23, 2025</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="rd-label">Movement</div>
                <div className="rd-val red">+0.60</div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              Update Rate
            </button>
          </div>

          <div className="trend-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 700, color: "#fff", fontSize: "16px" }}>
                Rate Trend
              </div>
              <div className="trend-toggle">
                <div className={`tt-opt ${showMonthlyTrend === true ? 'active' : ''}`} onClick={() => setshowMonthlyTrend(true) & setshowYearlyTrend(false) & setshowTrendStatsMonthly(true) & setshowTrendStatsYearly(false)}>Monthly</div>
                <div className={`tt-opt ${showYearlyTrend === true ? 'active' : ''}`} onClick={() => setshowYearlyTrend(true) & setshowMonthlyTrend(false) & setshowTrendStatsYearly(true) & setshowTrendStatsMonthly(false)}>Yearly</div>
              </div>
            </div>
            <div className="trend-stats-text">
              {showTrendStatYearly && (
                <>
                  <div>
                    HIGH <span className="ts-val">₱12.50</span>
                  </div>
                  <div>
                    LOW <span className="ts-val-low">₱8.50</span>
                  </div>
                </>
              )}
              {showTrendStatsMonthly && (
                <>
                  <div>
                    HIGH <span className="ts-val">₱21.00</span>
                  </div>
                  <div>
                    LOW <span className="ts-val-low">₱10.50</span>
                  </div>
                </>
              )}
            </div>

            <div
              className="chart-box animate-chart"
              key={showYearlyTrend ? "yearly" : "monthly"}
            >
              {showYearlyTrend && (
                <>
                  <div className="bar-group">
                    <div className="bar-val">₱8.50</div>
                    <div className="bar" style={{ height: "30%" }}></div>
                    <div className="bar-label">2015</div>
                  </div>

                  <div className="bar-group">
                    <div className="bar-val">₱8.90</div>
                    <div className="bar" style={{ height: "35%" }}></div>
                    <div className="bar-label">2016</div>
                  </div>

                  <div className="bar-group">
                    <div className="bar-val">₱9.20</div>
                    <div className="bar" style={{ height: "38%" }}></div>
                    <div className="bar-label">2017</div>
                  </div>

                  <div className="bar-group">
                    <div className="bar-val">₱9.50</div>
                    <div className="bar" style={{ height: "40%" }}></div>
                    <div className="bar-label">2018</div>
                  </div>

                  <div className="bar-group">
                    <div className="bar-val">₱9.80</div>
                    <div className="bar" style={{ height: "45%" }}></div>
                    <div className="bar-label">2019</div>
                  </div>

                  <div className="bar-group">
                    <div className="bar-val">₱10.20</div>
                    <div className="bar" style={{ height: "50%" }}></div>
                    <div className="bar-label">2020</div>
                  </div>

                  <div className="bar-group">
                    <div className="bar-val">₱10.50</div>
                    <div className="bar" style={{ height: "55%" }}></div>
                    <div className="bar-label">2021</div>
                  </div>

                  <div className="bar-group">
                    <div className="bar-val">₱11.10</div>
                    <div className="bar" style={{ height: "65%" }}></div>
                    <div className="bar-label">2022</div>
                  </div>

                  <div className="bar-group">
                    <div className="bar-val">₱11.80</div>
                    <div className="bar" style={{ height: "80%" }}></div>
                    <div className="bar-label">2023</div>
                  </div>

                  <div className="bar-group">
                    <div className="bar-val high">₱12.10</div>
                    <div className="bar active" style={{ height: "88%" }}></div>
                    <div className="bar-label">2024</div>
                  </div>

                  <div className="bar-group">
                    <div className="bar-val curr">₱12.50</div>
                    <div className="bar current" style={{ height: "98%" }}></div>
                    <div className="bar-label">2025</div>
                  </div>
                </>
              )}

              {showMonthlyTrend && (
                <>
                  <div className="bar-group">
                    <div className="bar-val">₱10.50</div>
                    <div className="bar" style={{ height: "30%" }}></div>
                    <div className="bar-label">Jan</div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-val">₱12.50</div>
                    <div className="bar" style={{ height: "32%" }}></div>
                    <div className="bar-label">Feb</div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-val">₱13.00</div>
                    <div className="bar" style={{ height: "33%" }}></div>
                    <div className="bar-label">Mar</div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-val">₱12.50</div>
                    <div className="bar" style={{ height: "32%" }}></div>
                    <div className="bar-label">Apr</div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-val">₱10.50</div>
                    <div className="bar" style={{ height: "30%" }}></div>
                    <div className="bar-label">May</div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-val">₱14.50</div>
                    <div className="bar" style={{ height: "40%" }}></div>
                    <div className="bar-label">Jun</div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-val">₱19.00</div>
                    <div className="bar" style={{ height: "50%" }}></div>
                    <div className="bar-label">Jul</div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-val">₱14.50</div>
                    <div className="bar" style={{ height: "40%" }}></div>
                    <div className="bar-label">Aug</div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-val">₱15.75</div>
                    <div className="bar" style={{ height: "41%" }}></div>
                    <div className="bar-label">Sep</div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-val">₱16.25</div>
                    <div className="bar" style={{ height: "42%" }}></div>
                    <div className="bar-label">Oct</div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-val">₱17.00</div>
                    <div className="bar active" style={{ height: "45%" }}></div>
                    <div className="bar-label">Nov</div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-val high">₱21.00</div>
                    <div className="bar current" style={{ height: "60%" }}></div>
                    <div className="bar-label">Dec</div>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date Modified</th>
              <th>Provider</th>
              <th>Rate Change</th>
              <th>Reason / Notes</th>
              <th>Status</th>
              <th>Updated By</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ color: "#ddd", fontWeight: 400 }}>Oct 23, 2025</td>
              <td>Meralco</td>
              <td>
                <span className="rate-pill">₱11.90</span>
                <span
                  style={{ color: "#666", fontSize: "12px", margin: "0 4px" }}
                >
                  →
                </span>
                <span className="rate-pill rate-up">₱12.50</span>
              </td>
              <td>Generation Charge Adj.</td>
              <td>
                <span className="status-badge sb-active">Active</span>
              </td>
              <td>
                <div className="admin-meta">
                  <div
                    className="user-avatar"
                    style={{ width: "28px", height: "28px", fontSize: "10px" }}
                  >
                    AD
                  </div>
                  Admin
                </div>
              </td>
            </tr>

            <tr>
              <td style={{ color: "#ddd", fontWeight: 400 }}>Sep 15, 2025</td>
              <td>Meralco</td>
              <td>
                <span className="rate-pill">₱12.40</span>
                <span
                  style={{ color: "#666", fontSize: "12px", margin: "0 4px" }}
                >
                  →
                </span>
                <span className="rate-pill rate-down">₱11.90</span>
              </td>
              <td>System Optimization</td>
              <td>
                <span className="status-badge sb-archived">Previous</span>
              </td>
              <td>
                <div className="admin-meta">
                  <div
                    className="user-avatar"
                    style={{ width: "28px", height: "28px", fontSize: "10px" }}
                  >
                    AD
                  </div>
                  Admin
                </div>
              </td>
            </tr>

            <tr>
              <td style={{ color: "#ddd", fontWeight: 400 }}>Aug 01, 2025</td>
              <td>Meralco</td>
              <td>
                <span className="rate-pill">₱12.10</span>
                <span
                  style={{ color: "#666", fontSize: "12px", margin: "0 4px" }}
                >
                  →
                </span>
                <span className="rate-pill rate-up">₱12.40</span>
              </td>
              <td>Inflation Adjustment</td>
              <td>
                <span className="status-badge sb-archived">Previous</span>
              </td>
              <td>
                <div className="admin-meta">
                  <div
                    className="user-avatar"
                    style={{ width: "28px", height: "28px", fontSize: "10px" }}
                  >
                    AD
                  </div>
                  Admin
                </div>
              </td>
            </tr>

            <tr>
              <td style={{ color: "#ddd", fontWeight: 400 }}>Jul 12, 2025</td>
              <td>Meralco</td>
              <td>
                <span className="rate-pill">₱12.80</span>
                <span
                  style={{ color: "#666", fontSize: "12px", margin: "0 4px" }}
                >
                  →
                </span>
                <span className="rate-pill rate-down">₱12.10</span>
              </td>
              <td>Substation Efficiency</td>
              <td>
                <span className="status-badge sb-archived">Previous</span>
              </td>
              <td>
                <div className="admin-meta">
                  <div
                    className="user-avatar"
                    style={{ width: "28px", height: "28px", fontSize: "10px" }}
                  >
                    AD
                  </div>
                  Admin
                </div>
              </td>
            </tr>

            <tr>
              <td style={{ color: "#ddd", fontWeight: 400 }}>Jun 05, 2025</td>
              <td>Meralco</td>
              <td>
                <span className="rate-pill">₱11.50</span>
                <span
                  style={{ color: "#666", fontSize: "12px", margin: "0 4px" }}
                >
                  →
                </span>
                <span className="rate-pill rate-up">₱12.80</span>
              </td>
              <td>Summer Peak Pricing</td>
              <td>
                <span className="status-badge sb-archived">Previous</span>
              </td>
              <td>
                <div className="admin-meta">
                  <div
                    className="user-avatar"
                    style={{ width: "28px", height: "28px", fontSize: "10px" }}
                  >
                    AD
                  </div>
                  Admin
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-title">Update Electricity Rate</div>

            <div className="form-group">
              <label className="form-label">Provider Name</label>
              <input
                type="text"
                className="form-input"
                defaultValue="Meralco (Metro Manila)"
                readOnly
                style={{
                  background: "#1a1a1a",
                  color: "#888",
                  borderColor: "#333",
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Rate (₱ per kWh)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 12.60"
                step="0.01"
                value={electricityRate}
                onChange={(e) => setElectricityRate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reason / Notes</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Generation Charge Adjustment"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
                style={{ width: "100%" }}
              >
                Cancel
              </button>
              <button onClick={handleUpdate} className="btn btn-primary" style={{ width: "100%" }}>
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
      {showExportModal && (
        <div className="export-backdrop" onClick={() => setShowExportModal(false)}>
          <div
            style={{
              backgroundColor: "#0F0F0F",
              borderRadius: "12px",
              border: "1px solid #333333",
              padding: "20px",
              maxWidth: "330px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)",
              animation: "slideUp 0.5s",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span
                className="material-icons"
                style={{
                  fontSize: "35px",
                  marginTop: "10px",
                  color: "#0055FF",
                }}
              >
                download
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <span
                style={{ fontSize: "15.5px", fontWeight: "600", color: "#fff", marginTop: "10px" }}
              >
                Export CSV File
              </span>
              <span style={{ fontSize: "12px", color: "#aaa" }}>
                Would you like to export utility rates data report?
              </span>
            </div>

            <div className="export-footer">
              <button
                className="r-btn-secondary"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>

              <button className="r-btn-primary" onClick={handleExport}>
                Export
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Rates;
