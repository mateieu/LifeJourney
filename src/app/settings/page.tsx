import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaTrophy, FaUserFriends, FaMoon, FaSun, FaToggleOn, FaQuestion, FaChevronRight, FaSignOutAlt, FaTrash } from 'react-icons/fa';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MainLayout } from '@/components/layouts/main-layout';

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    notifications: {
      reminderNotifications: true,
      achievementNotifications: true,
      friendActivityNotifications: true
    },
    appearance: {
      darkMode: true,
      soundEffects: true
    },
    privacy: {
      showActivityToFriends: true,
      showProfileInSearch: true
    },
    connectedDevices: {
      appleHealth: true,
      googleFit: true,
      fitbit: true
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSetting = (section: string, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof settings],
        [setting]: !prev[section as keyof typeof settings][setting as keyof typeof settings]
      }
    }));
  };

  const handleSignOut = () => {
    // Implement sign out logic
  };

  const handleAccountDeletion = () => {
    // Implement account deletion logic
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-8">Settings</h1>
        
        {/* Notifications Settings */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          
          <Card>
            <div className="divide-y">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <FaTrophy className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Reminder Notifications</h3>
                    <p className="text-sm text-muted-foreground">Get notified about important events</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.notifications.reminderNotifications}
                  onCheckedChange={() => toggleSetting('notifications', 'reminderNotifications')}
                />
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <FaTrophy className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Achievement Notifications</h3>
                    <p className="text-sm text-muted-foreground">Get notified when you earn achievements</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.notifications.achievementNotifications}
                  onCheckedChange={() => toggleSetting('notifications', 'achievementNotifications')}
                />
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <FaUserFriends className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Friend Activity</h3>
                    <p className="text-sm text-muted-foreground">Get notified about friend achievements</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.notifications.friendActivityNotifications}
                  onCheckedChange={() => toggleSetting('notifications', 'friendActivityNotifications')}
                />
              </div>
            </div>
          </Card>
        </div>
        
        {/* Appearance Settings */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>
          
          <Card>
            <div className="divide-y">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    {settings.appearance.darkMode ? 
                      <FaMoon className="h-4 w-4 text-primary" /> : 
                      <FaSun className="h-4 w-4 text-primary" />
                    }
                  </div>
                  <div>
                    <h3 className="font-medium">Dark Mode</h3>
                    <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.appearance.darkMode}
                  onCheckedChange={() => toggleSetting('appearance', 'darkMode')}
                />
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <FaToggleOn className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Sound Effects</h3>
                    <p className="text-sm text-muted-foreground">Enable sounds for achievements and actions</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.appearance.soundEffects}
                  onCheckedChange={() => toggleSetting('appearance', 'soundEffects')}
                />
              </div>
            </div>
          </Card>
        </div>
        
        {/* Privacy Settings */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Privacy</h2>
          
          <Card>
            <div className="divide-y">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <FaUserFriends className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Show Activity to Friends</h3>
                    <p className="text-sm text-muted-foreground">Let friends see your progress and achievements</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.privacy.showActivityToFriends}
                  onCheckedChange={() => toggleSetting('privacy', 'showActivityToFriends')}
                />
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <FaUser className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Show Profile in Search</h3>
                    <p className="text-sm text-muted-foreground">Allow others to find you by name or email</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.privacy.showProfileInSearch}
                  onCheckedChange={() => toggleSetting('privacy', 'showProfileInSearch')}
                />
              </div>
            </div>
          </Card>
        </div>
        
        {/* Connected Devices */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Connected Devices & Services</h2>
          
          <Card>
            <div className="divide-y">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <FaApple className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Apple Health</h3>
                    <p className="text-sm text-muted-foreground">Sync data with Apple Health</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.connectedDevices.appleHealth}
                  onCheckedChange={() => toggleSetting('connectedDevices', 'appleHealth')}
                />
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <FaGoogle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Google Fit</h3>
                    <p className="text-sm text-muted-foreground">Sync data with Google Fit</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.connectedDevices.googleFit}
                  onCheckedChange={() => toggleSetting('connectedDevices', 'googleFit')}
                />
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <FaFitbit className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Fitbit</h3>
                    <p className="text-sm text-muted-foreground">Sync data with Fitbit</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.connectedDevices.fitbit}
                  onCheckedChange={() => toggleSetting('connectedDevices', 'fitbit')}
                />
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <FaBluetoothB className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Connect New Device</h3>
                    <p className="text-sm text-muted-foreground">Add a new wearable or fitness device</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/settings/devices')}
                >
                  Connect
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Help & Support */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Help & Support</h2>
          
          <Card>
            <div className="divide-y">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <FaQuestion className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Help Center</h3>
                    <p className="text-sm text-muted-foreground">View FAQs and guides</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.push('/help')}
                >
                  <FaChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <FaQuestion className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Contact Support</h3>
                    <p className="text-sm text-muted-foreground">Get help from our team</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.push('/help/contact')}
                >
                  <FaChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <FaQuestion className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Terms & Privacy</h3>
                    <p className="text-sm text-muted-foreground">Read our policies</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.push('/legal')}
                >
                  <FaChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Account Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Account Actions</h2>
          
          <Card>
            <div className="divide-y">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                    <FaSignOutAlt className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Sign Out</h3>
                    <p className="text-sm text-muted-foreground">Log out of your account</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isSubmitting}
                >
                  Sign Out
                </Button>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <div className="p-4 flex items-center justify-between cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                        <FaTrash className="h-4 w-4 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Delete Account</h3>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-500"
                    >
                      Delete
                    </Button>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Account</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="confirm-delete" className="mb-2 block">
                      Type "DELETE" to confirm account deletion:
                    </Label>
                    <Input id="confirm-delete" placeholder="DELETE" className="mb-2" />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {}}>Cancel</Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleAccountDeletion}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Deleting...' : 'Delete Account'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        </div>
        
        <div className="text-center text-sm text-muted-foreground mb-8">
          <p>VitalQuest v1.0.0</p>
          <p>© 2023 VitalQuest. All rights reserved.</p>
        </div>
      </div>
    </MainLayout>
  );
} 