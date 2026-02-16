import React, { useEffect, useState, useLayoutEffect } from "react";
import "../../super_admin/CSS_Files/Rates.css";
import "../../../components/dropdowns/searchableDropdown.css";
import { PuffLoader } from "react-spinners";
import { PopupNotification } from "../../../components/notifications/PopUpNotification";
import { LoadingPopup } from "../../../components/loaders/LoadingPopUp";
import CalendarDropdown from "../../../components/dropdowns/CalendarDropdown";
import { supabase } from "../../../supabaseClient";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const availableColumns = [
  { label: "Date Modified", key: "date" },
  { label: "Provider", key: "provider" },
  { label: "Previous Rate", key: "prevRate" },
  { label: "New Rate", key: "newRate" },
  { label: "Reason / Notes", key: "reason" },
  { label: "Status", key: "status" },
  { label: "Updated By", key: "updatedBy" },
];

const Rates = () => {
  const [showModal, setShowModal] = useState(false);
  const [electricityRate, setElectricityRate] = useState("");
  const [description, setDescription] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFromDate, setExportFromDate] = useState("");
  const [exportToDate, setExportToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingRates, setLoadingRates] = useState(true);
  const [rateRows, setRateRows] = useState([]);
  const [rateLogs, setRateLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    name: "Admin",
    role: "admin",
    id: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Meralco (Commercial)");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [isYearOpen, setIsYearOpen] = useState(false);
  const itemsPerPage = 5;
  const [selectedColumns, setSelectedColumns] = useState(
    availableColumns.map((c) => c.key),
  );

  const [notification, setNotification] = useState({
    show: false,
    title: "",
    message: "",
    variant: "success",
    icon: "info",
  });

  const [loader, setLoader] = useState({
    show: false,
    message: "Processing...",
  });

  const MAJOR_PROVIDERS = {
    "Meralco (Industrial)": 9.8,
    "Meralco (Commercial)": 10.5,
    "Visayan Electric (VECO) (Commercial)": 10.15,
    "Davao Light (DLPC)": 10.24,
  };

  const DEFAULT_RATE = 9.75;

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

  const { name: selectedProvider, type: selectedType } =
    parseSelection(selected);
  const filteredLogs = rateLogs.filter(
    (log) =>
      log.providerName === selectedProvider &&
      (log.rateType === selectedType ||
        (selectedType === "Residential" && log.rateType === "standard")),
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedRates = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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

  const filteredOptions = allProviders.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatCurrency = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return "₱0.00";
    return `₱${num.toFixed(2)}`;
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const formatMovement = (movement) => {
    const num = Number(movement || 0);
    const sign = num > 0 ? "+" : "";
    return `${sign}${num.toFixed(2)}`;
  };

  const getProviderRate = (name) => {
    const { name: providerName, type } = parseSelection(name);
    const match = rateRows.find(
      (row) =>
        row.provider_name === providerName &&
        row.rate_type === type &&
        (row.status || "").toLowerCase() === "active",
    );
    if (match?.rate_per_kwh != null) return Number(match.rate_per_kwh);
    if (Object.prototype.hasOwnProperty.call(MAJOR_PROVIDERS, name)) {
      return MAJOR_PROVIDERS[name];
    }
    return DEFAULT_RATE;
  };

  const getCurrentRate = () => {
    const { name, type } = parseSelection(selected);
    return (
      rateRows.find(
        (row) =>
          row.provider_name === name &&
          row.rate_type === type &&
          (row.status || "").toLowerCase() === "active",
      ) ||
      rateRows.find(
        (row) => row.provider_name === name && row.rate_type === type,
      ) ||
      null
    );
  };

  const loadCurrentUser = async () => {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) return;

    const { data: userRow } = await supabase
      .from("users")
      .select("first_name,last_name,role,email")
      .eq("id", user.id)
      .single();

    const name =
      [userRow?.first_name, userRow?.last_name].filter(Boolean).join(" ") ||
      userRow?.email ||
      "Admin";

    setCurrentUser({ name, role: userRow?.role || "admin", id: user.id });
  };

  const fetchRates = async () => {
    setLoadingRates(true);
    try {
      const { data: ratesData, error: ratesError } = await supabase
        .from("utility_rates")
        .select("*")
        .order("provider_name", { ascending: true });
      if (ratesError) throw ratesError;

      const { data: logsData, error: logsError } = await supabase
        .from("utility_rates_logs")
        .select("*")
        .order("created_at", { ascending: false });
      if (logsError) throw logsError;

      // Fetch user details for logs manually to avoid FK issues
      const userIds = [
        ...new Set((logsData || []).map((l) => l.updated_by).filter(Boolean)),
      ];
      let usersMap = {};
      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from("users")
          .select("id, first_name, last_name, role")
          .in("id", userIds);

        if (usersData) {
          usersData.forEach((u) => {
            usersMap[u.id] = u;
          });
        }
      }

      setRateRows(ratesData || []);
      setRateLogs(
        (logsData || []).map((row) => {
          const newRate = Number(row.rate_per_kwh || 0);
          const movement = Number(row.movement || 0);
          const prevRate = newRate - movement;
          const status = (row.status || "previous").toLowerCase();

          const user = usersMap[row.updated_by];
          const updaterName = user
            ? `${user.first_name} ${user.last_name}`.trim()
            : row.updated_by === currentUser.id
              ? currentUser.name
              : "Admin";
          const updaterRole = user ? user.role : "admin";

          let providerDisplay = row.provider_name;
          if (row.rate_type && row.rate_type !== "standard") {
            providerDisplay += ` (${row.rate_type})`;
          }

          return {
            id: row.id,
            date: formatDate(row.effective_date || row.created_at),
            rawDate: row.effective_date || row.created_at,
            provider: providerDisplay,
            providerName: row.provider_name,
            rateType: row.rate_type,
            prevRate: formatCurrency(prevRate),
            newRate: formatCurrency(newRate),
            reason: row.reason || "--",
            status: status === "active" ? "Active" : "Previous",
            updatedBy: updaterName,
            role: updaterRole,
          };
        }),
      );
    } catch (error) {
      setNotification({
        show: true,
        title: "Load Failed",
        message: error.message || "Failed to load utility rates.",
        variant: "error",
        icon: "error",
      });
    } finally {
      setLoadingRates(false);
    }
  };

  useLayoutEffect(() => {
    loadCurrentUser();
    fetchRates();
  }, []);

  useEffect(() => {
    if (filteredLogs.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredLogs, totalPages, currentPage]);

const handleExport = async () => {
  setLoader({
    show: true,
    message: "Exporting Report...",
  });

  try {
    let ratesToExport = filteredLogs;

    if (exportFromDate) {
      const fromDate = new Date(exportFromDate);
      ratesToExport = ratesToExport.filter(
        (log) => new Date(log.rawDate) >= fromDate,
      );
    }

    if (exportToDate) {
      const toDate = new Date(exportToDate);
      toDate.setHours(23, 59, 59, 999);
      ratesToExport = ratesToExport.filter(
        (log) => new Date(log.rawDate) <= toDate,
      );
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Utility Rates");

      // Filter columns based on selection
      const columnsToExport = availableColumns.filter((col) =>
        selectedColumns.includes(col.key),
      );

      if (columnsToExport.length === 0) {
        throw new Error("No columns selected for export.");
      }

    // ===============================
    // TITLE SECTION
    // ===============================

      const totalCols = columnsToExport.length;
      const midPoint = Math.ceil(totalCols / 2);

      // Left Title
      worksheet.mergeCells(1, 1, 2, midPoint);
      const leftTitle = worksheet.getCell(1, 1);
      leftTitle.value = "GRIDWATCH";
      leftTitle.font = { size: 18, bold: true, color: { argb: "FFFFFFFF" } };
      leftTitle.alignment = { vertical: "middle", horizontal: "center" };
      leftTitle.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F7C2D" }, // green
      };

      // Right Title
      if (totalCols > 1) {
        worksheet.mergeCells(1, midPoint + 1, 2, totalCols);
        const rightTitle = worksheet.getCell(1, midPoint + 1);
        rightTitle.value = "UTILITY RATES";
        rightTitle.font = { size: 18, bold: true, color: { argb: "FFFFFFFF" } };
        rightTitle.alignment = { vertical: "middle", horizontal: "center" };
        rightTitle.fill = {
        type: "pattern",
        pattern: "solid",
          fgColor: { argb: "FF4F7C2D" },
      };
      } else {
        leftTitle.value = "GRIDWATCH - UTILITY RATES";
      }

    // ===============================
    // HEADER ROW
    // ===============================

    const headerRowIndex = 4;
    const headerRow = worksheet.getRow(headerRowIndex);

      columnsToExport.forEach((col, index) => {
      const cell = headerRow.getCell(index + 1);
        cell.value = col.label;
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F7C2D" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    headerRow.height = 22;

    // ===============================
    // DATA ROWS
    // ===============================

    let rowIndex = headerRowIndex + 1;

    ratesToExport.forEach((row) => {
      const excelRow = worksheet.getRow(rowIndex);

      columnsToExport.forEach((col, index) => {
        const cell = excelRow.getCell(index + 1);
        let value = row[col.key];

        if (col.key === "prevRate" || col.key === "newRate") {
          const strVal = String(value || "");
          const numVal = Number(strVal.replace(/[₱,]/g, ""));
          if (!isNaN(numVal)) {
            cell.value = numVal;
            cell.numFmt = '"₱"#,##0.00';
          } else {
            cell.value = value;
          }
        } else {
          cell.value = value;
        }

        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      rowIndex++;
    });

    // ===============================
    // COLUMN WIDTHS
    // ===============================

    const widthMap = {
      date: 18,
      provider: 28,
      prevRate: 18,
      newRate: 18,
      reason: 35,
      status: 15,
      updatedBy: 22,
    };

    worksheet.columns = columnsToExport.map((col) => ({
      width: widthMap[col.key] || 20,
    }));

    // ===============================
    // EXPORT FILE
    // ===============================

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
      blob,
      `GRIDWATCH_UTILITY_RATES_${new Date()
        .toISOString()
        .split("T")[0]}.xlsx`,
    );

    setLoader({ show: false, message: "Processing..." });

    setNotification({
      show: true,
      title: "Export Successful",
      message: `Successfully exported ${ratesToExport.length} rate records.`,
      variant: "success",
      icon: "check_circle",
    });

    setShowExportModal(false);
    setExportFromDate("");
    setExportToDate("");
  } catch (error) {
    setLoader({ show: false, message: "Processing..." });

    setNotification({
      show: true,
      title: "Export Failed",
      message: error.message || "Failed to export Excel file.",
      variant: "error",
      icon: "error",
    });
  }
};

  const handleSelect = (option) => {
    setSelected(option);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleUpdate = async () => {
    if (!electricityRate || electricityRate.trim() === "") {
      setNotification({
        show: true,
        title: "Missing Inputs",
        message: "Please enter an electricity rate.",
        variant: "warning",
        icon: "warning",
      });
      return;
    }

    if (!description || description.trim() === "") {
      setNotification({
        show: true,
        title: "Missing Inputs",
        message: "Please enter a description.",
        variant: "warning",
        icon: "warning",
      });
      return;
    }

    if (isNaN(electricityRate) || Number(electricityRate) <= 0) {
      setNotification({
        show: true,
        title: "Validation Error",
        message:
          "Please enter a valid positive number for the electricity rate.",
        variant: "error",
        icon: "error",
      });
      return;
    }

    setLoader({
      show: true,
      message: "Updating Rate...",
    });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { name: providerName, type: rateType } = parseSelection(selected);

      const newRate = Number(electricityRate);
      const currentRate = getCurrentRate();
      const prevRate =
        currentRate?.rate_per_kwh != null
          ? Number(currentRate.rate_per_kwh)
          : null;
      const movement = prevRate != null ? newRate - prevRate : 0;
      const effectiveDate = new Date().toISOString();

      const payload = {
        provider_name: providerName,
        rate_per_kwh: newRate,
        effective_date: effectiveDate,
        movement,
        reason: description,
        status: "active",
        updated_by: user.id,
        rate_type: rateType,
      };

      const { data: updatedRows, error: updateError } = await supabase
        .from("utility_rates")
        .update(payload)
        .eq("provider_name", providerName)
        .eq("rate_type", rateType)
        .select();

      if (updateError) throw updateError;

      if (!updatedRows || updatedRows.length === 0) {
        const { error: insertError } = await supabase
          .from("utility_rates")
          .insert(payload);
        if (insertError) throw insertError;
      }

      await supabase
        .from("utility_rates_logs")
        .update({ status: "previous" })
        .eq("provider_name", providerName)
        .eq("rate_type", rateType)
        .eq("status", "active");

      const { error: logError } = await supabase
        .from("utility_rates_logs")
        .insert(payload);
      if (logError) throw logError;

      setLoader({ show: false, message: "Processing..." });

      setNotification({
        show: true,
        title: "Electricity Rate Updated",
        message: "The electricity rate has been updated successfully.",
        variant: "success",
        icon: "check_circle",
      });

      setShowModal(false);
      setElectricityRate("");
      setDescription("");
      fetchRates();
    } catch (error) {
      setLoader({ show: false, message: "Processing..." });
      setNotification({
        show: true,
        title: "Update Failed",
        message: error.message,
        variant: "error",
        icon: "error",
      });
    }
  };

  const currentRate = getCurrentRate();
  const currentRateValue =
    currentRate?.rate_per_kwh != null
      ? Number(currentRate.rate_per_kwh)
      : getProviderRate(selected);
  const currentMovement = Number(currentRate?.movement || 0);
  const movementClass = currentMovement >= 0 ? "rd-val red" : "rd-val green";
  const displayRate = formatCurrency(currentRateValue).replace("₱", "₱ ");
  const displayDate =
    currentRate?.effective_date || currentRate?.created_at || "";

  return (
    <>
      <PopupNotification
        show={notification.show}
        title={notification.title}
        message={notification.message}
        variant={notification.variant}
        icon={notification.icon}
        duration={3000}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />
      <LoadingPopup
        show={loader.show}
        message={loader.message}
        Loader={PuffLoader}
        color="#ffd700"
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
        <div className="rates-container">
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
                style={{ color: "#FFf", fontSize: "20px" }}
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
                                    Rate: ₱ {getProviderRate(name).toFixed(2)} /
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
                                    Rate: ₱ {getProviderRate(name).toFixed(2)} /
                                    kWh
                                  </div>
                                </div>
                              </div>

                              {isSelected && <div className="checkmark">✔</div>}
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

            <div style={{ margin: "25px 0" }}>
              <div className="rate-main">{displayRate}</div>
              <div style={{ color: "#888", fontSize: "14px" }}>per kWh</div>
            </div>

            <div className="rate-details">
              <div>
                <div className="rd-label">Effective Date</div>
                <div className="rd-val">
                  {displayDate ? formatDate(displayDate) : "--"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="rd-label">Movement</div>
                <div className={movementClass}>
                  {formatMovement(currentMovement)}
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => {
                setElectricityRate(currentRateValue.toString());
                setDescription("");
                setShowModal(true);
              }}
            >
              Update Rate
            </button>
          </div>

          <div className="table-container">
            <div className="table-container-scrollable">
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
                  {loadingRates ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          textAlign: "center",
                          padding: "24px",
                          color: "#666",
                        }}
                      >
                        No rate logs found for {selected}.
                      </td>
                    </tr>
                  ) : paginatedRates.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          textAlign: "center",
                          padding: "24px",
                          color: "#666",
                        }}
                      >
                        No rate logs found for {selected}.
                      </td>
                    </tr>
                  ) : (
                    paginatedRates.map((rate) => {
                      const isIncrease =
                        parseFloat(rate.newRate.replace(/[^\d.-]/g, "")) >
                        parseFloat(rate.prevRate.replace(/[^\d.-]/g, ""));
                      return (
                        <tr key={rate.id}>
                          <td style={{ color: "#ddd", fontWeight: 400 }}>
                            {rate.date}
                          </td>
                          <td>{rate.provider}</td>
                          <td>
                            <div className="rate-change-cell">
                              <span className="rate-pill">{rate.prevRate}</span>
                              <span
                                style={{
                                  color: "#666",
                                  fontSize: "12px",
                                  margin: "0 4px",
                                }}
                              >
                                →
                              </span>
                              <span
                                className={`rate-pill ${isIncrease ? "rate-up" : "rate-down"}`}
                              >
                                {rate.newRate}
                              </span>
                            </div>
                          </td>
                          <td>{rate.reason}</td>
                          <td>
                            <span
                              className={`stat-badge ${rate.status === "Active" ? "stat-active" : "stat-review"}`}
                            >
                              {rate.status}
                            </span>
                          </td>
                          <td>
                            <div className="admin-meta">
                              <div
                                className="user-avatar"
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  fontSize: "10px",
                                  background:
                                    rate.role === "super admin"
                                      ? "#ffd700"
                                      : "#0055ff",
                                }}
                              >
                                {rate.role === "super admin" ? "SA" : "AD"}
                              </div>
                              {rate.updatedBy}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {filteredLogs.length > 0 && (
              <div className="a-pagination">
                <div style={{ fontSize: "14px", color: "#666" }}>
                  {filteredLogs.length === 0 ? (
                    "Showing 0–0 of 0"
                  ) : (
                    <>
                      Showing {(currentPage - 1) * itemsPerPage + 1}
                      {"–"}
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredLogs.length,
                      )}{" "}
                      of {filteredLogs.length}
                    </>
                  )}
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

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
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
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    style={{
                      opacity: currentPage === totalPages ? 0.4 : 1,
                      cursor:
                        currentPage === totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    {">"}
                  </button>
                </div>
              </div>
            )}
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
                value={selected}
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
              <button
                onClick={handleUpdate}
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
      {showExportModal && (
        <div
          className="export-backdrop"
          onClick={() => setShowExportModal(false)}
        >
          <div
            style={{
              backgroundColor: "#0F0F0F",
              borderRadius: "12px",
              border: "1px solid #333333",
              padding: "20px",
              maxWidth: "420px",
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
                style={{
                  fontSize: "15.5px",
                  fontWeight: "600",
                  color: "#fff",
                  marginTop: "10px",
                }}
              >
                Export CSV File
              </span>
              <span style={{ fontSize: "12px", color: "#aaa" }}>
                Select a date range to filter rates by date (optional)
              </span>
            </div>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: "12px",
                      color: "#888",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    From Date
                  </label>
                  <CalendarDropdown
                    value={exportFromDate}
                    onChange={setExportFromDate}
                    placeholder="MM/DD/YY"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: "12px",
                      color: "#888",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    To Date
                  </label>
                  <CalendarDropdown
                    value={exportToDate}
                    onChange={setExportToDate}
                    placeholder="MM/DD/YY"
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: "15px", textAlign: "left" }}>
              <label
                style={{
                  fontSize: "12px",
                  color: "#888",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Select Columns
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  maxHeight: "150px",
                  overflowY: "auto",
                  background: "#1a1a1a",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #333",
                }}
              >
                {availableColumns.map((col) => (
                  <label
                    key={col.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      color: "#ccc",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col.key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedColumns([...selectedColumns, col.key]);
                        } else {
                          setSelectedColumns(
                            selectedColumns.filter((key) => key !== col.key),
                          );
                        }
                      }}
                      style={{
                        accentColor: "#00A651",
                        width: "14px",
                        height: "14px",
                      }}
                    />
                    {col.label}
                  </label>
                ))}
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
                  transition: "0.2s",
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
                  transition: "0.2s",
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
