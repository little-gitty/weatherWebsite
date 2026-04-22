import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SearchBar  from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import MapView    from "./components/MapView";
import CityList   from "./components/CityList";
import Login from "./components/Login";
import Register from "./components/Register";
import "./App.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  const [weather, setWeather] = useState(null);
  const [cities,  setCities]  = useState([]);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [mapCoords, setMapCoords] = useState({ lat: null, lon: null });

  // ── Check for existing session ────────────────────────────
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    const savedUserId = localStorage.getItem("userId");
    if (savedUser && savedUserId) {
      setCurrentUser(savedUser);
      setUserId(savedUserId);
      setIsLoggedIn(true);
    }
  }, []);

  // ── Handle login ──────────────────────────────────────────
  const handleLoginSuccess = (newUserId, username) => {
    localStorage.setItem("currentUser", username);
    localStorage.setItem("userId", newUserId);
    setCurrentUser(username);
    setUserId(newUserId);
    setIsLoggedIn(true);
  };

  // ── Handle register & auto-login ──────────────────────────
  const handleRegisterSuccess = (newUserId, username) => {
    localStorage.setItem("currentUser", username);
    localStorage.setItem("userId", newUserId);
    setCurrentUser(username);
    setUserId(newUserId);
    setIsLoggedIn(true);
  };

  // ── Handle logout ─────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    setUserId(null);
    setIsLoggedIn(false);
    setShowRegister(false);
  };

  // ── Fetch saved cities on mount ───────────────────────────
  const fetchCities = useCallback(async () => {
    if (!userId) return;
    const { data } = await axios.get(`/api/cities/${userId}`);
    setCities(data);
  }, [userId]);

  useEffect(() => { 
    if (isLoggedIn) {
      fetchCities();
    }
  }, [isLoggedIn, fetchCities]);

  // ── Weather search ────────────────────────────────────────
  const handleSearch = async (city) => {
    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const { data } = await axios.get(`/api/weather/${encodeURIComponent(city)}`);
      setWeather(data);
      setMapCoords({ lat: data.lat, lon: data.lon });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Save city ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!weather) return;
    try {
      await axios.post("/api/cities", {
        userId,
        name: weather.city,
        lat:  weather.lat,
        lon:  weather.lon,
      });
      fetchCities();
    } catch {
      setError("Failed to save city.");
    }
  };

  // ── Delete city ───────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/cities/${id}`);
      fetchCities();
    } catch {
      setError("Failed to delete city.");
    }
  };

  // ── Update city name ──────────────────────────────────────
  const handleUpdate = async (id, name) => {
    try {
      await axios.put(`/api/cities/${id}`, { name });
      fetchCities();
    } catch {
      setError("Failed to update city.");
    }
  };

  // ── Select saved city → show on map & fetch weather ────────
  const handleSelect = (city) => {
    setMapCoords({ lat: city.lat, lon: city.lon });
    handleSearch(city.name);
  };

  return (
    <>
      {!isLoggedIn ? (
        <>
          {showRegister ? (
            <div>
              <Register onRegisterSuccess={handleRegisterSuccess} />
              <div className="auth-toggle">
                <p>Already have an account? <span onClick={() => setShowRegister(false)}>Sign In</span></p>
              </div>
            </div>
          ) : (
            <div>
              <Login onLoginSuccess={handleLoginSuccess} />
              <div className="auth-toggle">
                <p>Don't have an account? <span onClick={() => setShowRegister(true)}>Register</span></p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="app">
          <div className="app-header">
            <h1>🌤 Weather & Map</h1>
            <div className="user-section">
              <span className="username">Welcome, {currentUser}!</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>

          <SearchBar onSearch={handleSearch} loading={loading} />

          {error && <p className="error">{error}</p>}

          <WeatherCard weather={weather} onSave={handleSave} />

          <MapView lat={mapCoords.lat} lon={mapCoords.lon} />

          <CityList
            cities={cities}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onSelect={handleSelect}
          />
        </div>
      )}
    </>
  );
}
