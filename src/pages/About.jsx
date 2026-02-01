import { motion } from 'framer-motion';
import { Target, Users, Zap, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To make route planning simple, fast, and accessible for everyone, anywhere.',
    },
    {
      icon: Users,
      title: 'User-Focused',
      description: 'Every feature is designed with our users in mind, ensuring the best experience.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized algorithms deliver instant results without compromising accuracy.',
    },
    {
      icon: Heart,
      title: 'Made with Care',
      description: 'Built by a passionate team dedicated to solving real navigation challenges.',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SmartRoute</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're on a mission to revolutionize the way people find and navigate routes with cutting-edge technology
          </p>
        </motion.div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <Card className="shadow-elegant border-border/50 bg-card/80 backdrop-blur">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  SmartRoute was born from a simple frustration: finding the best route between two points
                  shouldn't be complicated. We noticed that while many navigation tools exist, few truly
                  focus on simplicity and speed.
                </p>
                <p>
                  Our team of developers and designers came together to create a solution that combines
                  powerful routing algorithms with an intuitive, beautiful interface. The result is
                  SmartRoute - a tool that anyone can use, anywhere, anytime.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.3 }}
           className="mb-20"
        >
           <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-8 md:p-12">
               <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
               <div className="space-y-8 text-muted-foreground text-lg leading-relaxed">
                   <div>
                       <h3 className="text-xl font-semibold text-foreground mb-2">Graph Construction & Mapping</h3>
                       <p>
                           Our route finding system works by converting real-world map data from OpenStreetMap into a graph made of nodes (intersections) and edges (roads). 
                           When you select a source and destination, the system searches within a small radius around your click to find the nearest valid road nodes, ensuring the route starts and ends on an actual road.
                       </p>
                   </div>
                   
                   <div>
                       <h3 className="text-xl font-semibold text-foreground mb-2">Pathfinding Logic</h3>
                       <p>
                           Once the nodes are identified, the backend runs a pathfinding algorithm like Dijkstra or A*. 
                           The algorithm explores connected road nodes, accumulating travel distance and prioritizing paths based on cost. 
                           As it progresses, it tracks the "parent" of each visited node to reconstruct the path later.
                       </p>
                   </div>

                   <div>
                       <h3 className="text-xl font-semibold text-foreground mb-2">Visualization</h3>
                       <p>
                           What you see in the visualization is the live exploration process. 
                           The <span className="text-blue-500 font-bold">blue dots</span> represent nodes the algorithm has visited or considered. 
                           The order of their appearance reflects the algorithm's expansion strategy.
                           Finally, the <span className="text-yellow-500 font-bold">yellow path</span> shows the reconstructed optimal route, created by backtracking from the destination to the source using parent links.
                       </p>
                   </div>
               </div>
           </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              >
                <Card className="h-full shadow-elegant hover:shadow-xl transition-smooth hover:scale-105 hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:from-primary group-hover:to-accent transition-smooth">
                      <value.icon className="w-7 h-7 text-primary group-hover:text-white transition-smooth" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20"
        >
          <Card className="bg-gradient-hero text-black shadow-2xl border-0">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Join Our Journey</h2>
              <p className="text-xl text-black/90 mb-6 max-w-2xl mx-auto">
                We're always looking for talented individuals who share our passion for
                creating exceptional user experiences.
              </p>
              <div className="text-black/80">
                Contact us at <span className="font-semibold text-blue-500">careers@smartroute.com</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
