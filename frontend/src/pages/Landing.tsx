import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Activity, FileText, Lightbulb, ArrowRight, Heart, Brain, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroIllustration from "@/assets/hero-illustration.png";

const features = [
  { icon: Shield, title: "Risk Prediction", description: "AI-powered early detection of potential health risks based on your data and lifestyle." },
  { icon: Activity, title: "Vitals Tracking", description: "Monitor blood pressure, heart rate, blood sugar, and BMI trends over time." },
  { icon: FileText, title: "Medical Vault", description: "Securely store and access all your medical records, reports, and prescriptions." },
  { icon: Lightbulb, title: "Smart Prevention", description: "Personalized preventive care tips tailored to your health profile." },
];

const steps = [
  { num: "01", title: "Create Your Profile", description: "Sign up and enter your basic health information to get started." },
  { num: "02", title: "Track & Monitor", description: "Log your vitals and upload medical records to build your health timeline." },
  { num: "03", title: "Get Insights", description: "Receive personalized risk assessments and preventive care recommendations." },
];

const Landing = () => {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-7 w-7 text-primary" />
            <span className="font-heading text-xl font-bold text-foreground">PreventX</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">How It Works</a>
            <Link to="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gradient-primary text-primary-foreground border-0 shadow-md hover:opacity-90 transition-opacity">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Brain className="h-4 w-4" />
              AI-Powered Preventive Healthcare
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              <span className="gradient-text">Predict.</span> Prevent.{" "}
              <span className="gradient-text">Protect.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Your personal health guardian. Monitor vitals, detect risks early, and receive tailored preventive care — all in one beautiful platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg" className="gradient-primary text-primary-foreground border-0 shadow-lg hover:opacity-90 transition-opacity px-8">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="px-8 border-border hover:bg-accent">
                  Learn More
                </Button>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl glow-primary opacity-30 blur-2xl" />
              <img
                src={heroIllustration}
                alt="Healthcare visualization"
                className="relative rounded-3xl w-full max-w-md float-animation"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for <span className="gradient-text">Better Health</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed to keep you ahead of health risks.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-hover rounded-2xl p-6 text-center group"
              >
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <f.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="text-5xl font-heading font-bold gradient-text mb-4">{s.num}</div>
                <h3 className="font-heading font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-12 text-center max-w-3xl mx-auto"
          >
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
              Start Your Prevention Journey Today
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands taking control of their health with smart, data-driven preventive care.
            </p>
            <Link to="/signup">
              <Button size="lg" className="gradient-primary text-primary-foreground border-0 shadow-lg hover:opacity-90 transition-opacity px-10">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <span className="font-heading font-semibold text-foreground">PreventX</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 PreventX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
