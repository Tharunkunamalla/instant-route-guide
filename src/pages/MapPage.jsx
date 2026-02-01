import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, Loader2, Search, Play } from "lucide-react";
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

// Helper to generate graph
const generateGraph = (centerLat, centerLng, numNodes = 100, radius = 5000) => {
  const nodes = {};
  const R = 6371e3; // Earth radius in meters

  for (let i = 0; i < numNodes; i++) {
    // Random point in circle
    const r = radius * Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const dy = r * Math.sin(theta);
    const dx = r * Math.cos(theta);
    
    const lat = centerLat + (dy / R) * (180 / Math.PI);
    const lng = centerLng + (dx / (R * Math.cos(centerLat * Math.PI / 180))) * (180 / Math.PI);
    
    nodes[i] = { id: i, lat, lng, neighbors: {} };
  }

  // Connect neighbors based on distance
  Object.keys(nodes).forEach(id => {
    Object.keys(nodes).forEach(otherId => {
      if (id !== otherId) {
        const u = nodes[id];
        const v = nodes[otherId];
        const d = Math.sqrt(Math.pow(u.lat - v.lat, 2) + Math.pow(u.lng - v.lng, 2)) * 111000;
        if (d < 800) { // Connect if closer than 800m
          nodes[id].neighbors[otherId] = d;
        }
      }
    });
  });

  return nodes;
};

const MapPage = () => {
  const [graph, setGraph] = useState({});
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [algorithm, setAlgorithm] = useState("Dijkstra");
  const [speed, setSpeed] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [path, setPath] = useState([]);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [radiusValid, setRadiusValid] = useState(true);
  const { toast } = useToast();

  const RADIUS_METERS = 3000; // 3km constraint

  useEffect(() => {
    // Center of Hyderabad
    const g = generateGraph(17.4474, 78.3762);
    setGraph(g);
  }, []);

  const handleNodeClick = (nodeId) => {
    if (source === null) {
      setSource(nodeId);
      setPath([]);
      setVisitedNodes([]);
      setRouteInfo(null);
      toast({ title: "Source Selected", description: `Node ${nodeId} set as source.` });
    } else if (destination === null) {
      // Check radius logic
      const sNode = graph[source];
      const dNode = graph[nodeId];
      const dist = Math.sqrt(Math.pow(sNode.lat - dNode.lat, 2) + Math.pow(sNode.lng - dNode.lng, 2)) * 111000;
      
      if (dist > RADIUS_METERS) {
        toast({ 
          title: "Out of Range", 
          description: "Select end inside radius", 
          variant: "destructive" 
        });
        return;
      }

      setDestination(nodeId);
      toast({ title: "Destination Selected", description: `Node ${nodeId} set as destination.` });
    } else {
      // Reset if both set
      setSource(nodeId);
      setDestination(null);
      setPath([]);
      setVisitedNodes([]);
      setRouteInfo(null);
    }
  };

  const handleReset = () => {
    setSource(null);
    setDestination(null);
    setPath([]);
    setVisitedNodes([]);
    setRouteInfo(null);
  };

  const animate = async (visited, finalPath) => {
    setIsLoading(true);
    // Animate visited
    for (let i = 0; i < visited.length; i++) {
      setVisitedNodes(prev => [...prev, visited[i]]);
      await new Promise(r => setTimeout(r, 2000 / speed));
    }
    setPath(finalPath);
    setIsLoading(false);
  };

  const calculateRoute = () => {
    if (source === null || destination === null) {
       toast({ title: "Error", description: "Select source and destination", variant: "destructive" });
       return;
    }
    if (source === destination) return;

    let result;
    if (algorithm === "Dijkstra") {
      result = dijkstra(graph, parseInt(source), parseInt(destination));
    } else if (algorithm === "A*") {
      result = astar(graph, parseInt(source), parseInt(destination));
    } else if (algorithm === "BFS") { // 3rd Algo
      result = bfs(graph, parseInt(source), parseInt(destination));
    }

    if (result.path.length === 0) {
        toast({ title: "No Path", description: "No route found between these nodes.", variant: "destructive" });
        return;
    }

    setRouteInfo({ distance: Math.round(result.distance) + " m", duration: Math.round(result.distance / 10) + " s" }); // Fake duration
    animate(result.visitedOrder, result.path);
  };

  const findBestRoute = () => {
     if (source === null || destination === null) return;
     const d = dijkstra(graph, parseInt(source), parseInt(destination));
     const a = astar(graph, parseInt(source), parseInt(destination));
     const b = bfs(graph, parseInt(source), parseInt(destination));

     // Compare
     const winner = d.distance <= b.distance ? (d.distance <= a.distance ? "Dijkstra" : "A*") : (b.distance <= a.distance ? "BFS" : "A*");
     
     alert(`Route Comparison:\nDijkstra: ${Math.round(d.distance)}m\nA*: ${Math.round(a.distance)}m\nBFS: ${Math.round(b.distance)}m\n\nBest: ${winner}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto">
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Geo Pathfinder Visualizer</h1>
          <p className="text-xl text-muted-foreground">Visualize shortest routes using real map data</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto h-[80vh]">
          {/* Sidebar */}
          <Card className="lg:col-span-1 shadow-elegant bg-card/80 backdrop-blur h-full flex flex-col">
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 overflow-y-auto">
               <div className="space-y-2">
                 <label>Source</label>
                 <Input value={source !== null ? `Node ${source}` : ''} readOnly placeholder="Click on map" />
               </div>
               <div className="space-y-2">
                 <label>Destination</label>
                 <Input value={destination !== null ? `Node ${destination}` : ''} readOnly placeholder="Click inside radius" />
               </div>

               <div className="flex gap-2">
                   <Button onClick={findBestRoute} variant="outline" className="w-full">Search (Compare)</Button>
               </div>

               <div className="space-y-2">
                  <label>Algorithm</label>
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
                   <label>Speed (ms): {speed}</label>
                   <Slider value={[speed]} onValueChange={(v) => setSpeed(v[0])} min={10} max={500} step={10} />
               </div>

               <Button onClick={calculateRoute} className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                 {isLoading ? <Loader2 className="animate-spin mr-2"/> : null} Visualize
               </Button>
               <Button onClick={handleReset} variant="secondary" className="w-full">Clear</Button>

               {routeInfo && (
                   <div className="p-4 bg-secondary/10 rounded-lg space-y-2">
                       <p><strong>Distance:</strong> {routeInfo.distance}</p>
                       <p><strong>Duration:</strong> {routeInfo.duration}</p>
                   </div>
               )}
            </CardContent>
          </Card>

          {/* Map */}
          <div className="lg:col-span-2 h-full rounded-xl overflow-hidden shadow-elegant border">
             <MapVisualizer 
                graph={graph}
                source={source ? parseInt(source) : null}
                destination={destination ? parseInt(destination) : null}
                path={path}
                visitedNodes={visitedNodes}
                radius={RADIUS_METERS}
                onNodeClick={handleNodeClick}
                onMapClick={() => {}}
             />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
