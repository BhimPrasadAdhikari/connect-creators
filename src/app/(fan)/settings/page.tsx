"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Bell,
  Shield,
  Link2,
  AlertTriangle,
  Save,
  Loader2,
  Check,
  ChevronRight,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Toggle,
  Avatar,
  CardHeader,
  CardTitle,
} from "@/components/ui";

interface UserSettings {
  name: string;
  email: string;
  image: string | null;
  emailNotifications: boolean;
  marketingEmails: boolean;
  profilePublic: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile settings
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Password settings
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Privacy settings
  const [profilePublic, setProfilePublic] = useState(true);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings/profile");
      if (res.ok) {
        const data = await res.json();
        setEmailNotifications(data.emailNotifications ?? true);
        setMarketingEmails(data.marketingEmails ?? false);
        setProfilePublic(data.profilePublic ?? true);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  }

  async function saveProfile() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }

      await update({ name });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function changePassword() {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  async function saveNotifications() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailNotifications, marketingEmails }),
      });

      if (!res.ok) {
        throw new Error("Failed to save notification settings");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function savePrivacy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePublic }),
      });

      if (!res.ok) {
        throw new Error("Failed to save privacy settings");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function deleteAccount() {
    if (deleteConfirmText !== "DELETE") {
      setError("Please type DELETE to confirm");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/api/auth/signout");
      } else {
        throw new Error("Failed to delete account");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary stroke-[3]" />
      </div>
    );
  }

  if (!session) {
    return null; // Layout handles redirect
  }

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "connections", label: "Connected Accounts", icon: Link2 },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-xl text-muted-foreground font-medium">
          Manage your account preferences and security.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <nav className="lg:col-span-3 space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            // Special styling for Danger Zone
            const isDanger = section.id === "danger";
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  w-full flex items-center justify-between px-4 py-3 border-2 transition-all duration-200 group
                  ${isActive 
                    ? isDanger 
                      ? "bg-accent-red text-white border-brutal-black shadow-brutal-sm translate-x-[-2px] translate-y-[-2px]" 
                      : "bg-primary text-white border-brutal-black shadow-brutal-sm translate-x-[-2px] translate-y-[-2px]"
                    : isDanger
                      ? "bg-card text-accent-red border-transparent hover:border-accent-red hover:bg-accent-red/10"
                      : "bg-card text-muted-foreground border-transparent hover:border-brutal-black hover:text-foreground hover:bg-accent-yellow/20"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 stroke-[2.5] ${isActive ? "scale-110" : "group-hover:scale-110"} transition-transform`} />
                  <span className="font-bold font-display uppercase tracking-wide text-sm">{section.label}</span>
                </div>
                {isActive && <ChevronRight className="w-5 h-5 stroke-[3]" />}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="lg:col-span-9">
          <Card variant="brutal" className="bg-card min-h-[500px]">
            <CardHeader className="border-b-4 border-brutal-black bg-muted/30 pb-6">
              <CardTitle className="font-display text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                {sections.find(s => s.id === activeSection)?.icon && (
                  <div className="p-2 bg-card border-2 border-brutal-black shadow-brutal-sm">
                    {(() => {
                      const Icon = sections.find(s => s.id === activeSection)!.icon;
                      return <Icon className="w-6 h-6 stroke-[2.5]" />;
                    })()}
                  </div>
                )}
                {sections.find(s => s.id === activeSection)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 lg:p-8 space-y-8">
              {/* Success/Error Messages */}
              {saved && (
                <div className="p-4 bg-accent-green/10 border-2 border-accent-green text-accent-green-darker font-bold flex items-center gap-3 shadow-brutal-sm animate-in fade-in slide-in-from-top-2">
                  <div className="w-8 h-8 bg-accent-green text-white border-2 border-accent-green-darker flex items-center justify-center">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <span className="uppercase tracking-wide font-mono text-sm">Settings saved successfully!</span>
                </div>
              )}
              {error && (
                <div className="p-4 bg-accent-red/10 border-2 border-accent-red text-accent-red font-bold animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 stroke-[3]" />
                    <span className="uppercase tracking-wide font-mono text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Profile Section */}
              {activeSection === "profile" && (
                <div className="space-y-8 max-w-2xl">
                  <div className="flex items-center gap-6 p-6 border-2 border-brutal-black bg-muted/20 border-dashed">
                    <div className="border-2 border-brutal-black p-1 bg-card shadow-brutal-sm">
                      <Avatar
                        src={session.user?.image}
                        name={session.user?.name || ""}
                        size="lg"
                        className="rounded-none w-20 h-20"
                      />
                    </div>
                    <div>
                      <p className="font-black text-lg uppercase font-display mb-1">Profile Photo</p>
                      <p className="text-sm font-mono text-muted-foreground bg-card px-2 py-1 border border-brutal-black inline-block">
                        Managed via OAuth Provider
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase font-mono tracking-wide">Display Name</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="YOUR NAME"
                        className="font-bold text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase font-mono tracking-wide">Email Address</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="YOUR@EMAIL.COM"
                        className="font-bold text-lg"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-brutal-black border-dashed flex justify-end">
                    <Button onClick={saveProfile} disabled={loading} variant="brutal-accent" size="lg">
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <Save className="w-5 h-5 mr-2 stroke-[3]" />
                      )}
                      SAVE CHANGES
                    </Button>
                  </div>
                </div>
              )}

              {/* Password Section */}
              {activeSection === "password" && (
                <div className="space-y-8 max-w-2xl">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase font-mono tracking-wide">Current Password</label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase font-mono tracking-wide">New Password</label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase font-mono tracking-wide">Confirm New Password</label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border-2 border-blue-500 text-blue-700 text-sm font-mono font-bold flex items-center gap-3">
                     <Shield className="w-5 h-5" />
                     PASSWORD MUST BE AT LEAST 8 CHARACTERS LONG
                  </div>

                  <div className="pt-4 border-t-2 border-brutal-black border-dashed flex justify-end">
                    <Button onClick={changePassword} disabled={loading} variant="brutal-accent" size="lg">
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <Save className="w-5 h-5 mr-2 stroke-[3]" />
                      )}
                      UPDATE PASSWORD
                    </Button>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <div className="space-y-8 max-w-2xl">
                  <div className="space-y-6">
                    <div className="p-6 border-2 border-brutal-black bg-card shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform">
                      <Toggle
                        label="Email Notifications"
                        description="Receive email notifications about new content, messages, and updates"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                      />
                    </div>

                    <div className="p-6 border-2 border-brutal-black bg-card shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform">
                      <Toggle
                        label="Marketing Emails"
                        description="Receive promotional emails about new features and offers"
                        checked={marketingEmails}
                        onChange={(e) => setMarketingEmails(e.target.checked)}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-brutal-black border-dashed flex justify-end">
                    <Button onClick={saveNotifications} disabled={loading} variant="brutal-accent" size="lg">
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <Save className="w-5 h-5 mr-2 stroke-[3]" />
                      )}
                      SAVE PREFERENCES
                    </Button>
                  </div>
                </div>
              )}

              {/* Privacy Section */}
              {activeSection === "privacy" && (
                <div className="space-y-8 max-w-2xl">
                  <div className="space-y-6">
                     <div className="p-6 border-2 border-brutal-black bg-card shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform">
                      <Toggle
                        label="Public Profile"
                        description="Allow others to see your profile and subscriptions"
                        checked={profilePublic}
                        onChange={(e) => setProfilePublic(e.target.checked)}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-brutal-black border-dashed flex justify-end">
                     <Button onClick={savePrivacy} disabled={loading} variant="brutal-accent" size="lg">
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <Save className="w-5 h-5 mr-2 stroke-[3]" />
                      )}
                      SAVE SETTINGS
                    </Button>
                  </div>
                </div>
              )}

              {/* Connected Accounts Section */}
              {activeSection === "connections" && (
                <div className="space-y-8 max-w-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-6 border-2 border-brutal-black bg-card shadow-brutal-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 border-2 border-brutal-black flex items-center justify-center p-2 bg-card shadow-[2px_2px_0_0_#000]">
                          <svg className="w-full h-full" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-black font-display uppercase text-lg">Google</p>
                          <p className="text-sm font-mono text-muted-foreground uppercase">
                            {session.user?.email || "NOT CONNECTED"}
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-accent-green text-white text-xs font-bold uppercase tracking-wider border-2 border-brutal-black shadow-[2px_2px_0_0_#000]">
                        Connected
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone Section */}
              {activeSection === "danger" && (
                <div className="space-y-8 max-w-2xl border-4 border-accent-red p-6 bg-red-50/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-accent-red text-white border-2 border-brutal-black shadow-brutal-sm">
                       <AlertTriangle className="w-8 h-8 stroke-[3]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-accent-red uppercase font-display mb-2">
                        Danger Zone
                      </h2>
                      <p className="text-foreground font-medium">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                    </div>
                  </div>

                  {!showDeleteConfirm ? (
                    <Button
                      variant="brutal"
                      className="bg-card text-accent-red border-accent-red hover:bg-accent-red hover:text-white w-full"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      DELETE ACCOUNT INTENT
                    </Button>
                  ) : (
                    <div className="p-6 bg-card border-2 border-accent-red shadow-brutal-sm">
                      <p className="text-sm font-bold text-accent-red mb-4 uppercase">
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data including subscriptions and content.
                      </p>
                      <div className="mb-4 space-y-2">
                        <label className="text-xs font-black uppercase font-mono">Type "DELETE" to confirm:</label>
                        <Input
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="DELETE"
                          className="border-accent-red focus:ring-accent-red"
                        />
                      </div>
                      <div className="flex gap-4">
                        <Button
                          variant="brutal"
                          className="flex-1"
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText("");
                          }}
                        >
                          CANCEL
                        </Button>
                        <Button
                          className="flex-1 bg-accent-red text-white border-2 border-brutal-black shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg rounded-none transition-all font-bold uppercase"
                          onClick={deleteAccount}
                          disabled={loading || deleteConfirmText !== "DELETE"}
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "PERMANENTLY DELETE"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
