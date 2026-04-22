import { useState } from "react";

export default function CityList({ cities, onDelete, onUpdate, onSelect }) {
  const [editId, setEditId]     = useState(null);
  const [editName, setEditName] = useState("");

  const startEdit = (city) => {
    setEditId(city._id);
    setEditName(city.name);
  };

  const submitEdit = (id) => {
    if (editName.trim()) onUpdate(id, editName.trim());
    setEditId(null);
  };

  if (cities.length === 0)
    return <p className="empty">No saved cities yet.</p>;

  return (
    <div className="card city-list">
      <h3>Saved Cities</h3>
      <ul>
        {cities.map((city) => (
          <li key={city._id}>
            {editId === city._id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitEdit(city._id)}
                  autoFocus
                />
                <button onClick={() => submitEdit(city._id)}>✔</button>
                <button onClick={() => setEditId(null)}>✖</button>
              </>
            ) : (
              <>
                <span
                  className="city-name"
                  onClick={() => onSelect(city)}
                  title="Click to view on map"
                >
                  {city.name}
                </span>
                <button onClick={() => startEdit(city)}>✏️</button>
                <button onClick={() => onDelete(city._id)} className="btn-del">
                  🗑️
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
