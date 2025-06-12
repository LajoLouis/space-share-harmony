import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  Edit, 
  Upload, 
  Camera,
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  Check,
  AlertCircle,
  Star,
  Heart,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfileStore } from '@/stores/profileStore';
import { profileService } from '@/services/profile.service';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Profile() {
  const navigate = useNavigate();
  const { user, getFullName, getUserInitials } = useAuth();
  const { profile, isLoading, setProfile } = useProfileStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    occupation: '',
    education: '',
    phone: '',
    location: {
      city: '',
      state: '',
      country: ''
    }
  });

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        occupation: profile.occupation || '',
        education: profile.education || '',
        phone: profile.phone || '',
        location: {
          city: profile.location?.city || '',
          state: profile.location?.state || '',
          country: profile.location?.country || ''
        }
      });
    }
  }, [profile]);

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      const response = await profileService.getProfile(user.id);
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      const response = await profileService.updateProfile(user.id, formData);
      
      if (response.success) {
        setProfile({ ...profile, ...formData } as any);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        occupation: profile.occupation || '',
        education: profile.education || '',
        phone: profile.phone || '',
        location: {
          city: profile.location?.city || '',
          state: profile.location?.state || '',
          country: profile.location?.country || ''
        }
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fullName = getFullName();
  const initials = getUserInitials();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600">Manage your profile information</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      {isEditing ? (
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          placeholder="Tell others about yourself..."
                          rows={4}
                        />
                      ) : (
                        <p className="text-gray-700 mt-1">
                          {formData.bio || 'No bio added yet.'}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="occupation">Occupation</Label>
                        {isEditing ? (
                          <Input
                            id="occupation"
                            value={formData.occupation}
                            onChange={(e) => handleInputChange('occupation', e.target.value)}
                            placeholder="Your job title"
                          />
                        ) : (
                          <p className="text-gray-700 mt-1">
                            {formData.occupation || 'Not specified'}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="education">Education</Label>
                        {isEditing ? (
                          <select
                            id="education"
                            value={formData.education}
                            onChange={(e) => handleInputChange('education', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="">Select education level</option>
                            <option value="high-school">High School</option>
                            <option value="some-college">Some College</option>
                            <option value="bachelors">Bachelor's Degree</option>
                            <option value="masters">Master's Degree</option>
                            <option value="phd">PhD</option>
                            <option value="other">Other</option>
                          </select>
                        ) : (
                          <p className="text-gray-700 mt-1">
                            {formData.education ? 
                              formData.education.split('-').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ') 
                              : 'Not specified'
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                        />
                      ) : (
                        <p className="text-gray-700 mt-1">
                          {formData.phone || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Location</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        {isEditing ? (
                          <Input
                            id="city"
                            value={formData.location.city}
                            onChange={(e) => handleInputChange('location.city', e.target.value)}
                            placeholder="San Francisco"
                          />
                        ) : (
                          <p className="text-gray-700 mt-1">
                            {formData.location.city || 'Not specified'}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="state">State</Label>
                        {isEditing ? (
                          <Input
                            id="state"
                            value={formData.location.state}
                            onChange={(e) => handleInputChange('location.state', e.target.value)}
                            placeholder="California"
                          />
                        ) : (
                          <p className="text-gray-700 mt-1">
                            {formData.location.state || 'Not specified'}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="country">Country</Label>
                        {isEditing ? (
                          <Input
                            id="country"
                            value={formData.location.country}
                            onChange={(e) => handleInputChange('location.country', e.target.value)}
                            placeholder="United States"
                          />
                        ) : (
                          <p className="text-gray-700 mt-1">
                            {formData.location.country || 'Not specified'}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lifestyle">
                <Card>
                  <CardContent className="p-12 text-center">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Lifestyle Preferences</h3>
                    <p className="text-gray-600">Lifestyle editing coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences">
                <Card>
                  <CardContent className="p-12 text-center">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Roommate Preferences</h3>
                    <p className="text-gray-600">Preference editing coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{fullName}</h3>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email:</span>
                    <div className="flex items-center space-x-1">
                      {user?.isEmailVerified ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      )}
                      <span className="text-sm">
                        {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>

                  {formData.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <div className="flex items-center space-x-1">
                        {user?.isPhoneVerified ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                        )}
                        <span className="text-sm">
                          {user?.isPhoneVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Button variant="outline" className="w-full">
                  <Camera className="w-4 h-4 mr-2" />
                  Update Photos
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  View Messages
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="w-4 h-4 mr-2" />
                  Manage Favorites
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Star className="w-4 h-4 mr-2" />
                  Discovery Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
