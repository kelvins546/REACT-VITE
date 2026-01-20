import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import '../../styles/stat_pills.css';
import '../../components/dropdowns/searchableDropdown.css';
import meralcoLogo from '../../assets/electricityProviders/MERALCO.png';
import vecoLogo from '../../assets/electricityProviders/DAVAO LIGHT.png';
import dlpcLogo from '../../assets/electricityProviders/VECO.png';
import { supabase } from "../../supabaseClient";

const Dashboard = () => {
  const [showMonthlyTrend, setshowMonthlyTrend] = useState(false);
  const [showYearlyTrend, setshowYearlyTrend] = useState(true);
  const [showTrendStatsMonthly, setshowTrendStatsMonthly] = useState(false);
  const [showTrendStatYearly, setshowTrendStatsYearly] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('Meralco');
  
  const [totalUsers, setTotalUsers] = useState(0);
  const [previousMonthUsers, setPreviousMonthUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResidentUsers();
  }, []);

  const fetchResidentUsers = async () => {
    try {
      setLoading(true);
      
      const { data, count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'resident');

      if (error) {
        console.error('Query error:', error);
        throw error;
      }

      console.log('Resident count:', count);
      setTotalUsers(count || 0);
      setPreviousMonthUsers(Math.floor((count || 0) )); // brokken logic
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching resident users:', error);
      try {
        const { count: allCount, error: allError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        if (!allError) {
          console.log('Total users (all roles):', allCount);
          setTotalUsers(allCount || 0);
          setPreviousMonthUsers(Math.floor((allCount || 0) * 0.89));
        }
      } catch (e) {
        console.error('Fallback query also failed:', e);
      }
      setLoading(false);
    }
  };

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

  const handleSelect = (option) => {
    setSelected(option);
    setSearchTerm('');
    setIsOpen(false);
  };

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

      <div className="stats-grid">
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
          <div className="sc-val">{loading ? "..." : totalUsers.toLocaleString()}</div>
          <div className="sc-sub text-primary">
            {loading ? "Loading..." : `+${((totalUsers - previousMonthUsers) / previousMonthUsers * 100).toFixed(1)}% vs last month`}
          </div>
        </div>

        {/* <div className="stat-card">
          <div className="sc-label">
            <span
              className="material-icons text-warning"
              style={{ fontSize: "20px" }}
            >
              support_agent
            </span>
            Pending Complaints
          </div>
          <div className="sc-val">15</div>
          <div className="sc-sub">+4 New in last 3 hours</div>
        </div> */}

        {/* <div className="stat-card">
          <div className="sc-label">
            <span
              className="material-icons text-danger"
              style={{ fontSize: "20px" }}
            >
              warning
            </span>
            Critical Faults
          </div>
          <div className="sc-val text-danger">3</div>
          <div className="sc-sub">1 reported recently</div>
        </div> */}

        <div className="stat-card">
          <div className="sc-label">
            <span
              className="material-icons text-primary"
              style={{ fontSize: "20px" }}
            >
              bolt
            </span>
            Total Load
          </div>
          <div className="sc-val">45.2 kW</div>
          <div className="sc-sub">Peak today: 58.1 kW</div>
        </div>

        <div className="stat-card">
          <div className="sc-label">
            <span
              className="material-icons text-success"
              style={{ fontSize: "20px" }}
            >
              check_circle
            </span>
            System Uptime
          </div>
          <div className="sc-val">99.8%</div>
          <div className="sc-sub text-primary">Last 30 days</div>
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
            <div className={`tt-opt ${showMonthlyTrend === true ? 'active' : ''}`} onClick={() => setshowMonthlyTrend(true) & setshowYearlyTrend(false) & setshowTrendStatsMonthly(true) & setshowTrendStatsYearly(false)}>Monthly</div>
            <div className={`tt-opt ${showYearlyTrend === true ? 'active' : ''}`} onClick={() => setshowYearlyTrend(true) & setshowMonthlyTrend(false) & setshowTrendStatsYearly(true) & setshowTrendStatsMonthly(false)}>Yearly</div>
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
              <div className="dropdown-menu rates" style={{ width: "100%", maxWidth: "300px" }}>
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
                            {isSelected && <span className="checkmark material-symbols-outlined">check</span>}
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
                            {isSelected && <span className="checkmark material-symbols-outlined">check</span>}
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
    </>
  );
};

export default Dashboard;
