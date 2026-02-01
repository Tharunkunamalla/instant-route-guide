import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, Loader2, Search, Play, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const animate = async (visited, finalPath) => {
    setIsLoading(true);
    setVisitedNodes([]);
    setPath([]);
    
    let i = 0;
    
    const step = () => {
        if (i >= visited.length) {
            setPath(finalPath);
            setIsLoading(false);
            return;
        }

        // Batch updates to avoid too many renders at very high speeds
        const currentSpeed = speedRef.current;
        const batchSize = currentSpeed > 100 ? Math.ceil(currentSpeed / 20) : 1; 
        
        const batch = [];
        for (let j = 0; j < batchSize && i < visited.length; j++) {
            batch.push(visited[i]);
            i++;
        }

        setVisitedNodes(prev => [...prev, ...batch]);
        
        // Calculate delay: Higher speed = Lower delay
        // Max Max (500) -> 4ms
        // Min (10) -> 200ms
        const delay = 2000 / currentSpeed;

        setTimeout(() => {
            requestAnimationFrame(step);
        }, delay);
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

    setRouteInfo({ distance: Math.round(result.distance) + " m", duration: Math.round(result.distance / 10) + " s" }); 
    
    // Start animation
    animate(result.visitedOrder, result.path);
  };

  // Compare function same as before...
  const findBestRoute = () => {
     if (source === null || destination === null) return;
     const d = dijkstra(graph, String(source), String(destination));
     const a = astar(graph, String(source), String(destination));
     const b = bfs(graph, String(source), String(destination));
     const winner = d.distance <= b.distance ? (d.distance <= a.distance ? "Dijkstra" : "A*") : (b.distance <= a.distance ? "BFS" : "A*");
     alert(`Route Comparison:\nDijkstra: ${Math.round(d.distance)}m\nA*: ${Math.round(a.distance)}m\nBFS: ${Math.round(b.distance)}m\n\nBest: ${winner}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className={`container mx-auto transition-all duration-500 ${isExpanded ? 'max-w-[95vw]' : ''}`}>
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Geo Pathfinder Visualizer</h1>
          <p className="text-xl text-muted-foreground">
              {isGraphLoading 
                ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin h-5 w-5"/> Fetching real-world road data...</span>
                : source === null 
                    ? "Click anywhere on the map to set source" 
                    : destination === null 
                        ? "Select a destination node" 
                        : "Ready to visualize"}
          </p>
        </motion.div>

        <div className={`grid gap-6 mx-auto h-[80vh] transition-all duration-500 ${isExpanded ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3 max-w-7xl'}`}>
          {/* Sidebar - Hidden or Floating when expanded? For now, let's keep it but maybe stack or hide controls if fully immersive? 
              Actually user asked to enlarge map. 
              Let's make Sidebar collapsible or side-by-side depending on expansion.
          */}
          {!isExpanded && (
              <Card className="lg:col-span-1 shadow-elegant bg-card/80 backdrop-blur h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    Controls
                    <Button variant="ghost" size="icon" onClick={handleReset} title="Reset All">
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 flex-1 overflow-y-auto">
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

                   <div className="space-y-2">
                       <label className="text-sm font-medium">Speed (ms): {speed}</label>
                       <Slider value={[speed]} onValueChange={(v) => setSpeed(v[0])} min={10} max={500} step={10} />
                   </div>

                   <Button onClick={calculateRoute} className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading || !destination}>
                     {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Play className="mr-2 h-4 w-4"/>} Visualize Route
                   </Button>
                   
                   {routeInfo && (
                       <div className="p-4 bg-secondary/10 rounded-lg space-y-2 animate-in fade-in slide-in-from-bottom-2">
                           <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Distance</span>
                                <span className="font-bold">{routeInfo.distance}</span>
                           </div>
                           <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Est. Time</span>
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
