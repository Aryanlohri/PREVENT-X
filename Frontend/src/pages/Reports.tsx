import { motion } from "framer-motion";
import { FileText, Upload, Eye, Download, Trash2, File } from "lucide-react";
import { Button } from "@/components/ui/button";

const reports = [
  { name: "Blood Work Panel - Q1 2026", date: "Jan 15, 2026", type: "PDF" },
  { name: "Chest X-Ray Report", date: "Dec 8, 2025", type: "PDF" },
  { name: "Annual Checkup Summary", date: "Nov 20, 2025", type: "PDF" },
];

const Reports = () => (
  <div className="max-w-5xl mx-auto space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Medical Reports</h1>
        <p className="text-sm text-muted-foreground">Your secure medical document vault</p>
      </div>
      <Button className="gradient-primary text-primary-foreground border-0 shadow-md hover:opacity-90">
        <Upload className="h-4 w-4 mr-2" />
        Upload Report
      </Button>
    </div>

    {/* Drop Zone */}
    <div className="glass-card rounded-2xl border-2 border-dashed border-primary/20 p-10 text-center hover:border-primary/40 transition-colors cursor-pointer">
      <Upload className="h-10 w-10 text-primary/40 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">Drag & drop files here, or click to browse</p>
      <p className="text-xs text-muted-foreground mt-1">Supports PDF, JPG, PNG — Max 20MB</p>
    </div>

    {/* File List */}
    <div className="grid gap-3">
      {reports.map((r, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-card-hover rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10">
              <File className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.date} · {r.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><Eye className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><Download className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default Reports;
