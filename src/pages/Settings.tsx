import { motion } from "framer-motion";
import { useState } from "react";
import {
  User, Lock, Mail, Camera, Target, Moon, Droplets, Apple, Ruler,
  Brain, MessageCircle, Smile, Sparkles, BellRing, Pill, FileBarChart, AlertTriangle,
  Shield, Share2, Download, Trash2, Sun, Languages, Accessibility,
  HelpCircle, Headphones, Flag, Info, ChevronRight, Eye, EyeOff,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/AppContext";
import { t } from "@/lib/translations";

const Section = ({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card rounded-2xl overflow-hidden">
    <h2 className="font-heading font-semibold text-foreground px-6 pt-5 pb-3 text-base">{title}</h2>
    <div className="divide-y divide-border/50">{children}</div>
  </motion.div>
);

const SettingRow = ({ icon: Icon, label, children, danger = false, onClick }: { icon: any; label: string; children?: React.ReactNode; danger?: boolean; onClick?: () => void }) => (
  <div onClick={onClick} className="flex items-center justify-between px-6 py-3.5 hover:bg-accent/40 transition-colors cursor-pointer">
    <div className="flex items-center gap-3">
      <Icon className={`h-4.5 w-4.5 ${danger ? "text-destructive" : "text-muted-foreground"}`} />
      <span className={`text-sm font-medium ${danger ? "text-destructive" : "text-foreground"}`}>{label}</span>
    </div>
    {children || <ChevronRight className="h-4 w-4 text-muted-foreground" />}
  </div>
);

const Settings = () => {
  const { aiCompanionEnabled, setAiCompanionEnabled, language, setLanguage, fontSize, setFontSize } = useAppContext();

  // Health Preferences
  const [stepGoal, setStepGoal] = useState("10000");
  const [sleepTarget, setSleepTarget] = useState("8");
  const [waterGoal, setWaterGoal] = useState("3");
  const [sugarLimit, setSugarLimit] = useState("25");
  const [units, setUnits] = useState("metric");

  // AI
  const [aiSensitivity, setAiSensitivity] = useState("medium");
  const [moodReminders, setMoodReminders] = useState(true);
  const [personalizedInsights, setPersonalizedInsights] = useState(true);

  // Notifications
  const [pushNotifs, setPushNotifs] = useState(true);
  const [medReminders, setMedReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);

  // Privacy
  const [twoFA, setTwoFA] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);

  // App
  const [darkMode, setDarkMode] = useState(false);

  // Dialogs
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePassOpen, setChangePassOpen] = useState(false);
  const [emailPhoneOpen, setEmailPhoneOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dataSharingOpen, setDataSharingOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Edit Profile form
  const [profileName, setProfileName] = useState("Alex Kumar");
  const [profileBio, setProfileBio] = useState("Health enthusiast");

  // Password form
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Email/Phone form
  const [email, setEmail] = useState("alex.kumar@email.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const lang = language;

  const handleDarkMode = (on: boolean) => {
    setDarkMode(on);
    document.documentElement.classList.toggle("dark", on);
    toast.success(on ? "Dark mode enabled" : "Light mode enabled");
  };

  const handleSaveProfile = () => {
    setEditProfileOpen(false);
    toast.success("Profile updated successfully");
  };

  const handleChangePassword = () => {
    if (!currentPass || !newPass) return toast.error("Please fill all fields");
    if (newPass !== confirmPass) return toast.error("Passwords don't match");
    if (newPass.length < 8) return toast.error("Password must be at least 8 characters");
    setChangePassOpen(false);
    setCurrentPass(""); setNewPass(""); setConfirmPass("");
    toast.success("Password changed successfully");
  };

  const handleUpdateEmailPhone = () => {
    setEmailPhoneOpen(false);
    toast.success("Contact info updated");
  };

  const handleDeleteAccount = () => {
    if (deleteConfirm !== "DELETE") return toast.error("Type DELETE to confirm");
    setDeleteOpen(false);
    setDeleteConfirm("");
    toast.success("Account deletion requested. You'll receive a confirmation email.");
  };

  const handleDownloadData = () => {
    toast.success("Your health data export has been started. You'll receive a download link via email.");
  };

  const handleTwoFA = (on: boolean) => {
    setTwoFA(on);
    toast.success(on ? "Two-factor authentication enabled" : "Two-factor authentication disabled");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">{t(lang, "settingsTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t(lang, "settingsDesc")}</p>
      </div>

      {/* Account Settings */}
      <Section title={t(lang, "accountSettings")} delay={0}>
        <SettingRow icon={User} label={t(lang, "editProfile")} onClick={() => setEditProfileOpen(true)} />
        <SettingRow icon={Lock} label={t(lang, "changePassword")} onClick={() => setChangePassOpen(true)} />
        <SettingRow icon={Mail} label={t(lang, "emailPhoneUpdate")} onClick={() => setEmailPhoneOpen(true)} />
        <SettingRow icon={Camera} label={t(lang, "profilePhotoUpload")} onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = () => toast.success("Profile photo uploaded successfully");
          input.click();
        }} />
      </Section>

      {/* Health Preferences */}
      <Section title={t(lang, "healthPreferences")} delay={0.05}>
        <SettingRow icon={Target} label={t(lang, "dailyStepGoal")}>
          <Input value={stepGoal} onChange={e => setStepGoal(e.target.value)} className="w-28 h-8 text-xs text-right" type="number" />
        </SettingRow>
        <SettingRow icon={Moon} label={t(lang, "sleepTargetHours")}>
          <Input value={sleepTarget} onChange={e => setSleepTarget(e.target.value)} className="w-20 h-8 text-xs text-right" type="number" />
        </SettingRow>
        <SettingRow icon={Droplets} label={t(lang, "waterIntakeGoal")}>
          <Input value={waterGoal} onChange={e => setWaterGoal(e.target.value)} className="w-20 h-8 text-xs text-right" type="number" step="0.5" />
        </SettingRow>
        <SettingRow icon={Apple} label={t(lang, "sugarIntakeLimit")}>
          <Input value={sugarLimit} onChange={e => setSugarLimit(e.target.value)} className="w-20 h-8 text-xs text-right" type="number" />
        </SettingRow>
        <SettingRow icon={Ruler} label={t(lang, "units")}>
          <Select value={units} onValueChange={v => { setUnits(v); toast.success(`Units changed to ${v}`); }}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">kg / km</SelectItem>
              <SelectItem value="imperial">lb / miles</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </Section>

      {/* AI & Personalization */}
      <Section title={t(lang, "aiPersonalization")} delay={0.1}>
        <SettingRow icon={Brain} label={t(lang, "aiSensitivity")}>
          <div className="flex gap-1 bg-muted rounded-lg p-0.5">
            {(["low", "medium", "high"] as const).map(v => (
              <button key={v} onClick={() => { setAiSensitivity(v); toast.success(`AI sensitivity set to ${v}`); }} className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${aiSensitivity === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>{t(lang, v)}</button>
            ))}
          </div>
        </SettingRow>
        <SettingRow icon={MessageCircle} label={t(lang, "enableAICompanion")}>
          <Switch checked={aiCompanionEnabled} onCheckedChange={v => { setAiCompanionEnabled(v); toast.success(v ? "AI Companion enabled" : "AI Companion disabled"); }} />
        </SettingRow>
        <SettingRow icon={Smile} label={t(lang, "moodReminders")}>
          <Switch checked={moodReminders} onCheckedChange={v => { setMoodReminders(v); toast.success(v ? "Mood reminders enabled" : "Mood reminders disabled"); }} />
        </SettingRow>
        <SettingRow icon={Sparkles} label={t(lang, "personalizedInsights")}>
          <Switch checked={personalizedInsights} onCheckedChange={v => { setPersonalizedInsights(v); toast.success(v ? "Insights enabled" : "Insights disabled"); }} />
        </SettingRow>
      </Section>

      {/* Notifications */}
      <Section title={t(lang, "notificationsTitle")} delay={0.15}>
        <SettingRow icon={BellRing} label={t(lang, "pushNotifications")}>
          <Switch checked={pushNotifs} onCheckedChange={v => { setPushNotifs(v); toast.success(v ? "Push notifications enabled" : "Push notifications disabled"); }} />
        </SettingRow>
        <SettingRow icon={Pill} label={t(lang, "medicationReminders")}>
          <Switch checked={medReminders} onCheckedChange={v => { setMedReminders(v); toast.success(v ? "Med reminders on" : "Med reminders off"); }} />
        </SettingRow>
        <SettingRow icon={FileBarChart} label={t(lang, "weeklyHealthReport")}>
          <Switch checked={weeklyReport} onCheckedChange={v => { setWeeklyReport(v); toast.success(v ? "Weekly report on" : "Weekly report off"); }} />
        </SettingRow>
        <SettingRow icon={AlertTriangle} label={t(lang, "riskAlertNotifications")}>
          <Switch checked={riskAlerts} onCheckedChange={v => { setRiskAlerts(v); toast.success(v ? "Risk alerts on" : "Risk alerts off"); }} />
        </SettingRow>
      </Section>

      {/* Privacy & Security */}
      <Section title={t(lang, "privacySecurity")} delay={0.2}>
        <SettingRow icon={Shield} label={t(lang, "twoFactorAuth")}>
          <Switch checked={twoFA} onCheckedChange={handleTwoFA} />
        </SettingRow>
        <SettingRow icon={Share2} label={t(lang, "dataSharingPermissions")} onClick={() => setDataSharingOpen(true)}>
          <span className="text-xs text-muted-foreground">{dataSharing ? t(lang, "enabled") : t(lang, "disabled")}</span>
        </SettingRow>
        <SettingRow icon={Download} label={t(lang, "downloadHealthData")} onClick={handleDownloadData} />
        <SettingRow icon={Trash2} label={t(lang, "deleteAccount")} danger onClick={() => setDeleteOpen(true)} />
      </Section>

      {/* App Preferences */}
      <Section title={t(lang, "appPreferences")} delay={0.25}>
        <SettingRow icon={Sun} label={t(lang, "darkMode")}>
          <Switch checked={darkMode} onCheckedChange={handleDarkMode} />
        </SettingRow>
        <SettingRow icon={Languages} label={t(lang, "language")}>
          <Select value={language} onValueChange={v => { setLanguage(v as "en" | "hi"); toast.success("Language updated"); }}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिन्दी</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow icon={Accessibility} label={t(lang, "accessibility")} onClick={() => setAccessibilityOpen(true)}>
          <span className="text-xs text-muted-foreground capitalize">{fontSize}</span>
        </SettingRow>
      </Section>

      {/* Support */}
      <Section title={t(lang, "support")} delay={0.3}>
        <SettingRow icon={HelpCircle} label={t(lang, "helpCenter")} onClick={() => toast.info("Help Center: Visit our docs at preventx.health/help")} />
        <SettingRow icon={Headphones} label={t(lang, "contactSupport")} onClick={() => toast.info("Email: support@preventx.health")} />
        <SettingRow icon={Flag} label={t(lang, "reportProblem")} onClick={() => toast.info("Report submitted. We'll review shortly.")} />
        <SettingRow icon={Info} label={t(lang, "aboutPreventX")} onClick={() => setAboutOpen(true)} />
      </Section>

      <div className="pb-6" />

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t(lang, "editProfile")}</DialogTitle><DialogDescription>{t(lang, "displayName")}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>{t(lang, "displayName")}</Label><Input value={profileName} onChange={e => setProfileName(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t(lang, "bio")}</Label><Input value={profileBio} onChange={e => setProfileBio(e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={handleSaveProfile}>{t(lang, "save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePassOpen} onOpenChange={setChangePassOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t(lang, "changePassword")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>{t(lang, "currentPassword")}</Label>
              <div className="relative"><Input type={showPass ? "text" : "password"} value={currentPass} onChange={e => setCurrentPass(e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            <div className="space-y-2"><Label>{t(lang, "newPassword")}</Label><Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t(lang, "confirmNewPassword")}</Label><Input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={handleChangePassword}>{t(lang, "updatePassword")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email & Phone Dialog */}
      <Dialog open={emailPhoneOpen} onOpenChange={setEmailPhoneOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t(lang, "emailPhoneUpdate")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>{t(lang, "email")}</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t(lang, "phone")}</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={handleUpdateEmailPhone}>{t(lang, "save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Sharing Dialog */}
      <Dialog open={dataSharingOpen} onOpenChange={setDataSharingOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t(lang, "dataSharingPermissions")}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Share anonymized data for research</span>
              <Switch checked={dataSharing} onCheckedChange={setDataSharing} />
            </div>
            <p className="text-xs text-muted-foreground">Your data is always encrypted and never sold to third parties.</p>
          </div>
          <DialogFooter><Button onClick={() => { setDataSharingOpen(false); toast.success("Preferences saved"); }}>{t(lang, "save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Accessibility Dialog */}
      <Dialog open={accessibilityOpen} onOpenChange={setAccessibilityOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t(lang, "accessibility")}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select value={fontSize} onValueChange={v => setFontSize(v as "small" | "medium" | "large")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={() => { setAccessibilityOpen(false); toast.success("Accessibility settings saved"); }}>{t(lang, "save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-destructive">{t(lang, "deleteAccount")}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground">{t(lang, "typeDelete")}</p>
            <Input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="DELETE" />
          </div>
          <DialogFooter><Button variant="destructive" onClick={handleDeleteAccount}>{t(lang, "deleteMyAccount")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* About Dialog */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>PreventX</DialogTitle><DialogDescription>Version 1.0.0</DialogDescription></DialogHeader>
          <div className="py-4"><p className="text-sm text-muted-foreground">PreventX is a preventive healthcare platform focused on early health risk detection, personal health tracking, and preventive care guidance.</p></div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
