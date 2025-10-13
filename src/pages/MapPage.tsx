import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const MapPage = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const { toast } = useToast();

  const handleFindRoute = () => {
    if (!source || !destination) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both source and destination',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setRouteInfo({
        distance: '12.5 km',
        duration: '18 minutes',
      });
      setIsLoading(false);
      toast({
        title: 'Route Found!',
        description: 'The shortest path has been calculated',
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Route
          </h1>
          <p className="text-xl text-muted-foreground">
            Enter your starting point and destination to find the best path
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Route Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Source Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter starting point..."
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination</label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter destination..."
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleFindRoute}
                  disabled={isLoading}
                  className="w-full transition-smooth hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Finding Route...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                      Find Route
                    </>
                  )}
                </Button>

                {routeInfo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 pt-4 border-t border-border"
                  >
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Distance</span>
                      </div>
                      <span className="font-semibold text-primary">{routeInfo.distance}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Duration</span>
                      </div>
                      <span className="font-semibold text-primary">{routeInfo.duration}</span>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Map Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-elegant h-full min-h-[600px]">
              <CardContent className="p-0 h-full">
                <div className="relative w-full h-full min-h-[600px] bg-secondary/20 rounded-lg overflow-hidden">
                  {/* Map Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                        <MapPin className="w-10 h-10 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
                        <p className="text-muted-foreground max-w-md">
                          Map integration ready. Connect your Google Maps API key to display the interactive map and route visualization.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Route Line */}
                  {routeInfo && (
                    <motion.div
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: 'easeInOut' }}
                      className="absolute inset-0"
                    >
                      <svg className="w-full h-full" viewBox="0 0 400 300">
                        <motion.path
                          d="M 50 250 Q 150 100 350 50"
                          stroke="hsl(var(--primary))"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, ease: 'easeInOut' }}
                        />
                        <circle cx="50" cy="250" r="8" fill="hsl(var(--primary))" />
                        <circle cx="350" cy="50" r="8" fill="hsl(var(--accent))" />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 max-w-7xl mx-auto"
        >
          <Card className="bg-gradient-hero text-white shadow-elegant">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Need Google Maps Integration?</h3>
                  <p className="text-white/90">
                    Add your API key to enable real-time routing, traffic updates, and detailed map visualization
                  </p>
                </div>
                <Button variant="secondary" size="lg" className="transition-smooth hover:scale-105">
                  Configure API
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MapPage;
