import React, { useState } from "react";
import "../super_admin/Rates.css";
import "../../components/dropdowns/searchableDropdown.css"
import { PuffLoader } from "react-spinners";
import { PopupNotification } from "../../components/notifications/PopUpNotification";
import { LoadingPopup } from "../../components/loaders/LoadingPopUp";
import CalendarDropdown from "../../components/dropdowns/CalendarDropdown";
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
  const [exportFromDate, setExportFromDate] = useState("");
  const [exportToDate, setExportToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  
  const allRates = [
    { id: 1, date: "Oct 23, 2025", provider: "Meralco", prevRate: "₱11.90", newRate: "₱12.50", reason: "Generation Charge Adj.", status: "Active", updatedBy: "Admin", role: "admin" },
    { id: 2, date: "Sep 15, 2025", provider: "Meralco", prevRate: "₱12.40", newRate: "₱11.90", reason: "System Optimization", status: "Previous", updatedBy: "Super Admin", role: "super admin" },
    { id: 3, date: "Aug 01, 2025", provider: "Meralco", prevRate: "₱12.10", newRate: "₱12.40", reason: "Inflation Adjustment", status: "Previous", updatedBy: "Admin", role: "admin" },
    { id: 4, date: "Jul 12, 2025", provider: "Meralco", prevRate: "₱12.80", newRate: "₱12.10", reason: "Substation Efficiency", status: "Previous", updatedBy: "Admin", role: "admin" },
    { id: 5, date: "Jun 05, 2025", provider: "Meralco", prevRate: "₱11.50", newRate: "₱12.80", reason: "Summer Peak Pricing", status: "Previous", updatedBy: "Super Admin", role: "super admin" },
    { id: 6, date: "May 10, 2025", provider: "VECO", prevRate: "₱10.80", newRate: "₱11.20", reason: "Transmission Cost", status: "Previous", updatedBy: "Admin", role: "admin" },
    { id: 7, date: "Apr 22, 2025", provider: "DLPC", prevRate: "₱10.50", newRate: "₱10.80", reason: "Distribution Fee Adj.", status: "Previous", updatedBy: "Admin", role: "admin" },
    { id: 8, date: "Mar 15, 2025", provider: "Meralco", prevRate: "₱12.40", newRate: "₱12.80", reason: "Fuel Cost Increase", status: "Previous", updatedBy: "Super Admin", role: "super admin" },
    { id: 9, date: "Feb 28, 2025", provider: "VECO", prevRate: "₱11.00", newRate: "₱10.80", reason: "System Efficiency", status: "Previous", updatedBy: "Admin", role: "admin" },
    { id: 10, date: "Jan 20, 2025", provider: "DLPC", prevRate: "₱10.20", newRate: "₱10.50", reason: "Maintenance Cost", status: "Previous", updatedBy: "Admin", role: "admin" },
    { id: 11, date: "Dec 10, 2024", provider: "Meralco", prevRate: "₱12.10", newRate: "₱12.40", reason: "Year-end Adjustment", status: "Previous", updatedBy: "Super Admin", role: "super admin" },
    { id: 12, date: "Nov 05, 2024", provider: "VECO", prevRate: "₱10.90", newRate: "₱11.00", reason: "Quarterly Review", status: "Previous", updatedBy: "Admin", role: "admin" },
  ];

  
  const totalPages = Math.ceil(allRates.length / itemsPerPage);
  const paginatedRates = allRates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      try {
        const headers = ["Date Modified", "Provider", "Previous Rate", "New Rate", "Reason / Notes", "Status", "Updated By"];

        const ratesData = [
          ["Oct 23, 2025", "Meralco", "₱11.90", "₱12.50", "Generation Charge Adj.", "Active", "Admin"],
          ["Sep 15, 2025", "Meralco", "₱12.40", "₱11.90", "System Optimization", "Previous", "Admin"],
          ["Aug 01, 2025", "Meralco", "₱12.10", "₱12.40", "Inflation Adjustment", "Previous", "Admin"],
          ["Jul 12, 2025", "Meralco", "₱12.80", "₱12.10", "Substation Efficiency", "Previous", "Admin"],
          ["Jun 05, 2025", "Meralco", "₱11.50", "₱12.80", "Summer Peak Pricing", "Previous", "Admin"],
        ];

        let ratesToExport = ratesData;

        const rows = ratesToExport.map((row) =>
          row.map((cell) =>
            (cell || "").toString().replace(/₱/g, "P")
          )
        );

        const csvContent = [
          headers.join(","),
          ...rows.map((row) =>
            row
              .map((cell) => `"${(cell || "").toString().replace(/"/g, '""')}"`)
              .join(",")
          ),
        ].join("\n");

        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `rates_report_${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setLoader({
          show: false,
          message: "Processing..."
        });

        setNotification({
          show: true,
          title: "Export Successful",
          message: `Successfully exported ${ratesToExport.length} rate records.`,
          variant: "success",
          icon: "check_circle"
        });

        setShowExportModal(false);
        setExportFromDate("");
        setExportToDate("");
      } catch (error) {
        setLoader({
          show: false,
          message: "Processing..."
        });

        setNotification({
          show: true,
          title: "Export Failed",
          message: error.message || "Failed to export CSV file.",
          variant: "error",
          icon: "error"
        });
      }
    }, 1500);
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
        title: "Missing Inputs",
        message: "Please enter an electricity rate.",
        variant: "warning",
        icon: "warning"
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
        title: "Validation Error",
        message: "Please enter a valid positive number for the electricity rate.",
        variant: "error",
        icon: "error"
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
          className="btn btn-primary"
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
                style={{ color: "#FFD700",fontSize: "20px" }}
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
                <div className="dropdown-menu rates">
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
            {paginatedRates.map((rate) => {
              const isIncrease = parseFloat(rate.newRate.replace('₱', '')) > parseFloat(rate.prevRate.replace('₱', ''));
              return (
                <tr key={rate.id}>
                  <td style={{ color: "#ddd", fontWeight: 400 }}>{rate.date}</td>
                  <td>{rate.provider}</td>
                  <td>
                    <span className="rate-pill">{rate.prevRate}</span>
                    <span
                      style={{ color: "#666", fontSize: "12px", margin: "0 4px" }}
                    >
                      →
                    </span>
                    <span className={`rate-pill ${isIncrease ? 'rate-up' : 'rate-down'}`}>{rate.newRate}</span>
                  </td>
                  <td>{rate.reason}</td>
                  <td>
                    <span className={`stat-badge ${rate.status === 'Active' ? 'stat-active' : 'stat-review'}`}>{rate.status}</span>
                  </td>
                  <td>
                    <div className="admin-meta">
                      <div
                        className="user-avatar"
                        style={{ 
                          width: "28px", 
                          height: "28px", 
                          fontSize: "10px",
                          background: rate.role === "super admin" ? "#ffd700" : "#0055ff"
                        }}
                      >
                        {rate.role === "super admin" ? "SA" : "AD"}
                      </div>
                      {rate.updatedBy}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="a-pagination">
        <div style={{ fontSize: "14px", color: "#666" }}>
          Showing{" "}
          {(currentPage - 1) * itemsPerPage + 1}
          {"–"}
          {Math.min(currentPage * itemsPerPage, allRates.length)}
          {" "}of {allRates.length}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="u-page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            style={{
              opacity: currentPage === 1 ? 0.4 : 1,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            {"<"}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`u-page-btn ${page === currentPage ? "active" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="u-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            style={{
              opacity: currentPage === totalPages ? 0.4 : 1,
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            {">"}
          </button>
        </div>
      </div>
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
              maxWidth: "380px",
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
                  color: "#00A651",
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
                Select a date range to filter rates by date (optional)
              </span>
            </div>

            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>From Date</label>
                  <CalendarDropdown
                    value={exportFromDate}
                    onChange={setExportFromDate}
                    placeholder="MM/DD/YY"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>To Date</label>
                  <CalendarDropdown
                    value={exportToDate}
                    onChange={setExportToDate}
                    placeholder="MM/DD/YY"
                  />
                </div>
              </div>
            </div>

            <div className="export-footer" style={{ marginTop: "20px" }}>
              <button
                style={{
                  background: "#2a2a2a",
                  border: "1px solid #444",
                  color: "#ccc",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  flex: 1,
                  fontWeight: "600",
                  transition: "0.2s"
                }}
                onClick={() => {
                  setShowExportModal(false);
                  setExportFromDate("");
                  setExportToDate("");
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#333";
                  e.target.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#2a2a2a";
                  e.target.style.color = "#ccc";
                }}
              >
                Cancel
              </button>

              <button
                style={{
                  background: "#00A651",
                  color: "#fff",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  flex: 1,
                  fontWeight: "600",
                  border: "none",
                  transition: "0.2s"
                }}
                onClick={handleExport}
                onMouseEnter={(e) => {
                  e.target.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = "1";
                }}
              >
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
