import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import GoogleMap from '@/components/GoogleMap';

const MapPage = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [searchSource, setSearchSource] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const { toast } = useToast();

  const handleFindRoute = () => {
    if (!searchSource || !searchDestination) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both source and destination',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setSource(searchSource);
    setDestination(searchDestination);
    setRouteInfo(null);
  };

  const handleRouteCalculated = useCallback((distance: string, duration: string) => {
    setRouteInfo({ distance, duration });
    setIsLoading(false);
    toast({
      title: 'Route Found!',
      description: 'The optimal path has been calculated',
    });
  }, [toast]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-background via-secondary/20 to-background">
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
            <Card className="shadow-elegant border-border/50 bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
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
                      value={searchSource}
                      onChange={(e) => setSearchSource(e.target.value)}
                      className="pl-10"
                      onKeyPress={(e) => e.key === 'Enter' && handleFindRoute()}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination</label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter destination..."
                      value={searchDestination}
                      onChange={(e) => setSearchDestination(e.target.value)}
                      className="pl-10"
                      onKeyPress={(e) => e.key === 'Enter' && handleFindRoute()}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleFindRoute}
                  disabled={isLoading}
                  className="w-full transition-smooth hover:scale-105 shadow-md"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Find Best Route
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
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Distance</span>
                      </div>
                      <span className="font-bold text-lg text-primary">{routeInfo.distance}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-accent/5 to-primary/5 rounded-xl border border-accent/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-sm font-medium">Duration</span>
                      </div>
                      <span className="font-bold text-lg text-accent">{routeInfo.duration}</span>
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
            <Card className="shadow-elegant h-full min-h-[600px] border-border/50 overflow-hidden">
              <CardContent className="p-0 h-full">
                <div className="relative w-full h-full min-h-[600px] bg-secondary/20 rounded-lg overflow-hidden">
                  {source && destination ? (
                    <GoogleMap
                      source={source}
                      destination={destination}
                      onRouteCalculated={handleRouteCalculated}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4 p-8">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                          className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mx-auto flex items-center justify-center shadow-lg"
                        >
                          <MapPin className="w-12 h-12 text-primary" />
                        </motion.div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2">Interactive Map Ready</h3>
                          <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
                            Enter your source and destination to visualize the optimal route
                          </p>
                        </div>
                      </div>
                    </div>
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
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Powered by Google Maps</h3>
                  <p className="text-white/90">
                    Real-time routing with live traffic data and accurate distance calculations
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-white/70">Integrated with</div>
                    <div className="font-semibold">Google Maps API</div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MapPage;
