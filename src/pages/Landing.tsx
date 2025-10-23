import {Link} from "react-router-dom";
import {motion} from "framer-motion";
import {MapPin, Zap, Route, Clock, ArrowRight} from "lucide-react";
import {Button} from "../components/ui/button";
import {Card, CardContent} from "../components/ui/card";

const Landing = () => {
  const features = [
    {
      icon: Zap,
      title: "Real-time Routing",
      description:
        "Get instant route calculations with up-to-date traffic and road conditions.",
    },
    {
      icon: Route,
      title: "Dynamic Map Updates",
      description:
        "Watch your route update automatically as you change your destination.",
    },
    {
      icon: Clock,
      title: "Multiple Travel Modes",
      description:
        "Choose between driving, walking, or cycling for optimal route planning.",
    },
    {
      icon: MapPin,
      title: "Accurate Locations",
      description:
        "Precise geocoding ensures you always find the exact locations you need.",
    },
  ];

  const containerVariants = {
    hidden: {opacity: 0},
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {opacity: 0, y: 20},
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4 bg-gradient-to-br from-background via-secondary/30 to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8}}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{scale: 0}}
              animate={{scale: 1}}
              transition={{delay: 0.2, type: "spring", stiffness: 200}}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-elegant">
                <MapPin className="w-10 h-10 text-primary-foreground" />
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Find the{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Best Routes
              </span>{" "}
              Instantly!
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover optimal paths between any locations with real-time
              traffic data and accurate distance calculations
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/map">
                <Button
                  size="lg"
                  className="text-lg px-8 transition-smooth hover:scale-105 shadow-elegant group"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-smooth" />
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 transition-smooth hover:scale-105"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Animated Background Elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"
            style={{animationDelay: "1s"}}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{duration: 0.6}}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to find the perfect route, every time
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{once: true}}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full border-border/50 hover:border-primary/50 hover:shadow-elegant transition-smooth hover:scale-105 hover:-translate-y-1 group bg-card/50 backdrop-blur">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mx-auto mb-4 flex items-center justify-center group-hover:from-primary group-hover:to-accent transition-smooth">
                      <feature.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-smooth" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-smooth">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{opacity: 0, scale: 0.95}}
            whileInView={{opacity: 1, scale: 1}}
            viewport={{once: true}}
            transition={{duration: 0.6}}
            className="relative overflow-hidden rounded-3xl gradient-hero p-12 md:p-20 text-center shadow-2xl"
          >
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Find Your Route?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Start discovering the most efficient paths between any locations
                today
              </p>
              <Link to="/map">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 transition-smooth hover:scale-105"
                >
                  Try It Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
