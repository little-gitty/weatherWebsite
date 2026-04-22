export default function WeatherCard({ weather, onSave }) {
  if (!weather) return null;

  return (
    <div className="card weather-card">
      <h2>{weather.city}</h2>
      <p className="temp">{weather.temperature}°C</p>
      <p className="desc">{weather.description}</p>
      <p className="coords">
        📍 {weather.lat}, {weather.lon}
      </p>
      <button onClick={onSave} className="btn-save">
        💾 Save City
      </button>
    </div>
  );
}
