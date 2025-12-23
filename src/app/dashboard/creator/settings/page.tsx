"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Link2,
  CreditCard,
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
    <div className="p-6 lg:p-12 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Creator Settings</h1>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <nav className="md:col-span-1">
            <Card>
              <CardContent className="p-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeSection === section.id
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{section.label}</span>
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
                <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Settings saved successfully!
                </div>
              )}
              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Profile Section */}
              {activeSection === "profile" && (
                <Card>
                  <CardContent>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                      Profile Settings
                    </h2>

                    <div className="space-y-4">
                      <Input
                        label="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your public display name"
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">
                          Username
                        </label>
                        <div className="flex items-center">
                          <span className="px-4 py-3 bg-gray-100 text-gray-500 border border-r-0 border-gray-200 rounded-l-lg">
                            @
                          </span>
                          <input
                            type="text"
                            value={username}
                            disabled
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-r-lg bg-gray-50 text-gray-500"
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Username cannot be changed
                        </p>
                      </div>

                      <Textarea
                        label="Bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell your fans about yourself..."
                        rows={4}
                      />
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button onClick={saveProfile} disabled={loading}>
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Social Links Section */}
              {activeSection === "social" && (
                <Card>
                  <CardContent>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                      Social Links
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">
                          Instagram
                        </label>
                        <div className="flex items-center">
                          <span className="px-4 py-3 bg-gray-100 text-gray-500 border border-r-0 border-gray-200 rounded-l-lg">
                            <Instagram className="w-5 h-5" />
                          </span>
                          <input
                            type="text"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="username"
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">
                          Twitter / X
                        </label>
                        <div className="flex items-center">
                          <span className="px-4 py-3 bg-gray-100 text-gray-500 border border-r-0 border-gray-200 rounded-l-lg">
                            <Twitter className="w-5 h-5" />
                          </span>
                          <input
                            type="text"
                            value={twitter}
                            onChange={(e) => setTwitter(e.target.value)}
                            placeholder="username"
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">
                          YouTube
                        </label>
                        <div className="flex items-center">
                          <span className="px-4 py-3 bg-gray-100 text-gray-500 border border-r-0 border-gray-200 rounded-l-lg">
                            <Youtube className="w-5 h-5" />
                          </span>
                          <input
                            type="text"
                            value={youtube}
                            onChange={(e) => setYoutube(e.target.value)}
                            placeholder="channel URL or username"
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1.5">
                          TikTok
                        </label>
                        <div className="flex items-center">
                          <span className="px-4 py-3 bg-gray-100 text-gray-500 border border-r-0 border-gray-200 rounded-l-lg text-sm font-bold">
                            TT
                          </span>
                          <input
                            type="text"
                            value={tiktok}
                            onChange={(e) => setTiktok(e.target.value)}
                            placeholder="username"
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button onClick={saveProfile} disabled={loading}>
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save Links
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Monetization Section */}
              {activeSection === "monetization" && (
                <Card>
                  <CardContent>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                      Monetization Settings
                    </h2>

                    <div className="space-y-6">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Toggle
                          label="Paid Direct Messages"
                          description="Charge fans for sending you direct messages"
                          checked={dmEnabled}
                          onChange={(e) => setDmEnabled(e.target.checked)}
                        />

                        {dmEnabled && (
                          <div className="mt-4 pl-8">
                            <label className="block text-sm font-medium text-gray-900 mb-1.5">
                              Price per message (₹)
                            </label>
                            <div className="flex items-center max-w-xs">
                              <span className="px-4 py-3 bg-gray-100 text-gray-500 border border-r-0 border-gray-200 rounded-l-lg">
                                ₹
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={dmPrice}
                                onChange={(e) => setDmPrice(e.target.value)}
                                placeholder="50"
                                className="w-full px-4 py-3 border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              Subscribers can still message you for free
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button onClick={saveMonetization} disabled={loading}>
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <Card>
                  <CardContent>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                      Notification Preferences
                    </h2>

                    <div className="space-y-6">
                      <Toggle
                        label="New Subscriber"
                        description="Get notified when someone subscribes to you"
                        checked={newSubscriberNotif}
                        onChange={(e) => setNewSubscriberNotif(e.target.checked)}
                      />

                      <Toggle
                        label="New Message"
                        description="Get notified when you receive a new message"
                        checked={newMessageNotif}
                        onChange={(e) => setNewMessageNotif(e.target.checked)}
                      />

                      <Toggle
                        label="New Tip"
                        description="Get notified when someone sends you a tip"
                        checked={newTipNotif}
                        onChange={(e) => setNewTipNotif(e.target.checked)}
                      />
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button onClick={saveNotifications} disabled={loading}>
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payout Section */}
              {activeSection === "payout" && (
                <Card>
                  <CardContent>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                      Payout Settings
                    </h2>

                    <div className="space-y-4">
                      <Select
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
                            label="Bank Name"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="Enter your bank name"
                          />

                          <Input
                            label="Account Number"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="Enter account number"
                          />

                          <Input
                            label="IFSC Code"
                            value={ifscCode}
                            onChange={(e) => setIfscCode(e.target.value)}
                            placeholder="Enter IFSC code"
                          />
                        </>
                      )}

                      {payoutMethod === "upi" && (
                        <Input
                          label="UPI ID"
                          placeholder="yourname@upi"
                        />
                      )}

                      {payoutMethod === "paypal" && (
                        <Input
                          label="PayPal Email"
                          type="email"
                          placeholder="your@email.com"
                        />
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mt-4">
                      Payouts are processed every Monday for the previous week&apos;s earnings.
                      Minimum payout threshold is ₹500.
                    </p>

                    <div className="mt-6 flex justify-end">
                      <Button onClick={savePayout} disabled={loading}>
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save Payout Info
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Account & Security Section */}
              {activeSection === "account" && (
                <div className="space-y-6">
                  {/* Password Change */}
                  <Card>
                    <CardContent>
                      <div className="flex items-center gap-3 mb-6">
                        <Lock className="w-5 h-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">
                          Change Password
                        </h2>
                      </div>

                      {passwordSaved && (
                        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                          <Check className="w-5 h-5" />
                          Password changed successfully!
                        </div>
                      )}
                      {passwordError && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                          {passwordError}
                        </div>
                      )}

                      <div className="space-y-4">
                        <Input
                          label="Current Password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                        />

                        <Input
                          label="New Password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <p className="text-sm text-gray-500 -mt-2">
                          Min 8 characters, include uppercase, lowercase, and number
                        </p>

                        <Input
                          label="Confirm New Password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>

                      <div className="mt-6 flex justify-end">
                        <Button
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
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                          Change Password
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Session Security */}
                  <Card>
                    <CardContent>
                      <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">
                          Session Security
                        </h2>
                      </div>

                      <p className="text-gray-600 mb-4">
                        If you suspect unauthorized access to your account, you can sign out from all devices.
                        This will require you to log in again on all devices.
                      </p>

                      <Button
                        variant="outline"
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
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LogOut className="w-4 h-4" />
                        )}
                        Sign Out All Devices
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Danger Zone */}
                  <Card className="border-red-200">
                    <CardContent>
                      <div className="flex items-center gap-3 mb-6">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h2 className="text-lg font-semibold text-red-600">
                          Danger Zone
                        </h2>
                      </div>

                      <p className="text-gray-600 mb-4">
                        Once you delete your account, there is no going back. All your content,
                        subscribers, and earnings will be permanently deleted.
                      </p>

                      <Button
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                            if (confirm("This will permanently delete all your content, subscribers, and earnings. Type 'DELETE' to confirm.")) {
                              // TODO: Implement account deletion
                              alert("Account deletion would be processed here");
                            }
                          }
                        }}
                      >
                        Delete Account
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

