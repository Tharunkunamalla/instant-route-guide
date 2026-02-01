import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => onMapClick(e),
  });
  return null;
};

const MapVisualizer = ({ 
  graph, 
  source, 
  destination, 
  path, 
  visitedNodes, 
  radius, 
  onNodeClick, 
  onMapClick 
}) => {
  const center = [17.4474, 78.3762]; // Default center (Hyderabad approx)
  const zoom = 13;

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={true} 
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapEvents onMapClick={onMapClick} />

      {/* Render Edges */}
      {Object.values(graph).map(node => (
        Object.entries(node.neighbors).map(([neighborId, weight]) => {
          const neighbor = graph[neighborId];
          if (!neighbor) return null;
          return (
            <Polyline 
              key={`${node.id}-${neighborId}`}
              positions={[[node.lat, node.lng], [neighbor.lat, neighbor.lng]]}
              pathOptions={{ color: 'gray', weight: 1, opacity: 0.3 }}
            />
          );
        })
      ))}

      {/* Render Nodes - Only visited/relevant ones */}
      {Object.values(graph).map(node => {
        const isSource = String(node.id) === String(source);
        const isDest = String(node.id) === String(destination);
        const isVisited = visitedNodes?.includes(String(node.id));
        const isPath = path?.includes(String(node.id));

        if (!isSource && !isDest && !isVisited && !isPath) return null;

        let color = "blue";
        let radiusSize = 5;

        if (isSource) {
            color = "green";
            radiusSize = 8;
        } else if (isDest) {
            color = "red";
            radiusSize = 8;
        } else if (isPath) {
            color = "yellow";
        } else if (isVisited) {
            color = "blue"; // Visualization color for visited
        }

        return (
          <CircleMarker
            key={node.id}
            center={[node.lat, node.lng]}
            radius={radiusSize}
            pathOptions={{ color: color, fillColor: color, fillOpacity: 0.8 }}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                onNodeClick(node.id);
              },
            }}
          >
            <Popup>
              Node: {node.id}
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Render Path */}
      {path && path.length > 0 && (
        <Polyline
          positions={path.map(id => [graph[id].lat, graph[id].lng])}
          pathOptions={{ color: 'yellow', weight: 4 }}
        />
      )}

       {/* Render Radius Circle if Source Selected */}
       {source && radius && graph[source] && (
         <CircleMarker 
            center={[graph[source].lat, graph[source].lng]}
            radius={0} // Invisible marker for logic, but we want a real circle. Use Circle component.
         />
       )}
       {source && radius && graph[source] && (
            <Circle 
                center={[graph[source].lat, graph[source].lng]}
                radius={radius}
                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
            />
       )}

    </MapContainer>
  );
};

export default MapVisualizer;
