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
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Toggle,
  Avatar,
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
      <div className="p-6 lg:p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
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

                  <div className="flex items-center gap-4 mb-6">
                    <Avatar
                      src={session.user?.image}
                      name={session.user?.name || ""}
                      size="lg"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Profile Photo</p>
                      <p className="text-sm text-gray-500">
                        Connected via your authentication provider
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Display Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
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

            {/* Password Section */}
            {activeSection === "password" && (
              <Card>
                <CardContent>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Change Password
                  </h2>

                  <div className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />

                    <Input
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />

                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  <p className="text-sm text-gray-500 mt-4">
                    Password must be at least 8 characters long.
                  </p>

                  <div className="mt-6 flex justify-end">
                    <Button onClick={changePassword} disabled={loading}>
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Update Password
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
                      label="Email Notifications"
                      description="Receive email notifications about new content, messages, and updates"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />

                    <Toggle
                      label="Marketing Emails"
                      description="Receive promotional emails about new features and offers"
                      checked={marketingEmails}
                      onChange={(e) => setMarketingEmails(e.target.checked)}
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

            {/* Privacy Section */}
            {activeSection === "privacy" && (
              <Card>
                <CardContent>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Privacy Settings
                  </h2>

                  <div className="space-y-6">
                    <Toggle
                      label="Public Profile"
                      description="Allow others to see your profile and subscriptions"
                      checked={profilePublic}
                      onChange={(e) => setProfilePublic(e.target.checked)}
                    />
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button onClick={savePrivacy} disabled={loading}>
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

            {/* Connected Accounts Section */}
            {activeSection === "connections" && (
              <Card>
                <CardContent>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Connected Accounts
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border">
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                          <p className="font-medium text-gray-900">Google</p>
                          <p className="text-sm text-gray-500">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        Connected
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Danger Zone Section */}
            {activeSection === "danger" && (
              <Card className="border-red-200">
                <CardContent>
                  <h2 className="text-lg font-semibold text-red-600 mb-2">
                    Danger Zone
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>

                  {!showDeleteConfirm ? (
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete Account
                    </Button>
                  ) : (
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-800 mb-4">
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data including subscriptions and content.
                      </p>
                      <p className="text-sm text-red-800 mb-3">
                        Type <strong>DELETE</strong> to confirm:
                      </p>
                      <Input
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="DELETE"
                        className="mb-4"
                      />
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-red-600 hover:bg-red-700"
                          onClick={deleteAccount}
                          disabled={loading || deleteConfirmText !== "DELETE"}
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Delete My Account"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
