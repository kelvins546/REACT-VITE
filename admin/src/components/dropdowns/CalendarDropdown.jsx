import React, { useState, useRef, useEffect } from "react";
import "./calendarDropdown.css";

const CalendarDropdown = ({ value, onChange, placeholder = "Select Date" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value) : new Date(),
  );
  const dropdownRef = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
  };

  const parseFormattedDate = (formatted) => {
    const parts = formatted.split("/");
    if (parts.length !== 3) return "";
    const [month, day, year] = parts;
    const fullYear =
      parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year);
    return `${fullYear}-${month}-${day}`;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const handleSelectDay = (day) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const date = String(day).padStart(2, "0");

    const localDate = `${year}-${month}-${date}`;
    onChange(localDate);
    setIsOpen(false);
  };

  useEffect(() => {
    if (value) {
      setCurrentMonth(new Date(value));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const monthYear = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!value) return false;
    const selected = new Date(value);
    return (
      day === selected.getDate() &&
      currentMonth.getMonth() === selected.getMonth() &&
      currentMonth.getFullYear() === selected.getFullYear()
    );
  };

  return (
    <div className="calendar-dropdown-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="calendar-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="material-icons calendar-icon">calendar_today</span>
        <span className="calendar-display-value">
          {value ? formatDate(value) : placeholder}
        </span>
      </button>

      {isOpen && (
        <div className="calendar-dropdown-menu">
          <div className="calendar-container">
            <div className="calendar-header">
              <button
                type="button"
                className="calendar-nav-btn"
                onClick={handlePrevMonth}
              >
                <span className="material-icons">chevron_left</span>
              </button>
              <div className="calendar-title">{monthYear}</div>
              <button
                type="button"
                className="calendar-nav-btn"
                onClick={handleNextMonth}
              >
                <span className="material-icons">chevron_right</span>
              </button>
            </div>

            <div className="calendar-weekdays">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="calendar-weekday">
                  {day}
                </div>
              ))}
            </div>

            <div className="calendar-days">
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`calendar-day ${
                    day === null ? "calendar-day-empty" : ""
                  } ${day && isToday(day) ? "calendar-day-today" : ""} ${
                    day && isSelected(day) ? "calendar-day-selected" : ""
                  }`}
                  onClick={() => day && handleSelectDay(day)}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="calendar-footer">
              <button
                type="button"
                className="calendar-btn-clear"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
              >
                Clear
              </button>
              <button
                type="button"
                className="calendar-btn-today"
                onClick={() => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, "0");
                  const day = String(today.getDate()).padStart(2, "0");

                  const localToday = `${year}-${month}-${day}`;

                  onChange(localToday);
                  setCurrentMonth(new Date());
                  setIsOpen(false);
                }}
              >
                Today
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarDropdown;
