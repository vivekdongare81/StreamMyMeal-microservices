import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userService, ProfileResponse } from "@/services";
import { devLog, devError } from "@/lib/logger";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      devLog('[ProfilePage] Fetching user profile...');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        const profile = await userService.getProfile(token);
        devLog('[ProfilePage] Profile loaded:', profile); // Log the full profile object
        setUserData(profile);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
        devError('[ProfilePage] Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!userData) return;
    devLog('[ProfilePage] Attempting to update profile:', userData);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const updated = await userService.updateProfile(token, userData);
      setUserData(updated);
    setEditMode(false);
      devLog('[ProfilePage] Profile updated successfully:', updated);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      devError('[ProfilePage] Failed to update profile:', err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!userData) return null;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        {!editMode && (
          <Button onClick={() => { setEditMode(true); devLog('[ProfilePage] Switched to edit mode'); }}>Edit Profile</Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={userData.username}
                  onChange={(e) => setUserData({...userData, username: e.target.value})}
                  disabled={!editMode}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  disabled
                  className="mt-1 bg-gray-100"
                />
              </div>
              
              {/* Remove phone field as it's not present in ProfileResponse */}

              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input
                  id="address"
                  value={userData.address || ''}
                  onChange={(e) => setUserData({...userData, address: e.target.value})}
                  disabled={!editMode}
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Payment Method</Label>
                <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                  <div className="font-medium">Cash on Delivery</div>
                  <p className="text-sm text-gray-600 mt-1">Pay when you receive your order</p>
                </div>
              </div>
            </div>

            {editMode && (
              <div className="flex justify-end space-x-4 mt-6">
                <Button variant="outline" onClick={() => { setEditMode(false); devLog('[ProfilePage] Cancelled edit mode'); }}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Saved Address</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {userData.address || 'No address on file'}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
