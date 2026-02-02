import {useState} from "react";
import {motion} from "framer-motion";
import {Mail, Phone, MapPin, Send} from "lucide-react";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import {Card, CardContent} from "../components/ui/card";
import {useToast} from "../hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const {toast} = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();

    toast({
      title: "Message Sent!",
      description: "We'll get back to you as soon as possible.",
    });

    setFormData({name: "", email: "", message: ""});
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "support.graph@gmail.com",
      link: "mailto:tharunkunamalla7@gmail.com",
    },
    {
      icon: Phone,
      title: "Phone",
      content: "+91 1234567890",
      link: "tel:+91 1234567890",
    },
    {
      icon: MapPin,
      title: "Office",
      content: "Hyderabad, Telangana, India",
      link: "#",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.6}}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Get{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              In Touch
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Have questions or feedback? We'd love to hear from you and help with
            your needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            transition={{duration: 0.6, delay: 0.2}}
            className="lg:col-span-2"
          >
            <Card className="shadow-elegant border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({...formData, name: e.target.value})
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john..example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({...formData, email: e.target.value})
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <textarea
                      id="message"
                      placeholder="Tell us how we can help..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          message: e.target.value,
                        })
                      }
                      required
                      className="w-full rounded-md border px-3 py-2 bg-transparent text-base resize-vertical focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full transition-smooth hover:scale-105 shadow-md"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            transition={{duration: 0.6, delay: 0.4}}
            className="space-y-6"
          >
            <Card className="shadow-elegant border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <motion.a
                      key={index}
                      href={info.link}
                      initial={{opacity: 0, y: 10}}
                      animate={{opacity: 1, y: 0}}
                      transition={{duration: 0.4, delay: 0.5 + index * 0.1}}
                      className="flex items-start gap-4 group hover:bg-secondary/50 p-3 rounded-lg transition-smooth"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:from-primary group-hover:to-accent transition-smooth">
                        <info.icon className="w-6 h-6 text-primary group-hover:text-white transition-smooth" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{info.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {info.content}
                        </p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-hero text-black shadow-2xl border-0">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2 ">Quick Response</h3>
                <p className="text-black/90 text-sm">
                  We typically respond to all inquiries within 24 hours during
                  business days.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
