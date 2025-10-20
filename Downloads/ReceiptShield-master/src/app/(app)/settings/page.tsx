"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Bell, Shield, Palette, Database, LogOut } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    profile: {
      name: "John Doe",
      email: "john.doe@company.com",
      role: "Employee",
      department: "Engineering"
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      budgetAlerts: true,
      fraudAlerts: true,
      systemUpdates: false
    },
    preferences: {
      theme: "system",
      language: "en",
      timezone: "UTC",
      currency: "USD",
      dateFormat: "MM/DD/YYYY"
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      loginAlerts: true,
      passwordExpiry: 90
    }
  });

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
    
    // Save to localStorage
    localStorage.setItem('userSettings', JSON.stringify({
      ...settings,
      [category]: {
        ...settings[category as keyof typeof settings],
        [key]: value
      }
    }));
    
    alert(`Setting updated: ${key} = ${value}`);
  };

  const handleSaveProfile = () => {
    alert("Profile updated successfully!");
    // In a real app, this would save to the backend
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deletion initiated. You will receive a confirmation email.");
      // In a real app, this would initiate account deletion
    }
  };

  const handleSignOut = () => {
    if (confirm("Are you sure you want to sign out of all devices?")) {
      alert("Signed out of all devices successfully!");
      // In a real app, this would invalidate all sessions
    }
  };

  return (
    <div className="space-y-6 p-6 bg-[var(--color-bg)] text-[var(--color-text)]">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">Settings</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Palette className="h-4 w-4 mr-2" />
                Appearance
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Database className="h-4 w-4 mr-2" />
                Data & Privacy
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={settings.profile.name}
                    onChange={(e) => handleSettingChange("profile", "name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => handleSettingChange("profile", "email", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={settings.profile.role}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={settings.profile.department}
                    onChange={(e) => handleSettingChange("profile", "department", e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => handleSettingChange("notifications", "email", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-gray-600">Receive push notifications in browser</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => handleSettingChange("notifications", "push", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-600">Receive critical alerts via SMS</p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={settings.notifications.sms}
                  onCheckedChange={(checked) => handleSettingChange("notifications", "sms", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="budget-alerts">Budget Alerts</Label>
                  <p className="text-sm text-gray-600">Get notified when approaching budget limits</p>
                </div>
                <Switch
                  id="budget-alerts"
                  checked={settings.notifications.budgetAlerts}
                  onCheckedChange={(checked) => handleSettingChange("notifications", "budgetAlerts", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="fraud-alerts">Fraud Alerts</Label>
                  <p className="text-sm text-gray-600">Receive alerts for suspicious activity</p>
                </div>
                <Switch
                  id="fraud-alerts"
                  checked={settings.notifications.fraudAlerts}
                  onCheckedChange={(checked) => handleSettingChange("notifications", "fraudAlerts", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <Switch
                  id="two-factor"
                  checked={settings.security.twoFactor}
                  onCheckedChange={(checked) => handleSettingChange("security", "twoFactor", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="login-alerts">Login Alerts</Label>
                  <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                </div>
                <Switch
                  id="login-alerts"
                  checked={settings.security.loginAlerts}
                  onCheckedChange={(checked) => handleSettingChange("security", "loginAlerts", checked)}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSettingChange("security", "sessionTimeout", parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-red-600">Delete Account</h3>
                  <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-red-600">Sign Out</h3>
                  <p className="text-sm text-gray-600">Sign out of all devices</p>
                </div>
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
