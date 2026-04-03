import React, { useState, useEffect, useMemo } from "react";
import "./Dashboard.css";
import "../../components/stat-pills/stat_pills.css";
import "../../components/dropdowns/searchableDropdown.css";
import { supabase } from "../../supabaseClient";

const MAJOR_PROVIDERS = {
  "Meralco (Industrial)": 9.8,
  "Meralco (Commercial)": 10.5,
  "Visayan Electric (VECO) (Commercial)": 10.15,
  "Davao Light (DLPC)": 10.24,
};

const DEFAULT_RATE = 9.75;

const Dashboard = () => {
  const [showMonthlyTrend, setshowMonthlyTrend] = useState(false);
  const [showYearlyTrend, setshowYearlyTrend] = useState(true);
  const [showTrendStatsMonthly, setshowTrendStatsMonthly] = useState(false);
  const [showTrendStatYearly, setshowTrendStatsYearly] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Meralco (Commercial)");

  const [totalUsers, setTotalUsers] = useState(0);
  const [previousMonthUsers, setPreviousMonthUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rateLogs, setRateLogs] = useState([]);
  const [firmwareHistory, setFirmwareHistory] = useState([]);
  const [activeFirmwareVersion, setActiveFirmwareVersion] =
    useState("Loading...");

  useEffect(() => {
    fetchResidentUsers();
    fetchRateLogs();
    fetchFirmwareData();
  }, []);

  const fetchFirmwareData = async () => {
    try {
      const { data, error } = await supabase
        .from("firmware_releases")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        const activeVersion = data.find(release => release.is_active);
        setActiveFirmwareVersion(activeVersion ? activeVersion.version : "None");
      } else {
        setActiveFirmwareVersion("None");
      }
      setFirmwareHistory(data || []);
    } catch (error) {
      console.error("Error fetching firmware:", error);
      setActiveFirmwareVersion("Error");
    }
  };

  const fetchRateLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("utility_rates_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRateLogs(data || []);
    } catch (error) {
      console.error("Error fetching rate logs:", error);
    }
  };

  const fetchResidentUsers = async () => {
    try {
      setLoading(true);

      const { data, count, error } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("role", "resident");

      if (error) {
        console.error("Query error:", error);
        throw error;
      }

      console.log("Resident count:", count);
      setTotalUsers(count || 0);
      setPreviousMonthUsers(Math.floor(count || 0));

      setLoading(false);
    } catch (error) {
      console.error("Error fetching resident users:", error);
      try {
        const { count: allCount, error: allError } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        if (!allError) {
          console.log("Total users (all roles):", allCount);
          setTotalUsers(allCount || 0);
          setPreviousMonthUsers(Math.floor((allCount || 0) * 0.89));
        }
      } catch (e) {
        console.error("Fallback query also failed:", e);
      }
      setLoading(false);
    }
  };

  const allProviders = [
    "ABRECO",
    "AEC (Albay)",
    "AKELCO",
    "ALECO",
    "ANECO",
    "ANTECO",
    "ASELCO",
    "AURELCO",
    "BALAMBAN",
    "BANELCO",
    "BASELCO",
    "BATANELCO",
    "BATELEC I",
    "BATELEC II",
    "BENECO",
    "BILECO",
    "BISELCO",
    "BOHECO I",
    "BOHECO II",
    "BUSECO",
    "CAGELCO I",
    "CAGELCO II",
    "CAMELCO",
    "CANORECO",
    "CAPELCO",
    "CASURECO I",
    "CASURECO II",
    "CASURECO III",
    "CASURECO IV",
    "CEBECO I",
    "CEBECO II",
    "CEBECO III",
    "CELCOR",
    "CENPELCO",
    "CEPALCO",
    "CLPC (Calamba)",
    "COTELCO",
    "DASURECO",
    "Davao Light (DLPC)",
    "DECORP",
    "DIELCO",
    "DORELCO",
    "ESAMELCO",
    "FLECO",
    "GUIMELCO",
    "IFELCO",
    "ILECO I",
    "ILECO II",
    "ILECO III",
    "ILPI (Iligan)",
    "INEC",
    "ISECO",
    "ISELCO I",
    "ISELCO II",
    "KAELCO",
    "LANECO",
    "LEYECO II",
    "LEYECO III",
    "LEYECO IV",
    "LEYECO V",
    "LUELCO",
    "MAGELCO",
    "MARELCO",
    "MECO (Mactan)",
    "MOPRECO",
    "MORESCO I",
    "MORESCO II",
    "NEECO I",
    "NEECO II",
    "NOCECO",
    "NONECO",
    "NORECO I",
    "NORECO II",
    "NORSAMELCO",
    "NUVELCO",
    "OMECO",
    "ORMECO",
    "PALECO",
    "PANELCO I",
    "PANELCO III",
    "PELCO I",
    "PELCO II",
    "PELCO III",
    "PENELCO",
    "QUEZELCO I",
    "QUEZELCO II",
    "QUIRELCO",
    "ROMELCO",
    "SAMELCO I",
    "SAMELCO II",
    "SOCOTECO I",
    "SOCOTECO II",
    "SOLECO",
    "SUKELCO",
    "SURNECO",
    "SURSECO",
    "TARELCO I",
    "TARELCO II",
    "TAWELCO",
    "Visayan Electric (VECO)",
    "ZAMCELCO",
    "ZAMECO I",
    "ZAMECO II",
    "ZAMSURECO",
    "ZANECO",
  ].sort((a, b) => a.localeCompare(b));

  const searchLower = searchTerm.toLowerCase();

  const majorProviders = Object.keys(MAJOR_PROVIDERS).filter((p) =>
    p.toLowerCase().includes(searchLower),
  );

  const otherProviders = allProviders
    .filter((p) => !Object.prototype.hasOwnProperty.call(MAJOR_PROVIDERS, p))
    .filter((p) => p.toLowerCase().includes(searchLower));

  const providerLogos = {
    "Meralco (Industrial)": "./MERALCO.png",
    "Meralco (Commercial)": "./MERALCO.png",
    "Davao Light (DLPC)": "./DAVAO LIGHT.png",
    "Visayan Electric (VECO) (Commercial)": "./VECO.png",
    ABRECO: "./ABRECO.png",
    "AEC (Albay)": "./AEC.png",
    AKELCO: "./AKELCO.png",
    ALECO: "./ALECO.png",
    ANECO: "./ANECO.png",
    ANTECO: "./ANTECO.png",
    ASELCO: "./ASELCO.png",
    AURELCO: "./AURELCO.png",
    BALAMBAN: "./BALAMBAN.png",
    BANELCO: "./BANELCO.png",
    BASELCO: "./BASELCO.png",
    BATANELCO: "./BATANELCO.png",
    "BATELEC I": "./BATELEC I.png",
    "BATELEC II": "./BATELEC II.png",
    BENECO: "./BENECO.png",
    BILECO: "./BILECO.png",
    BISELCO: "./BISELCO.png",
    "BOHECO I": "./BOHECO I.png",
    "BOHECO II": "./BOHECO II.png",
    BUSECO: "./BUSECO.png",
    "CAGELCO I": "./CAGELCO I.png",
    "CAGELCO II": "./CAGELCO II.png",
    CAMELCO: "./CAMELCO.png",
    CANORECO: "./CANORECO.png",
    CAPELCO: "./CAPELCO.png",
    "CASURECO I": "./CASURECO I.png",
    "CASURECO II": "./CASURECO II.png",
    "CASURECO III": "./CASURECO III.png",
    "CASURECO IV": "./CASURECO IV.png",
    "CEBECO I": "./CEBECO I.png",
    "CEBECO II": "./CEBECO II.png",
    "CEBECO III": "./CEBECO III.png",
    CELCOR: "./CELCOR.png",
    CENPELCO: "./CENPELCO.png",
    CEPALCO: "./CEPALCO.png",
    "CLPC (Calamba)": "./CLPC.png",
    COTELCO: "./COTELCO.png",
    DASURECO: "./DASURECO.png",
    DECORP: "./DECORP.png",
    DIELCO: "./DIELCO.png",
    DORELCO: "./DORELCO.png",
    ESAMELCO: "./ESAMELCO.png",
    FLECO: "./FLECO.png",
    GUIMELCO: "./GUIMELCO.png",
    IFELCO: "./IFELCO I.png",
    "ILECO I": "./ILECO I.png",
    "ILECO II": "./ILECO II.png",
    "ILECO III": "./ILECO III.png",
    "ILPI (Iligan)": "./ILPI.png",
    INEC: "./INEC.png",
    ISECO: "./ISECO.png",
    "ISELCO I": "./ISELCO I.png",
    "ISELCO II": "./ISELCO II.png",
    KAELCO: "./KAELCO.png",
    LANECO: "./LANECO.png",
    "LEYECO II": "./LEYECO II.png",
    "LEYECO III": "./LEYECO III.png",
    "LEYECO IV": "./LEYECO IV.png",
    "LEYECO V": "./LEYECO V.png",
    LUELCO: "./LUELCO.png",
    MAGELCO: "./MAGELCO.png",
    MARELCO: "./MARELCO.png",
    "MECO (Mactan)": "./MECO.png",
    MOPRECO: "./MOPRECO.png",
    "MORESCO I": "./MORESCO I.png",
    "MORESCO II": "./MORESCO II.png",
    "NEECO I": "./NEECO I.png",
    "NEECO II": "./NEECO II.png",
    "NON  ECO": "./NONECO.png",
    "NORECO I": "./NORECO I.png",
    "NORECO II": "./NORECO II.png",
    NORSAMELCO: "./NORSAMELCO.png",
    NUVELCO: "./NUVELCO.png",
    OMECO: "./OMECO.png",
    ORMECO: "./ORMECO.png",
    PALECO: "./PALECO.png",
    "PANELCO I": "./PANELCO I.png",
    "PANELCO III": "./PANELCO III.png",
    "PELCO I": "./PELCO I.png",
    "PELCO II": "./PELCO II.png",
    "PELCO III": "./PELCO III.png",
    PENELCO: "./PENELCO.png",
    "QUEZELCO I": "./QUEZELCO I.png",
    "QUEZELCO II": "./QUEZELCO II.png",
    QUIRELCO: "./QUIRELCO.png",
    ROMELCO: "./ROMELCO.png",
    "SAMELCO I": "./SAMELCO I.png",
    "SAMELCO II": "./SAMELCO II.png",
    "SOCOTECO I": "./SOCOTECO I.png",
    "SOCOTECO II": "./SOCOTECO II.png",
    SOLECO: "./SOLECO.png",
    SUKELCO: "./SUKELCO.png",
    SURNECO: "./SURENCO.png",
    SURSECO: "./SURSECO.png",
    "TARELCO I": "./TARELCO I.png",
    "TARELCO II": "./TARELCO II.png",
    TAWELCO: "./TAWELCO.png",
    "Visayan Electric (VECO)": "./VECO.png",
    ZAMCELCO: "./ZAMCELCO.png",
    "ZAMECO I": "./ZAMECO I.png",
    "ZAMECO II": "./ZAMECO II.png",
    ZAMSURECO: "./ZAMSURECO.png",
    ZANECO: "./ZANECO.png",
  };

  const handleSelect = (option) => {
    setSelected(option);
    setSearchTerm("");
    setIsOpen(false);
  };

  const parseSelection = (selection) => {
    let name = selection;
    let type = "Residential";

    if (selection.includes("(Industrial)")) {
      name = selection.replace("(Industrial)", "").trim();
      type = "Industrial";
    } else if (selection.includes("(Commercial)")) {
      name = selection.replace("(Commercial)", "").trim();
      type = "Commercial";
    } else if (selection.includes("(Residential)")) {
      name = selection.replace("(Residential)", "").trim();
      type = "Residential";
    }
    return { name, type };
  };

  const getProviderCurrentRate = (selection) => {
    const { name, type } = parseSelection(selection);
    const latestLog = rateLogs.find(
      (log) => log.provider_name === name && log.rate_type === type,
    );
    return latestLog
      ? Number(latestLog.rate_per_kwh)
      : MAJOR_PROVIDERS[selection] || DEFAULT_RATE;
  };

  const { name: selectedProvider, type: selectedType } =
    parseSelection(selected);
  const filteredLogs = rateLogs.filter(
    (log) =>
      log.provider_name === selectedProvider &&
      (log.rate_type === selectedType ||
        (selectedType === "Residential" && log.rate_type === "standard")),
  );

  const chartData = useMemo(() => {
    const sortedLogs = [...filteredLogs].sort(
      (a, b) =>
        new Date(a.effective_date || a.created_at) -
        new Date(b.effective_date || b.created_at),
    );

    const parseRate = (val) => Number(val || 0);
    const getLogDate = (log) => new Date(log.effective_date || log.created_at);
    const getPrevRate = (log) =>
      Number(log.rate_per_kwh) - Number(log.movement || 0);

    let baseRate = getProviderCurrentRate(selected);

    if (showYearlyTrend) {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 4;
      const data = [];

      const logsBefore = sortedLogs.filter(
        (l) => getLogDate(l).getFullYear() < startYear,
      );
      let runningRate =
        logsBefore.length > 0
          ? parseRate(logsBefore[logsBefore.length - 1].rate_per_kwh)
          : baseRate;

      if (sortedLogs.length > 0 && logsBefore.length === 0) {
        const firstLog = sortedLogs[0];
        if (getLogDate(firstLog).getFullYear() >= startYear) {
          runningRate = getPrevRate(firstLog);
        }
      }

      for (let y = startYear; y <= currentYear; y++) {
        const logsInYear = sortedLogs.filter(
          (l) => getLogDate(l).getFullYear() === y,
        );
        if (logsInYear.length > 0) {
          runningRate = parseRate(
            logsInYear[logsInYear.length - 1].rate_per_kwh,
          );
        }
        data.push({
          label: y.toString(),
          value: runningRate,
          isCurrent: y === currentYear,
        });
      }
      return data;
    } else {
      const year = new Date().getFullYear();
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const data = [];

      const logsBefore = sortedLogs.filter(
        (l) => getLogDate(l).getFullYear() < year,
      );
      let runningRate =
        logsBefore.length > 0
          ? parseRate(logsBefore[logsBefore.length - 1].rate_per_kwh)
          : baseRate;

      if (sortedLogs.length > 0 && logsBefore.length === 0) {
        const firstLog = sortedLogs[0];
        if (getLogDate(firstLog).getFullYear() === year) {
          runningRate = getPrevRate(firstLog);
        }
      }

      const currentMonth = new Date().getMonth();

      for (let m = 0; m <= currentMonth; m++) {
        const logsInMonth = sortedLogs.filter((l) => {
          const d = getLogDate(l);
          return d.getFullYear() === year && d.getMonth() === m;
        });

        if (logsInMonth.length > 0) {
          runningRate = parseRate(
            logsInMonth[logsInMonth.length - 1].rate_per_kwh,
          );
        }

        data.push({
          label: months[m],
          value: runningRate,
          isCurrent: m === currentMonth,
        });
      }
      return data;
    }
  }, [filteredLogs, showYearlyTrend, selected, rateLogs]);

  const chartMax = Math.max(...chartData.map((d) => d.value), 1);
  const chartMin =
    chartData.length > 0 ? Math.min(...chartData.map((d) => d.value)) : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard Overview</div>
          <div className="page-desc">
            Monday, Dec 15 • System Status: Online
          </div>
        </div>
      </div>

      <div className="dashboard-top-grid">
        <div className="stats-cards-container">
          <div className="stat-card">
            <div className="sc-label">
              <span
                className="material-icons text-accent"
                style={{ fontSize: "20px" }}
              >
                group
              </span>
              Total Residents
            </div>
            <div className="sc-val">
              {loading ? "..." : totalUsers.toLocaleString()}
            </div>
            <div className="sc-sub text-primary">
              {loading
                ? "Loading..."
                : `+${(((totalUsers - previousMonthUsers) / previousMonthUsers) * 100).toFixed(1)}% vs last month`}
            </div>
          </div>

          <div className="stat-card">
            <div className="sc-label">
              <span
                style={{ fontSize: "20px" }}
                className="material-symbols-outlined text-primary"
              >
                highlight_mouse_cursor
              </span>
              Firmware Release
            </div>
            <div className="sc-val">{activeFirmwareVersion}</div>
            <div className="sc-sub text-primary">Latest Stable Version</div>
          </div>
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
              <div
                className={`tt-opt ${showMonthlyTrend === true ? "active" : ""}`}
                onClick={() =>
                  setshowMonthlyTrend(true) &
                  setshowYearlyTrend(false) &
                  setshowTrendStatsMonthly(true) &
                  setshowTrendStatsYearly(false)
                }
              >
                Monthly
              </div>
              <div
                className={`tt-opt ${showYearlyTrend === true ? "active" : ""}`}
                onClick={() =>
                  setshowYearlyTrend(true) &
                  setshowMonthlyTrend(false) &
                  setshowTrendStatsYearly(true) &
                  setshowTrendStatsMonthly(false)
                }
              >
                Yearly
              </div>
            </div>
          </div>

          <div style={{ marginTop: "0px", marginBottom: "2px" }}>
            <div className="provider-dropdown">
              <button
                className={`dropdown-button ${isOpen ? "open" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                style={{ width: "100%", maxWidth: "300px" }}
              >
                {selected}
                <span
                  className="material-symbols-outlined"
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "0.3s",
                  }}
                >
                  keyboard_arrow_down
                </span>
              </button>

              {isOpen && (
                <div
                  className="dropdown-menu rates"
                  style={{ width: "100%", maxWidth: "300px" }}
                >
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
                          const logoKey = providerLogos[name];
                          const logoSrc = logoKey
                            ? `/provider_images/${logoKey.replace("./", "")}`
                            : null;
                          return (
                            <li
                              key={name}
                              onClick={() => handleSelect(name)}
                              className={`provider-option ${isSelected ? "selected" : ""}`}
                            >
                              <div className="provider-left">
                                <div className="provider-logo">
                                  {logoSrc ? (
                                    <img src={logoSrc} alt={name} />
                                  ) : (
                                    <span>{name.charAt(0)}</span>
                                  )}
                                </div>
                                <div className="provider-info">
                                  <div className="provider-name">{name}</div>
                                  <div className="provider-sub">
                                    Rate: ₱{" "}
                                    {getProviderCurrentRate(name).toFixed(2)} /
                                    kWh
                                  </div>
                                </div>
                              </div>
                              {isSelected && (
                                <span className="checkmark material-symbols-outlined">
                                  check
                                </span>
                              )}
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
                          const logoKey = providerLogos[name];
                          const logoSrc = logoKey
                            ? `/provider_images/${logoKey.replace("./", "")}`
                            : null;
                          return (
                            <li
                              key={name}
                              onClick={() => handleSelect(name)}
                              className={`provider-option ${isSelected ? "selected" : ""}`}
                            >
                              <div className="provider-left">
                                <div className="provider-logo">
                                  {logoSrc ? (
                                    <img src={logoSrc} alt={name} />
                                  ) : (
                                    <span>{name.charAt(0)}</span>
                                  )}
                                </div>
                                <div className="provider-info">
                                  <div className="provider-name">{name}</div>
                                  <div className="provider-sub muted">
                                    Rate: ₱{" "}
                                    {getProviderCurrentRate(name).toFixed(2)} /
                                    kWh
                                  </div>
                                </div>
                              </div>
                              {isSelected && (
                                <span className="checkmark material-symbols-outlined">
                                  check
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </>
                    )}

                    {majorProviders.length === 0 &&
                      otherProviders.length === 0 && (
                        <li className="no-results">No results found</li>
                      )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="trend-stats-text">
            <div>
              HIGH <span className="ts-val">₱{chartMax.toFixed(2)}</span>
            </div>
            <div>
              LOW <span className="ts-val-low">₱{chartMin.toFixed(2)}</span>
            </div>
          </div>

          <div
            className="chart-box animate-chart"
            key={showYearlyTrend ? "yearly" : "monthly"}
          >
            {chartData.map((item, index) => {
              const maxVal = Math.max(...chartData.map((d) => d.value), 1);
              const height = maxVal > 0 ? (item.value / maxVal) * 85 : 0;
              return (
                <div className="bar-group" key={index}>
                  <div
                    className={`bar-val ${item.value === chartMax ? "high" : ""} ${item.isCurrent ? "curr" : ""}`}
                  >
                    ₱{item.value.toFixed(2)}
                  </div>
                  <div
                    className={`bar ${item.isCurrent ? "current" : ""}`}
                    style={{ height: `${Math.max(height, 5)}%` }}
                  ></div>
                  <div className="bar-label">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="table-container">
          <div
            style={{
              padding: "20px 25px",
              borderBottom: "1px solid #333",
              fontWeight: 700,
              fontSize: "16px",
              color: "#fff",
            }}
          >
            Version History
          </div>
          <div className="table-container-scrollable">
            <table>
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Release Date</th>
                </tr>
              </thead>
              <tbody>
                {firmwareHistory.slice(0, 7).map((fw) => (
                  <tr key={fw.id}>
                    <td style={{ fontWeight: 600, color: "#fff" }}>
                      {fw.version}
                    </td>
                    <td>
                      <span
                        className={`stat-badge ${fw.is_active ? "st-solved" : "stat-archived"}`}
                      >
                        {fw.is_active ? "Active" : "Archived"}
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        color: "#888",
                        fontSize: "12px",
                      }}
                    >
                      {new Date(fw.created_at).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
                {firmwareHistory.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
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
        </div>

        <div className="table-container">
          <div
            style={{
              padding: "20px 25px",
              borderBottom: "1px solid #333",
              fontWeight: 700,
              fontSize: "16px",
              color: "#fff",
            }}
          >
            Recent Rate Updates
          </div>
          <div className="table-container-scrollable">
            <table>
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Rate</th>
                  <th style={{ textAlign: "right" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {rateLogs.slice(0, 7).map((log) => {
                  const newRate = Number(log.rate_per_kwh) || 0;
                  const movement = Number(log.movement) || 0;
                  const prevRate = newRate - movement;
                  const isIncrease = movement > 0;

                  return (
                    <tr key={log.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#fff" }}>
                          {log.provider_name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {log.rate_type}
                        </div>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span className="rate-pill">
                            ₱{prevRate.toFixed(2)}
                          </span>
                          <span style={{ color: "#666", fontSize: "12px" }}>
                            →
                          </span>
                          <span
                            className={`rate-pill ${isIncrease ? "rate-up" : "rate-down"}`}
                          >
                            ₱{newRate.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          color: "#888",
                          fontSize: "12px",
                        }}
                      >
                        {new Date(
                          log.effective_date || log.created_at,
                        ).toLocaleDateString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}
                {rateLogs.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "#666",
                        fontSize: "13px",
                      }}
                    >
                      No recent updates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
