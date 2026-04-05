import { motion } from "framer-motion";
import { FileText, Download, Loader2, ShieldCheck, Clock, File } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/api";
import { toast } from "sonner";

const Reports = () => {
  const [generating, setGenerating] = useState(false);

  const downloadReport = async () => {
    setGenerating(true);
    try {
      const token = getToken();
      const response = await fetch("http://localhost:8000/api/vitals/export-pdf", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to generate report");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PreventX_Health_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("Health report downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report. Please try again later.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Health Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm">Download your AI-powered preventive health analysis</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Main Report Generation Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="glass-card rounded-3xl p-8 border border-primary/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <FileText className="h-40 w-40" />
          </div>
          
          <div className="relative z-10">
            <div className="p-3 rounded-2xl bg-primary/10 w-fit mb-6">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Complete Health Summary</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Generate a comprehensive PDF report containing your latest vitals, AI health risk assessment, medical history, and personalized preventive recommendations.
            </p>
            
            <ul className="space-y-3 mb-10 text-sm">
              <li className="flex items-center gap-2 text-foreground/80">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" /> 
                Vital trends & analysis
              </li>
              <li className="flex items-center gap-2 text-foreground/80">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" /> 
                AI Risk Score & categorization
              </li>
              <li className="flex items-center gap-2 text-foreground/80">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" /> 
                Diet & Exercise guidelines
              </li>
            </ul>

            <Button 
              onClick={downloadReport} 
              disabled={generating}
              className="w-full gradient-primary text-primary-foreground border-0 shadow-lg hover:opacity-90 py-6 text-lg rounded-2xl group"
            >
              {generating ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Download className="h-5 w-5 mr-2 group-hover:translate-y-0.5 transition-transform" />
              )}
              {generating ? "Generating Report..." : "Generate AI Health Report"}
            </Button>
          </div>
        </motion.div>

        {/* History / Info Side */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Why download reports?
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-accent/30">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Doctors Visit</p>
                <p className="text-sm text-muted-foreground">Share professional summaries with your physician during checkups.</p>
              </div>
              <div className="p-4 rounded-xl bg-accent/30">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Track Progress</p>
                <p className="text-sm text-muted-foreground">Keep hard copies of your health journey to see improvements over time.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-8 border-dashed border-2 border-border/50 text-center"
          >
            <File className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <h4 className="font-heading font-medium text-foreground mb-2">No Archived Reports</h4>
            <p className="text-xs text-muted-foreground">Reports are generated on-demand to ensure they include your most recent data.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
