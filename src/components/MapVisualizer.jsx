import { useEffect, useState, memo } from 'react';
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

// 1. Static Edges Layer - Renders only when graph changes
const StaticEdges = memo(({ graph }) => {
    return (
      <>
        {Object.values(graph).map(node => (
            Object.entries(node.neighbors).map(([neighborId, weight]) => {
            const neighbor = graph[neighborId];
            if (!neighbor) return null;
            // Key needs to be unique but consistent. Sort IDs? 
            // Actually, we render both directions (u->v and v->u). It's fine for visualization opacity.
            return (
                <Polyline 
                key={`${node.id}-${neighborId}`}
                positions={[[node.lat, node.lng], [neighbor.lat, neighbor.lng]]}
                pathOptions={{ color: 'gray', weight: 1, opacity: 0.3 }}
                />
            );
            })
        ))}
      </>
    );
}, (prev, next) => prev.graph === next.graph); // Custom comparison if needed, but strict equality of ref should suffice if immutable

// 2. Dynamic Visited Nodes Layer - Renders when visitedNodes changes
const VisitedNodesLayer = memo(({ visitedNodes, graph }) => {
    if (!visitedNodes || visitedNodes.length === 0) return null;

    return (
        <>
            {visitedNodes.map(id => {
                const node = graph[id];
                if (!node) return null;
                return (
                    <CircleMarker
                        key={id}
                        center={[node.lat, node.lng]}
                        radius={2} // Small blue dots
                        pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.6, weight: 0 }}
                    />
                );
            })}
        </>
    );
});

// 3. Path Layer - Renders when path changes
const PathLayer = memo(({ path, graph }) => {
    if (!path || path.length === 0) return null;
    
    // Draw edges for path
    const positions = path.map(id => {
        const n = graph[id];
        return n ? [n.lat, n.lng] : null;
    }).filter(p => p !== null);

    return (
        <Polyline
            positions={positions}
            pathOptions={{ color: 'yellow', weight: 5, opacity: 0.9 }}
        />
    );
});

// 4. Interaction Points (Source/Dest) - Always distinct
const ControlPoints = ({ source, destination, graph, radius, onNodeClick }) => {
    return (
        <>
             {/* Source */}
             {source && graph[source] && (
                 <>
                    <CircleMarker
                        center={[graph[source].lat, graph[source].lng]}
                        radius={8}
                        pathOptions={{ color: "green", fillColor: "green", fillOpacity: 1 }}
                        eventHandlers={{ click: (e) => { L.DomEvent.stopPropagation(e); onNodeClick(source); }}}
                    >
                         <Popup>Source: {source}</Popup>
                    </CircleMarker>
                    <Circle 
                        center={[graph[source].lat, graph[source].lng]}
                        radius={radius}
                        pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.05, weight: 1, dashArray: '5, 5' }}
                        interactive={false}
                    />
                 </>
             )}
             
             {/* Destination */}
             {destination && graph[destination] && (
                 <CircleMarker
                    center={[graph[destination].lat, graph[destination].lng]}
                    radius={8}
                    pathOptions={{ color: "red", fillColor: "red", fillOpacity: 1 }}
                    eventHandlers={{ click: (e) => { L.DomEvent.stopPropagation(e); onNodeClick(destination); }}}
                >
                     <Popup>Destination: {destination}</Popup>
                </CircleMarker>
             )}
        </>
    );
};

// Helper to resize map when container dimension changes
const MapResizer = ({ isExpanded }) => {
  const map = useMap();
  
  useEffect(() => {
    // Wait for transition to finish roughly (or trigger immediately and repeatedly)
    // The layout transition is 500ms. We should check a few times or use ResizeObserver.
    // Ideally, ResizeObserver on container, but pure hook approach:
    const timeoutId = setTimeout(() => {
        map.invalidateSize();
    }, 550); // Just after transition

    // Also trigger immediately just in case
    map.invalidateSize();

    return () => clearTimeout(timeoutId);
  }, [map, isExpanded]);

  return null;
};

const MapVisualizer = ({ 
  graph, 
  source, 
  destination, 
  path, 
  visitedNodes, 
  radius, 
  isExpanded,
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
      
      <MapResizer isExpanded={isExpanded} />
      <MapEvents onMapClick={onMapClick} />

      <StaticEdges graph={graph} />
      <VisitedNodesLayer visitedNodes={visitedNodes} graph={graph} />
      <PathLayer path={path} graph={graph} />
      
      <ControlPoints 
        source={source} 
        destination={destination} 
        graph={graph} 
        radius={radius} 
        onNodeClick={onNodeClick} 
      />

    </MapContainer>
  );
};

export default MapVisualizer;
