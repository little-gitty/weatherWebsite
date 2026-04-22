export default function MapView({ lat, lon }) {
  if (lat == null || lon == null) return null;

  const src = `https://www.google.com/maps?q=${lat},${lon}&z=14&output=embed`;

  return (
    <div className="map-container">
      <iframe
        title="map"
        src={src}
        width="100%"
        height="350"
        style={{ border: 0, borderRadius: "8px" }}
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
