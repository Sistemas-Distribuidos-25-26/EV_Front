import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ChargingPoint from "./ChargingPoint.jsx";
import RequestWidget from "./RequestWidget.jsx";

function App() {
    const [chargingPoints, setChargingPoints] = useState({collection: []});
    const [requests, setRequests] = useState({data: []})
    const [log, setLog] = useState({message: ""});
    const [search, setSearch] = useState("");

    const handleChargingPointClick = (id, newState) => {
        fetch(`http://localhost:9999/cp/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ state: newState }),
        })
            .then(response => {
                if (!response.ok) throw new Error("Error updating charging point");
                return response.json();
            })
            .then(updatedCP => {
                setChargingPoints(prev => ({
                    ...prev,
                    collection: prev.collection.map(cp =>
                        cp.id === id ? { ...cp, state: updatedCP.state } : cp
                    )
                }));
            })
            .catch(error => {
                console.error("Error updating charging point:", error);
            });
    };

    useEffect(() => {
        const fetchData = () => {
            fetch("http://localhost:9999/cp/all")
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        setChargingPoints(data);
                    }
                })
                .catch(error => {
                    console.error("Error fetching charging points:", error);
                });
            fetch("http://localhost:9999/requests")
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        setRequests(data);
                    }
                })
                .catch(error => {
                    console.error("Error fetching requests:", error);
                })
            fetch("http://localhost:9999/log?limit=35")
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        setLog(data);
                    }
                })
                .catch(error => {
                    console.error("Error fetching log:", error);
                })
        };
        fetchData();
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, []);

  return (
    <div id="main_div">
        <header style={{display: "fixed", top: 0, backgroundColor: "#023e8a"}}>
            <h1>EV_Central Monitor</h1>
            <input type="text" placeholder="Buscar punto de carga..." value={search} onChange={e => setSearch(e.target.value)} />
        </header>
        <div style={{width:"80vw",display: "flex", flexDirection: "row"}}>
            <aside id="widget-panel" >
                <div id="general-controls">
                    <button id="disable-all-button" onClick={() => {
                        chargingPoints.collection.forEach(cp => {
                            handleChargingPointClick(cp.id, "FUERA DE SERVICIO");
                        })
                    }}>
                        Desactivar todos
                    </button>
                    <button id="enable-all-button" onClick={() => {
                        chargingPoints.collection.forEach(cp => {
                            handleChargingPointClick(cp.id, "ACTIVO");
                        })
                    }}>
                        Activar todos
                    </button>
                </div>
                {
                    chargingPoints.collection.filter(cp => cp.id.toString().toLowerCase().includes(search.toLowerCase())).map(cp =>
                        <div>
                            <ChargingPoint
                                key={cp.id}
                                cp_id={cp.id}
                                cp_state={cp.state}
                                price={cp.price}
                                visible={false}
                                onClick={() => handleChargingPointClick(cp.id, cp.state === "ACTIVO" ? "FUERA DE SERVICIO" : "ACTIVO" )}
                            />
                        </div>
                    )
                }
            </aside>
            <MapContainer id="map" center={[38.5, -0.4038]} zoom={9} >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LayerGroup>

                    {false && markers.map((position, idx) => (
                        <Marker key={idx} position={position} />
                    ))}
                </LayerGroup>
            </MapContainer>
            <aside id="control-panel">
                <h2>Peticiones en curso</h2>
                <hr/>
                <table>
                    <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>DriverID</th>
                        <th>CP</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        requests.data.map(row => (
                            <RequestWidget key={row[0] + "#" + row[1]} req_timestamp={row[0]} driver={row[1]} cp_id={row[2]}/>
                        ))
                    }
                    </tbody>
                </table>
                <h2>Mensajes internos</h2>
                <hr/>
                <pre id="log_panel">{log.message}</pre>
            </aside>
        </div>
    </div>
  )
}

export default App
