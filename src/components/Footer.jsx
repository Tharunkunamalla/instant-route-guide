import { Link } from 'react-router-dom';
import { MapPin, Github, Twitter, Linkedin, Mail, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [region, setRegion] = useState("Telangana");
  const [load, setLoad] = useState(24);

  // Listen for Map updates
  useEffect(() => {
      const handleRegionUpdate = (e) => {
          setRegion(e.detail);
          // Spike load on activity
          setLoad(prev => Math.min(95, prev + 30));
      };
      window.addEventListener('region-update', handleRegionUpdate);
      return () => window.removeEventListener('region-update', handleRegionUpdate);
  }, []);

  // Glitchy Load Effect
  useEffect(() => {
      const interval = setInterval(() => {
          setLoad(prev => {
              const change = (Math.random() - 0.5) * 15; // Fluctuate by +/- 7.5%
              let newVal = prev + change;
              if (newVal < 10) newVal = 10;
              if (newVal > 90) newVal = 90;
              return Math.round(newVal);
          });
      }, 800);
      return () => clearInterval(interval);
  }, []);

  return (
    <footer className="relative bg-zinc-950 text-zinc-300 overflow-hidden border-t border-zinc-800">
      {/* Decorative Top Highlight */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
        
      {/* Background Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3 group w-fit">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">SmartRoute</span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              Navigating the world with intelligent algorithms. Visualizing efficient paths on real-world maps.
            </p>
            <div className="flex space-x-4">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 group"
                >
                  <Icon className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            <div>
              <h3 className="text-white font-semibold text-lg mb-6">Explore</h3>
              <ul className="space-y-4">
                {[
                    {name: 'Home', path: '/'},
                    {name: 'Map Visualizer', path: '/map'},
                    {name: 'About Project', path: '/about'},
                ].map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-sm hover:text-blue-400 transition-colors flex items-center group">
                      <span className="w-0 group-hover:w-2 h-[2px] bg-blue-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
               <h3 className="text-white font-semibold text-lg mb-6">Support</h3>
              <ul className="space-y-4">
                {[
                    {name: 'Documentation', path: '#'},
                    {name: 'Contact', path: '/contact'},
                    {name: 'Privacy Policy', path: '#'},
                ].map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-sm hover:text-blue-400 transition-colors flex items-center group">
                       <span className="w-0 group-hover:w-2 h-[2px] bg-blue-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* System Status - Replaces Newsletter */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-lg">System Status</h3>
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 space-y-4 backdrop-blur-sm transition-all duration-500 hover:border-blue-500/30">
                 {/* Status Indicator */}
                 <div className="flex items-center justify-between">
                     <span className="text-zinc-400 text-sm">Server Status</span>
                     <div className="flex items-center space-x-2">
                         <span className="relative flex h-2.5 w-2.5">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                         </span>
                         <span className="text-emerald-400 text-sm font-medium">Operational</span>
                     </div>
                 </div>
                 
                 {/* Live Region */}
                 <div className="flex items-center justify-between text-sm">
                     <span className="text-zinc-400">Active Region</span>
                     <span className="text-white font-mono transition-all duration-300">{region}</span>
                 </div>

                 {/* Glitchy Load Metric */}
                 <div className="space-y-2">
                     <div className="flex justify-between text-xs">
                         <span className="text-zinc-500">Network Load</span>
                         <span className="text-blue-400 font-mono min-w-[30px] text-right">{load}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${load}%` }}
                         />
                     </div>
                 </div>

                 <p className="text-xs text-zinc-600 pt-2 border-t border-zinc-800/50">
                    Live updates enabled via WebSocket
                 </p>
            </div>
          </div>
        </div>
        {/* <hr className="border-zinc-800 mt-9 relative z-10"/> */}
        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-center items-center gap-4">
          <p className="text-zinc-500 text-sm">
            © {currentYear} SmartRoute. Based on OpenStreetMap data.
          </p>
          {/* <div className="flex items-center text-sm text-zinc-500">
             <span>Made with</span>
             <Heart className="w-4 h-4 mx-1.5 text-red-500 fill-red-500 animate-pulse" />
             <span>by  </span>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
