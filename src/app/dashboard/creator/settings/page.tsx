"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Link2,
  Bell,
  Save,
  Loader2,
  Check,
  Instagram,
  Twitter,
  Youtube,
  Lock,
  Shield,
  AlertTriangle,
  LogOut,
  DollarSign,
  CreditCard,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Toggle,
  Select,
  Textarea,
} from "@/components/ui";
import { SettingsPageSkeleton } from "@/components/ui/Skeleton";

export default function CreatorSettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Profile settings
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");

  // Social links
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");
  const [tiktok, setTiktok] = useState("");

  // Monetization
  const [dmEnabled, setDmEnabled] = useState(false);
  const [dmPrice, setDmPrice] = useState("");

  // Notifications
  const [newSubscriberNotif, setNewSubscriberNotif] = useState(true);
  const [newMessageNotif, setNewMessageNotif] = useState(true);
  const [newTipNotif, setNewTipNotif] = useState(true);

  // Payout
  const [payoutMethod, setPayoutMethod] = useState("bank");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  // Account/Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [revokingSession, setRevokingSession] = useState(false);

  useEffect(() => {
    fetchCreatorProfile();
  }, []);

  async function fetchCreatorProfile() {
    try {
      const res = await fetch("/api/settings/creator");
      if (res.ok) {
        const data = await res.json();
        setDisplayName(data.displayName || "");
        setBio(data.bio || "");
        setUsername(data.username || "");
        setDmPrice(data.dmPrice ? String(data.dmPrice / 100) : "");
        setDmEnabled(!!data.dmPrice);

        if (data.socialLinks) {
          setInstagram(data.socialLinks.instagram || "");
          setTwitter(data.socialLinks.twitter || "");
          setYoutube(data.socialLinks.youtube || "");
          setTiktok(data.socialLinks.tiktok || "");
        }
      }
    } catch (error) {
      console.error("Failed to fetch creator profile:", error);
    } finally {
      setProfileLoading(false);
    }
  }

  async function saveProfile() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/creator", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          bio,
          socialLinks: {
            instagram: instagram || undefined,
            twitter: twitter || undefined,
            youtube: youtube || undefined,
            tiktok: tiktok || undefined,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function saveMonetization() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/creator", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dmPrice: dmEnabled ? Math.round(parseFloat(dmPrice) * 100) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save monetization settings");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function saveNotifications() {
    setLoading(true);
    setError(null);
    try {
      // Placeholder for notification settings
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function savePayout() {
    setLoading(true);
    setError(null);
    try {
      // Placeholder for payout settings
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || profileLoading) {
    return (
      <div className="p-6 lg:p-12 max-w-5xl mx-auto">
        <SettingsPageSkeleton />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "social", label: "Social Links", icon: Link2 },
    { id: "monetization", label: "Monetization", icon: DollarSign },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "payout", label: "Payout", icon: CreditCard },
    { id: "account", label: "Account & Security", icon: Shield },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-12 max-w-5xl mx-auto">
      <h1 className="font-display text-4xl font-bold text-foreground mb-8">Creator Settings</h1>

      {/* Mobile Tabs - Horizontal scroll on mobile */}
      <div className="md:hidden mb-8 -mx-4 px-4">
        <nav className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2.5 font-bold whitespace-nowrap transition-all border-2 shadow-brutal-sm ${
                  activeSection === section.id
                    ? "bg-primary text-white border-brutal-black translate-x-[-2px] translate-y-[-2px]"
                    : "bg-card text-foreground border-brutal-black hover:bg-secondary/20"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-display uppercase tracking-wide text-sm">{section.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Settings Navigation - Desktop only */}
        <nav className="md:col-span-1 hidden md:block">
          <Card variant="brutal" className="sticky top-24">
            <CardContent className="p-2 space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-2 ${
                      activeSection === section.id
                        ? "bg-primary text-white border-brutal-black shadow-brutal-sm translate-x-[-2px] translate-y-[-2px]"
                        : "bg-transparent text-muted-foreground border-transparent hover:border-brutal-black hover:bg-secondary/20 hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-display font-bold uppercase text-xs tracking-wide">{section.label}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </nav>

            {/* Content */}
            <div className="md:col-span-3">
              {/* Success/Error Messages */}
              {saved && (
                <div className="mb-6 p-4 bg-accent-green/10 border-2 border-accent-green text-green-800 flex items-center gap-3 font-bold shadow-brutal-sm">
                  <div className="w-6 h-6 bg-accent-green rounded-full flex items-center justify-center border-2 border-brutal-black text-white shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  Changes saved successfully!
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 bg-accent-red/10 border-2 border-accent-red text-red-800 font-bold shadow-brutal-sm flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              {/* Profile Section */}
              {activeSection === "profile" && (
                <Card variant="brutal" className="bg-card">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-8 border-b-4 border-brutal-black pb-4">
                      <div className="w-10 h-10 bg-accent-blue border-2 border-brutal-black flex items-center justify-center shadow-brutal-sm">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="font-display text-2xl font-bold uppercase">
                        Profile Settings
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <Input
                        variant="brutal"
                        label="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your public display name"
                      />

                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1.5 uppercase tracking-wide font-display">
                          Username
                        </label>
                        <div className="flex items-center font-mono">
                          <span className="px-4 py-3 bg-secondary/20 text-muted-foreground border-2 border-r-0 border-brutal-black font-bold">
                            @
                          </span>
                          <input
                            type="text"
                            value={username}
                            disabled
                            className="flex-1 px-4 py-3 border-2 border-brutal-black bg-muted/30 text-muted-foreground font-bold cursor-not-allowed"
                          />
                        </div>
                        <p className="font-mono text-xs font-bold text-muted-foreground mt-2">
                          Username cannot be changed
                        </p>
                      </div>

                      <Textarea
                        variant="brutal"
                        label="Bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell your fans about yourself..."
                        rows={4}
                      />
                    </div>

                    <div className="mt-8 flex justify-end pt-6 border-t-2 border-dashed border-brutal-black/20">
                      <Button variant="brutal" onClick={saveProfile} disabled={loading} size="lg">
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Social Links Section */}
              {activeSection === "social" && (
                <Card variant="brutal">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-8 border-b-4 border-brutal-black pb-4">
                      <div className="w-10 h-10 bg-accent-pink border-2 border-brutal-black flex items-center justify-center shadow-brutal-sm">
                        <Link2 className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="font-display text-2xl font-bold uppercase">
                        Social Links
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1.5 uppercase tracking-wide font-display">
                          Instagram
                        </label>
                        <div className="flex items-center">
                          <span className="px-4 py-3 bg-secondary/20 text-foreground border-2 border-r-0 border-brutal-black">
                            <Instagram className="w-5 h-5" />
                          </span>
                          <Input
                            variant="brutal"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="username"
                            className="rounded-none border-l-0"
                            containerClassName="mb-0 flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1.5 uppercase tracking-wide font-display">
                          Twitter / X
                        </label>
                        <div className="flex items-center">
                          <span className="px-4 py-3 bg-secondary/20 text-foreground border-2 border-r-0 border-brutal-black">
                            <Twitter className="w-5 h-5" />
                          </span>
                          <Input
                            variant="brutal"
                            value={twitter}
                            onChange={(e) => setTwitter(e.target.value)}
                            placeholder="username"
                            className="rounded-none border-l-0"
                            containerClassName="mb-0 flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1.5 uppercase tracking-wide font-display">
                          YouTube
                        </label>
                        <div className="flex items-center">
                          <span className="px-4 py-3 bg-secondary/20 text-foreground border-2 border-r-0 border-brutal-black">
                            <Youtube className="w-5 h-5" />
                          </span>
                          <Input
                            variant="brutal"
                            value={youtube}
                            onChange={(e) => setYoutube(e.target.value)}
                            placeholder="channel URL or username"
                            className="rounded-none border-l-0"
                            containerClassName="mb-0 flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1.5 uppercase tracking-wide font-display">
                          TikTok
                        </label>
                        <div className="flex items-center">
                          <span className="px-4 py-3 bg-secondary/20 text-foreground border-2 border-r-0 border-brutal-black font-display font-bold">
                            TT
                          </span>
                          <Input
                            variant="brutal"
                            value={tiktok}
                            onChange={(e) => setTiktok(e.target.value)}
                            placeholder="username"
                            className="rounded-none border-l-0"
                            containerClassName="mb-0 flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end pt-6 border-t-2 border-dashed border-brutal-black/20">
                      <Button variant="brutal" onClick={saveProfile} disabled={loading} size="lg">
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Links
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Monetization Section */}
              {activeSection === "monetization" && (
                <Card variant="brutal">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-8 border-b-4 border-brutal-black pb-4">
                      <div className="w-10 h-10 bg-accent-green border-2 border-brutal-black flex items-center justify-center shadow-brutal-sm">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="font-display text-2xl font-bold uppercase">
                        Monetization
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-secondary/10 border-2 border-brutal-black border-dashed">
                        <Toggle
                          label="Paid Direct Messages"
                          description="Charge fans for sending you direct messages"
                          checked={dmEnabled}
                          onChange={(e) => setDmEnabled(e.target.checked)}
                        />

                        {dmEnabled && (
                          <div className="mt-6 pl-8 border-l-2 border-brutal-black border-dashed ml-4">
                            <label className="block text-sm font-bold text-foreground mb-1.5 uppercase tracking-wide font-display">
                              Price per message (₹)
                            </label>
                            <div className="flex items-center max-w-xs font-display font-bold text-xl">
                              <span className="px-4 py-3 bg-secondary/20 text-foreground border-2 border-r-0 border-brutal-black">
                                ₹
                              </span>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                value={dmPrice}
                                onChange={(e) => setDmPrice(e.target.value)}
                                placeholder="50"
                                variant="brutal"
                                className="rounded-none border-l-0"
                                containerClassName="mb-0 w-full"
                              />
                            </div>
                            <p className="font-mono text-xs font-bold text-muted-foreground mt-2">
                              Subscribers can still message you for free
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end pt-6 border-t-2 border-dashed border-brutal-black/20">
                      <Button variant="brutal" onClick={saveMonetization} disabled={loading} size="lg">
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <Card variant="brutal">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-8 border-b-4 border-brutal-black pb-4">
                      <div className="w-10 h-10 bg-accent-yellow border-2 border-brutal-black flex items-center justify-center shadow-brutal-sm">
                        <Bell className="w-6 h-6 text-brutal-black" />
                      </div>
                      <h2 className="font-display text-2xl font-bold uppercase">
                        Notifications
                      </h2>
                    </div>

                    <div className="space-y-6 bg-secondary/5 p-6 border-2 border-brutal-black">
                      <Toggle
                        label="New Subscriber"
                        description="Get notified when someone subscribes to you"
                        checked={newSubscriberNotif}
                        onChange={(e) => setNewSubscriberNotif(e.target.checked)}
                      />

                      <div className="border-t-2 border-dashed border-brutal-black/20 my-4"></div>

                      <Toggle
                        label="New Message"
                        description="Get notified when you receive a new message"
                        checked={newMessageNotif}
                        onChange={(e) => setNewMessageNotif(e.target.checked)}
                      />

                      <div className="border-t-2 border-dashed border-brutal-black/20 my-4"></div>

                      <Toggle
                        label="New Tip"
                        description="Get notified when someone sends you a tip"
                        checked={newTipNotif}
                        onChange={(e) => setNewTipNotif(e.target.checked)}
                      />
                    </div>

                    <div className="mt-8 flex justify-end pt-6 border-t-2 border-dashed border-brutal-black/20">
                      <Button variant="brutal" onClick={saveNotifications} disabled={loading} size="lg">
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payout Section */}
              {activeSection === "payout" && (
                <Card variant="brutal">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-8 border-b-4 border-brutal-black pb-4">
                      <div className="w-10 h-10 bg-accent-purple border-2 border-brutal-black flex items-center justify-center shadow-brutal-sm">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="font-display text-2xl font-bold uppercase">
                        Payout Settings
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <Select
                        variant="brutal"
                        label="Payout Method"
                        value={payoutMethod}
                        onChange={(e) => setPayoutMethod(e.target.value)}
                        options={[
                          { value: "bank", label: "Bank Transfer" },
                          { value: "upi", label: "UPI" },
                          { value: "paypal", label: "PayPal" },
                        ]}
                      />

                      {payoutMethod === "bank" && (
                        <>
                          <Input
                            variant="brutal"
                            label="Bank Name"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="Enter your bank name"
                          />

                          <Input
                            variant="brutal"
                            label="Account Number"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="Enter account number"
                          />

                          <Input
                            variant="brutal"
                            label="IFSC Code"
                            value={ifscCode}
                            onChange={(e) => setIfscCode(e.target.value)}
                            placeholder="Enter IFSC code"
                          />
                        </>
                      )}

                      {payoutMethod === "upi" && (
                        <Input
                          variant="brutal"
                          label="UPI ID"
                          placeholder="yourname@upi"
                        />
                      )}

                      {payoutMethod === "paypal" && (
                        <Input
                          variant="brutal"
                          label="PayPal Email"
                          type="email"
                          placeholder="your@email.com"
                        />
                      )}
                    </div>

                    <div className="mt-6 p-4 bg-secondary/10 border-2 border-brutal-black border-dashed font-mono text-sm font-bold text-muted-foreground flex gap-3 items-start">
                      <div className="min-w-1.5 min-h-1.5 w-1.5 h-1.5 bg-accent-blue rounded-full mt-1.5"></div>
                      Payouts are processed every Monday for the previous week&apos;s earnings. Minimum payout threshold is ₹500.
                    </div>

                    <div className="mt-8 flex justify-end pt-6 border-t-2 border-dashed border-brutal-black/20">
                      <Button variant="brutal" onClick={savePayout} disabled={loading} size="lg">
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Payout Info
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Account & Security Section */}
              {activeSection === "account" && (
                <div className="space-y-8">
                  {/* Password Change */}
                  <Card variant="brutal">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <Lock className="w-6 h-6 text-foreground" />
                        <h2 className="font-display text-xl font-bold uppercase">
                          Change Password
                        </h2>
                      </div>

                      {passwordSaved && (
                        <div className="mb-4 p-4 bg-accent-green/10 border-2 border-accent-green text-green-800 rounded-none shadow-brutal-sm flex items-center gap-2 font-bold">
                          <Check className="w-5 h-5" />
                          Password changed successfully!
                        </div>
                      )}
                      {passwordError && (
                        <div className="mb-4 p-4 bg-accent-red/10 border-2 border-accent-red text-red-800 rounded-none shadow-brutal-sm font-bold">
                          {passwordError}
                        </div>
                      )}

                      <div className="space-y-4">
                        <Input
                          variant="brutal"
                          label="Current Password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                        />

                        <Input
                          variant="brutal"
                          label="New Password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <p className="font-mono text-xs font-bold text-muted-foreground -mt-2 mb-2">
                          Min 8 characters, include uppercase, lowercase, and number
                        </p>

                        <Input
                          variant="brutal"
                          label="Confirm New Password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>

                      <div className="mt-6 flex justify-end">
                        <Button
                          variant="brutal"
                          onClick={async () => {
                            if (newPassword !== confirmPassword) {
                              setPasswordError("Passwords do not match");
                              return;
                            }
                            if (newPassword.length < 8) {
                              setPasswordError("Password must be at least 8 characters");
                              return;
                            }
                            setLoading(true);
                            setPasswordError(null);
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
                              setPasswordSaved(true);
                              setCurrentPassword("");
                              setNewPassword("");
                              setConfirmPassword("");
                              setTimeout(() => setPasswordSaved(false), 3000);
                            } catch (err) {
                              setPasswordError(err instanceof Error ? err.message : "Failed to change password");
                            } finally {
                              setLoading(false);
                            }
                          }}
                          disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Lock className="w-4 h-4 mr-2" />
                          )}
                          Change Password
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Session Security */}
                  <Card variant="brutal" className="border-dashed">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-5 h-5 text-foreground" />
                        <h2 className="font-display text-lg font-bold uppercase">
                          Session Security
                        </h2>
                      </div>

                      <p className="font-mono text-sm text-muted-foreground mb-6 font-bold">
                        If you suspect unauthorized access to your account, you can sign out from all devices.
                        This will require you to log in again on all devices.
                      </p>

                      <Button
                        variant="ghost"
                        className="border-2 border-brutal-black hover:bg-secondary w-full sm:w-auto"
                        onClick={async () => {
                          if (!confirm("Are you sure you want to sign out from all devices?")) {
                            return;
                          }
                          setRevokingSession(true);
                          try {
                            const res = await fetch("/api/settings/sessions", {
                              method: "DELETE",
                            });
                            if (res.ok) {
                              alert("All sessions revoked. Please log in again.");
                              router.push("/login");
                            }
                          } catch (err) {
                            console.error("Failed to revoke sessions:", err);
                          } finally {
                            setRevokingSession(false);
                          }
                        }}
                        disabled={revokingSession}
                      >
                        {revokingSession ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <LogOut className="w-4 h-4 mr-2" />
                        )}
                        Sign Out All Devices
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Danger Zone */}
                  <Card variant="brutal" className="border-accent-red">
                    <CardContent className="p-6 bg-accent-red/5">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-accent-red border-2 border-brutal-black flex items-center justify-center shadow-brutal-sm text-white">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h2 className="font-display text-lg font-bold uppercase text-accent-red">
                          Danger Zone
                        </h2>
                      </div>

                      <p className="font-mono text-sm text-muted-foreground mb-6 font-bold">
                        Once you delete your account, there is no going back. All your content,
                        subscribers, and earnings will be permanently deleted.
                      </p>

                      <Button
                        variant="ghost"
                        className="text-accent-red border-2 border-accent-red hover:bg-accent-red hover:text-white w-full sm:w-auto font-bold shadow-brutal-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                            if (confirm("This will permanently delete all your content, subscribers, and earnings. Type 'DELETE' to confirm.")) {
                              // TODO: Implement account deletion
                              alert("Account deletion would be processed here");
                            }
                          }
                        }}
                      >
                        DELETE ACCOUNT
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
      </div>
    </div>
  );
}
