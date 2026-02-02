import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Loader2, Play, RotateCcw, Maximize2, Minimize2, Map as MapIcon, ArrowLeft, Navigation } from "lucide-react";
import MapVisualizer from '@/components/MapVisualizer';
import { buildGraphFromOSM, fetchRoadNetwork, findNearestNode } from '@/lib/osm';
import { dijkstra } from '@/algorithms/dijkstra';
import { astar } from '@/algorithms/astar';
import { useToast } from "@/components/ui/use-toast";
import { Link } from 'react-router-dom';

const RADIUS_METERS = 3000; // 3km radius

const ImmersiveMapPage = () => {
  const [graph, setGraph] = useState({});
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [algorithm, setAlgorithm] = useState("Dijkstra");
  const [path, setPath] = useState([]);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [routeInfo, setRouteInfo] = useState(null);
  const { toast } = useToast();

  const loadGraph = async (lat, lng) => {
      setIsGraphLoading(true);
      try {
          toast({ title: "Loading Region", description: "Fetching road network..." });
          const osmData = await fetchRoadNetwork(lat, lng, RADIUS_METERS);
          if (!osmData) { setIsGraphLoading(false); return null; }

          const newGraph = buildGraphFromOSM(osmData);
          if (Object.keys(newGraph).length === 0) {
              setIsGraphLoading(false);
              return null;
          }
          setGraph(newGraph);
          window.dispatchEvent(new CustomEvent('region-update', { detail: "Telangana (Hyd)" }));
          return newGraph;
      } catch (err) {
          console.error(err);
          return null;
      } finally {
          setIsGraphLoading(false);
      }
  };

  // Load Map Data on Mount
  useEffect(() => {
    // Listen for custom region updates if we want to sync
    const handleRegionUpdate = (e) => {
        // Just purely for visual feedback if needed
    };
    window.addEventListener('region-update', handleRegionUpdate);
    return () => window.removeEventListener('region-update', handleRegionUpdate);
  }, []);

  const handleMapClick = async (arg1, arg2) => {
      let lat, lng;
      if (arg1 && arg1.latlng) {
          lat = arg1.latlng.lat;
          lng = arg1.latlng.lng;
      } else {
          lat = arg1;
          lng = arg2;
      }

      if (source !== null && destination !== null) return; 

      let currentGraph = graph;

      // If graph is empty, load it first
      if (!currentGraph || Object.keys(currentGraph).length === 0) {
           const newGraph = await loadGraph(lat, lng);
           if (!newGraph) return;
           currentGraph = newGraph;
      } else {
          // Check bounds logic
          const centerNode = Object.values(currentGraph)[0]; 
          const dist = Math.sqrt(Math.pow(lat - centerNode.lat, 2) + Math.pow(lng - centerNode.lng, 2));
           if (dist > 0.05) { 
                toast({ 
                    title: "Out of Bounds", 
                    description: 'Please click within the loaded active region.', 
                    variant: "destructive" 
                });
                return;
           }
      }

      // Setting Source or Destination
      const nearest = findNearestNode(lat, lng, currentGraph);
      if (nearest && nearest.nodeId) {
         if (source === null) {
             setSource(String(nearest.nodeId));
             toast({ title: "Source Set", description: "Now select a destination." });
         } else {
             setDestination(String(nearest.nodeId));
             toast({ title: "Destination Set", description: "Ready to visualize." });
         }
      }
  };

  const handleReset = () => {
    setGraph({});
    setSource(null);
    setDestination(null);
    setPath([]);
    setZoomPath([]);
    setVisitedNodes([]);
    setRouteInfo(null);
    toast({ title: "Reset", description: "Map cleared. Click to set new source." });
  };

  const speedRef = useRef(speed);
  useEffect(() => { speedRef.current = speed; }, [speed]);

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
        let batchSize = currentDelay === 0 ? 50 : (currentDelay <= 5 ? 5 : 1);
        
        const batch = [];
        for (let j = 0; j < batchSize && i < visited.length; j++) {
            batch.push(visited[i]);
            i++;
        }
        setVisitedNodes(prev => [...prev, ...batch]);
        setTimeout(() => requestAnimationFrame(step), currentDelay);
    };
    step();
  };

  const calculateRoute = () => {
    if (source === null || destination === null) return;

    setIsCalculating(true);

    // Use setTimeout to allow UI to render "Calculating..." state before heavy operation
    setTimeout(() => {
        let result;
        if (algorithm === "Dijkstra") result = dijkstra(graph, String(source), String(destination));
        else if (algorithm === "A*") result = astar(graph, String(source), String(destination));
        else result = bfs(graph, String(source), String(destination));

        if (!result || result.path.length === 0) {
            toast({ title: "No Path", description: "No route found.", variant: "destructive" });
            setIsCalculating(false);
            return;
        }

        const d = result.distance;
        const distanceStr = d > 1000 ? `${(d / 1000).toFixed(2)} km` : `${Math.round(d)} m`;
        const seconds = Math.round(d / 10);
        const durationStr = seconds > 60 ? `${Math.floor(seconds / 60)} min ${seconds % 60} s` : `${seconds} s`;

        setIsCalculating(false);
        setZoomPath(result.path); // Zoom immediately

        animate(result.visitedOrder, result.path, () => {
            setRouteInfo({ distance: distanceStr, duration: durationStr });
        });
    }, 100);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      
      {/* Sidebar Controls */}
      <aside className="w-[400px] flex-shrink-0 bg-zinc-950/95 backdrop-blur border-r border-zinc-800 flex flex-col z-20 shadow-2xl">
         
         {/* Header */}
         <div className="p-6 border-b border-zinc-800">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
                    <MapIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                    GraphPath
                </h1>
             </div>
             <p className="text-sm text-zinc-400">
                 Immersive Visualization Console
             </p>
             <Link to="/map">
                 <Button variant="link" className="p-0 h-auto text-xs text-blue-400 mt-2 hover:text-blue-300">
                    <ArrowLeft className="w-3 h-3 mr-1" /> Back to Standard View
                 </Button>
             </Link>
         </div>

         {/* Scrollable Content */}
         <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
             
             {/* Status Card */}
             <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                 <div className="flex items-center justify-between mb-3">
                     <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</span>
                     {isGraphLoading ? (
                        <span className="flex items-center text-xs text-yellow-500 gap-2">
                             <Loader2 className="w-3 h-3 animate-spin"/> Loading Map...
                        </span>
                     ) : (
                        <span className="flex items-center text-xs text-emerald-500 gap-2">
                             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/> online
                        </span>
                     )}
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Nodes</span>
                        <span className="font-mono text-zinc-200">{Object.keys(graph).length.toLocaleString()}</span>
                    </div>
                    {routeInfo && (
                        <div className="pt-2 mt-2 border-t border-zinc-800 animate-in fade-in slide-in-from-left-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-zinc-400">Distance</span>
                                <span className="font-bold text-white">{routeInfo.distance}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Est. Time</span>
                                <span className="font-bold text-white">{routeInfo.duration}</span>
                            </div>
                        </div>
                    )}
                 </div>
             </div>

             {/* Algorithm Selection */}
             <div className="space-y-3">
                 <label className="text-sm font-medium text-zinc-300">Algorithm Strategy</label>
                 <Select value={algorithm} onValueChange={setAlgorithm}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-700 h-11 text-zinc-200">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200">
                        <SelectItem value="Dijkstra">Dijkstra's Algorithm</SelectItem>
                        <SelectItem value="A*">A* Search (Heuristic)</SelectItem>
                        <SelectItem value="BFS">Breadth-First Search</SelectItem>
                    </SelectContent>
                 </Select>
                 <p className="text-xs text-zinc-500">
                     {algorithm === 'Dijkstra' && "Guarantees shortest path. Explores all directions equally."}
                     {algorithm === 'A*' && "Optimized for speed. Uses coordinates to guide the search."}
                     {algorithm === 'BFS' && "Unweighted broad search. Good for ensuring minimum hops."}
                 </p>
             </div>

             {/* Speed Control */}
             <div className="space-y-4">
                 <div className="flex justify-between">
                    <label className="text-sm font-medium text-zinc-300">Simulation Speed</label>
                    <span className="text-xs font-mono text-zinc-500">{speed}ms</span>
                 </div>
                 <Slider 
                    value={[speed]} 
                    onValueChange={(v) => setSpeed(v[0])} 
                    min={0} 
                    max={500} 
                    step={10} 
                    className="cursor-pointer"
                 />
                 <div className="flex justify-between text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                     <span>Instant</span>
                     <span>Real-time</span>
                 </div>
             </div>

              {/* Locations */}
              <div className="space-y-3">
                   <div className="relative">
                       <div className="absolute left-3 top-3 w-4 h-[calc(100%-24px)] border-l-2 border-dashed border-zinc-700/50 ml-1"></div>
                       
                       <div className="space-y-3">
                           <div className="relative">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-zinc-950">
                                    <MapIcon className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                                </div>
                                <Input 
                                   value={source !== null ? `Lat: ${graph[source]?.lat.toFixed(4)}...` : ''} 
                                   readOnly 
                                   placeholder="Click map to set Start" 
                                   className="pl-8 bg-zinc-900 border-zinc-700 text-zinc-300 placeholder:text-zinc-600"
                                />
                           </div>
                           <div className="relative">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-zinc-950">
                                    <MapIcon className="w-4 h-4 text-red-500 fill-red-500/20" />
                                </div>
                                <Input 
                                   value={destination !== null ? `Node: ${destination}` : ''} 
                                   readOnly 
                                   placeholder="Select Destination" 
                                   className="pl-8 bg-zinc-900 border-zinc-700 text-zinc-300 placeholder:text-zinc-600"
                                />
                           </div>
                       </div>
                   </div>
              </div>

         </div>

         {/* Footer Actions */}
         <div className="p-6 bg-zinc-950/50 border-t border-zinc-800 space-y-3">
             <Button 
                onClick={calculateRoute} 
                className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-900/20" 
                disabled={isLoading || isCalculating || !destination}
             >
                {isCalculating ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin"/> Calculating...
                    </>
                ) : isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin"/> Visualizing...
                    </>
                ) : (
                    <>
                        <Navigation className="mr-2 h-5 w-5 fill-current"/> Visualize Route
                    </>
                )}
             </Button>
             
             <Button 
                variant="outline" 
                onClick={handleReset} 
                className="w-full border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
             >
                <RotateCcw className="mr-2 h-4 w-4"/> Clear Map
             </Button>
         </div>

      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative h-full bg-zinc-900">
          <MapVisualizer 
              graph={graph}
              source={source}
              destination={destination}
              path={path}
              visitedNodes={visitedNodes}
              radius={RADIUS_METERS}
              isExpanded={true} 
              onNodeClick={() => {}} // handled via map click for source/dest mainly
              onMapClick={handleMapClick}
          />
          
          {/* Legend Overlay */}
          <div className="absolute bottom-8 right-8 bg-zinc-950/80 backdrop-blur p-4 rounded-xl border border-zinc-800 shadow-2xl z-[500] pointer-events-none">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Legend</h4>
                <div className="space-y-2 text-sm text-zinc-300">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500 border border-blue-400"></span>
                        <span>Start Point</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 border border-red-400"></span>
                        <span>Destination</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-1 bg-yellow-400"></span>
                        <span>Optimal Path</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm bg-blue-500/30 border border-blue-500/50"></span>
                        <span>Explored</span>
                    </div>
                </div>
          </div>
      </main>

    </div>
  );
};

export default ImmersiveMapPage;
