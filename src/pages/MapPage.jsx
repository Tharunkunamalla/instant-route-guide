import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, Loader2, Search, Play, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import MapVisualizer from "@/components/MapVisualizer";
import { dijkstra } from "@/algorithms/dijkstra";
import { astar } from "@/algorithms/astar";
import { bfs } from "@/algorithms/bfs";

import { fetchRoadNetwork, buildGraphFromOSM, findNearestNode } from "@/lib/osm";

const MapPage = () => {
  const [graph, setGraph] = useState({});
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [algorithm, setAlgorithm] = useState("Dijkstra");
  const [speed, setSpeed] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [path, setPath] = useState([]);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const RADIUS_METERS = 2000; // Match OSM fetch radius roughly

  const handleMapClick = async (e) => {
      const { lat, lng } = e.latlng;

      if (source !== null && destination === null) {
          // Validate Bounds: Check distance from Source
          // Graph is generated around Source within RADIUS_METERS
          const sourceNode = graph[source];
          if (sourceNode) {
              const R = 6371e3; // metres
              const φ1 = sourceNode.lat * Math.PI/180;
              const φ2 = lat * Math.PI/180;
              const Δφ = (lat - sourceNode.lat) * Math.PI/180;
              const Δλ = (lng - sourceNode.lng) * Math.PI/180;

              const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                        Math.cos(φ1) * Math.cos(φ2) *
                        Math.sin(Δλ/2) * Math.sin(Δλ/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              const d = R * c;

              if (d > RADIUS_METERS * 1.05) { // 5% buffer
                   toast({ 
                       title: "Out of Bounds", 
                       description: `'Destination is too far. Please select within the radius circle.'`, 
                       variant: "destructive" 
                   });
                   return;
              }
          }

          // Setting Destination
          const nearest = findNearestNode(lat, lng, graph);
          if (nearest && nearest.nodeId) {
             setDestination(String(nearest.nodeId));
             toast({ title: "Destination Selected", description: `Node set. Ready to visualize.` });
          } else {
             toast({ title: "Error", description: "Click closer to a road.", variant: "destructive" });
          }
          return;
      }
      
      if (source !== null) return; // Map already set up
      
      setIsGraphLoading(true);
      
      try {
          toast({ title: "Fetching Map Data...", description: "Loading road network from OpenStreetMap..." });
          
          const osmData = await fetchRoadNetwork(lat, lng, RADIUS_METERS);
          
          if (!osmData) {
               setIsGraphLoading(false);
               return; // Error handled in fetch
          }

          const newGraph = buildGraphFromOSM(osmData);
          
          if (Object.keys(newGraph).length === 0) {
              toast({ title: "No Roads Found", description: "Could not find any roads in this area. Try a different location.", variant: "destructive" });
              setIsGraphLoading(false);
              return;
          }

          setGraph(newGraph);
          
          // Find nearest node to click for Source
          const nearest = findNearestNode(lat, lng, newGraph);
          
          if (nearest && nearest.nodeId) {
             setSource(String(nearest.nodeId));
             toast({ title: "Source Point Set", description: `Map loaded with ${Object.keys(newGraph).length} road nodes.` });
             
             // Update Footer Region
             const region = Math.random() > 0.5 ? "Telangana (Hyd)" : "Kerala (Kochi)";
             window.dispatchEvent(new CustomEvent('region-update', { detail: region }));
          } else {
             toast({ title: "Error", description: "No valid node found near click.", variant: "destructive" });
          }

      } catch (err) {
          console.error(err);
          toast({ title: "Error", description: "An unexpected error occurred building the graph.", variant: "destructive" });
      } finally {
          setIsGraphLoading(false);
      }
  };

  const handleNodeClick = (nodeId) => {
     // Optional: Keep for direct node clicks if visible
  };

  const handleReset = () => {
    setGraph({});
    setSource(null);
    setDestination(null);
    setPath([]);
    setVisitedNodes([]);
    setRouteInfo(null);
    toast({ title: "Reset", description: "Map cleared. Click to set new source." });
  };

  // Speed Ref for dynamic updates inside animation loop
  const speedRef = useRef(speed);
  useEffect(() => {
     speedRef.current = speed;
  }, [speed]);

  const animate = async (visited, finalPath, onComplete) => {
    setIsLoading(true);
    setVisitedNodes([]);
    setPath([]);
    
    let i = 0;
    
    const step = () => {
        if (i >= visited.length) {
            setPath(finalPath);
            setIsLoading(false);
            if (onComplete) onComplete();
            return;
        }

        const currentDelay = speedRef.current;
        
        // If delay is 0 (Fastest), we need to batch heavily to process thousands of nodes quickly.
        // If delay is > 0, we can process one by one or small batches.
        let batchSize = 1;
        
        if (currentDelay === 0) {
            // Very fast mode - render 50 nodes per frame
            batchSize = 50; 
        } else if (currentDelay <= 5) {
            // Fast mode
            batchSize = 5;
        } 
        
        const batch = [];
        for (let j = 0; j < batchSize && i < visited.length; j++) {
            batch.push(visited[i]);
            i++;
        }

        setVisitedNodes(prev => [...prev, ...batch]);
        
        // Use currentDelay directly as the timeout ms
        setTimeout(() => {
            requestAnimationFrame(step);
        }, currentDelay);
    };

    step();
  };

  const calculateRoute = () => {
    if (source === null || destination === null) {
       toast({ title: "Error", description: "Select source and destination", variant: "destructive" });
       return;
    }

    let result;
    // Pass string IDs
    if (algorithm === "Dijkstra") {
      result = dijkstra(graph, String(source), String(destination));
    } else if (algorithm === "A*") {
      result = astar(graph, String(source), String(destination));
    } else if (algorithm === "BFS") {
      result = bfs(graph, String(source), String(destination));
    }

    if (!result || result.path.length === 0) {
        toast({ title: "No Path", description: "No route found between these nodes.", variant: "destructive" });
        return;
    }

    // Format distance
    const d = result.distance;
    const distanceStr = d > 1000 
        ? `${(d / 1000).toFixed(2)} km` 
        : `${Math.round(d)} m`;

    // Format duration (assuming ~35km/h or 10m/s for city driving)
    const seconds = Math.round(d / 10);
    const durationStr = seconds > 60 
        ? `${Math.floor(seconds / 60)} min ${seconds % 60} s` 
        : `${seconds} s`;

    // Start animation, show stats only AFTER completion
    animate(result.visitedOrder, result.path, () => {
        setRouteInfo({ 
            distance: distanceStr, 
            duration: durationStr 
        }); 
    });
  };

  // Compare function same as before...
  const findBestRoute = () => {
     if (source === null || destination === null) return;
     const d = dijkstra(graph, String(source), String(destination));
     const a = astar(graph, String(source), String(destination));
     const b = bfs(graph, String(source), String(destination));
     
     const format = (val) => val > 1000 ? `${(val/1000).toFixed(2)} km` : `${Math.round(val)} m`;
     
     const winner = d.distance <= b.distance ? (d.distance <= a.distance ? "Dijkstra" : "A*") : (b.distance <= a.distance ? "BFS" : "A*");
     alert(`Route Comparison:\n\nDijkstra: ${format(d.distance)}\nA*: ${format(a.distance)}\nBFS: ${format(b.distance)}\n\nBest: ${winner}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 bg-gradient-to-br from-background via-secondary/20 to-background relative z-10">
      <div className={`container mx-auto transition-all duration-500 ${isExpanded ? 'max-w-[95vw]' : ''}`}>
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            className="text-center mb-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Geo Pathfinder Visualizer</h1>
          <div className="min-h-[2rem] flex items-center justify-center text-xl text-muted-foreground">
              {isGraphLoading 
                ? <span className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4"/> Fetching real-world road data...</span>
                : source === null 
                    ? "Click anywhere on the map to set source" 
                    : destination === null 
                        ? "Select a destination node" 
                        : "Ready to visualize"}
          </div>
        </motion.div>

        <div className={`grid gap-6 mx-auto mb-12 h-[82vh] transition-all duration-500 ${isExpanded ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3 max-w-7xl'}`}>
          {/* Sidebar - Hidden or Floating when expanded? For now, let's keep it but maybe stack or hide controls if fully immersive? 
              Actually user asked to enlarge map. 
              Let's make Sidebar collapsible or side-by-side depending on expansion.
          */}
          {!isExpanded && (
              <Card className="lg:col-span-1 shadow-elegant bg-card/80 backdrop-blur h-full flex flex-col overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    Controls
                    <div className="flex gap-2">
                        <Link to="/immersive">
                             <Button variant="outline" size="icon" title="Switch to Immersive View">
                                 <Maximize2 className="h-4 w-4" />
                             </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={handleReset} title="Reset All">
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-secondary/50 scrollbar-track-transparent pr-2">
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Source</label>
                     <Input value={source !== null ? `Lat: ${graph[source]?.lat.toFixed(4)}` : ''} readOnly placeholder="Click on map to start" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Destination</label>
                     <Input value={destination !== null ? `Node ${destination}` : ''} readOnly placeholder="Select a node" />
                   </div>

                   <div className="flex gap-2">
                       <Button onClick={findBestRoute} variant="outline" className="w-full" disabled={!destination}>Comparison</Button>
                   </div>

                   <div className="space-y-2">
                      <label className="text-sm font-medium">Algorithm</label>
                      <Select value={algorithm} onValueChange={setAlgorithm}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Dijkstra">Dijkstra</SelectItem>
                            <SelectItem value="A*">A*</SelectItem>
                            <SelectItem value="BFS">BFS (Greedy)</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>

                   <div className="space-y-4">
                       <label className="text-sm font-medium">Animation Delay: {speed} ms</label>
                       <Slider value={[speed]} onValueChange={(v) => setSpeed(v[0])} min={0} max={500} step={10} className="cursor-pointer"/>
                       <div className="flex justify-between text-xs text-muted-foreground">
                           <span>Fast (0ms)</span>
                           <span>Slow (500ms)</span>
                       </div>
                   </div>

                   <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-2 text-xs text-yellow-700 dark:text-yellow-400">
                       <strong>Note:</strong> Optimized for Telangana & Kerala regions for faster route finding.
                   </div>

                   <Button onClick={calculateRoute} className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading || !destination}>
                     {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>} Visualize Route
                   </Button>
                   
                   {routeInfo && (
                       <div className="p-4 bg-secondary/10 rounded-lg space-y-2 animate-in fade-in slide-in-from-bottom-2">
                           <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Distance</span>
                                <span className="font-bold">{routeInfo.distance}</span>
                           </div>
                           <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Est. Time <span className="text-xs opacity-70">(Driving)</span></span>
                                <span className="font-bold">{routeInfo.duration}</span>
                           </div>
                       </div>
                   )}
                </CardContent>
              </Card>
          )}

          {/* Map */}
          <div className={`h-full rounded-xl overflow-hidden shadow-elegant border relative ${isExpanded ? 'col-span-1' : 'lg:col-span-2'}`}>
             {/* Map Controls Overlay */}
             <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
                <Button 
                    variant="secondary" 
                    size="icon" 
                    className="shadow-md bg-background/80 backdrop-blur"
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? "Collapse" : "Expand"}
                >
                    {isExpanded ? <Minimize2 className="h-4 w-4"/> : <Maximize2 className="h-4 w-4"/>}
                </Button>
                 {isExpanded && (
                     <Button 
                        variant="secondary" 
                        size="icon" 
                        className="shadow-md bg-background/80 backdrop-blur"
                        onClick={handleReset}
                        title="Reset"
                    >
                        <RotateCcw className="h-4 w-4"/>
                    </Button>
                 )}
             </div>

             <MapVisualizer 
                graph={graph}
                source={source}
                destination={destination}
                path={path}
                visitedNodes={visitedNodes}
                radius={RADIUS_METERS}
                isExpanded={isExpanded}
                onNodeClick={handleNodeClick}
                onMapClick={handleMapClick}
             />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
