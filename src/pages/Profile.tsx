import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  MessageCircle,
  Wand2,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfileStore } from '@/stores/profileStore';
import { profileService } from '@/services/profile.service';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { Progress } from '@/components/ui/progress';
import { LifestyleEditor } from '@/components/profile/LifestyleEditor';
import { RoommatePreferencesEditor } from '@/components/profile/RoommatePreferencesEditor';
import { PhotoUploadModal } from '@/components/profile/PhotoUploadModal';

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, getFullName, getUserInitials } = useAuth();
  const { profile, isLoading, setProfile, calculateCompletionScore } = useProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
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

  // Handle URL parameters for editing mode and tab selection
  useEffect(() => {
    const editParam = searchParams.get('edit');
    const tabParam = searchParams.get('tab');

    if (editParam === 'true') {
      setIsEditing(true);
    }

    if (tabParam && ['basic', 'lifestyle', 'preferences'].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    // Clean up URL parameters after processing
    if (editParam || tabParam) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('edit');
      newSearchParams.delete('tab');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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

  const handleOnboardingComplete = () => {
    toast.success('Profile completed successfully!');
    setShowOnboarding(false);
    loadProfile(); // Reload profile to get updated data
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  // Handler functions for Quick Actions
  const handleUpdatePhotos = () => {
    setShowPhotoUpload(true);
  };

  const handlePhotosUploaded = () => {
    // Reload profile to get updated photos
    loadProfile();
  };

  const handleViewMessages = () => {
    navigate('/messages');
  };

  const handleManageFavorites = () => {
    toast.info('Favorites management feature coming soon!');
  };

  const handleDiscoverySettings = () => {
    toast.info('Discovery settings feature coming soon!');
  };

  const getProfileCompletion = () => {
    if (!profile) return { score: 0, missingFields: [] };

    const score = calculateCompletionScore();
    const missingFields: string[] = [];

    if (!profile.bio || profile.bio.length < 50) missingFields.push('Bio');
    if (!profile.photos || profile.photos.length === 0) missingFields.push('Photos');
    if (!profile.interests || profile.interests.length === 0) missingFields.push('Interests');
    if (!profile.roommate?.budgetRange?.min || !profile.roommate?.budgetRange?.max) missingFields.push('Budget');
    if (!profile.occupation) missingFields.push('Occupation');
    if (!profile.education) missingFields.push('Education');

    return { score, missingFields };
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
  const completion = getProfileCompletion();

  // Show onboarding wizard if requested
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
            <Button
              variant="ghost"
              onClick={() => setShowOnboarding(false)}
              className="flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </Button>
          </div>
          <OnboardingWizard
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-1 md:space-x-2 p-2 md:p-3"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm md:text-base text-gray-600 hidden sm:block">Manage your profile information</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {completion.score < 80 && (
                <Button
                  onClick={() => setShowOnboarding(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-xs md:text-sm whitespace-nowrap flex-shrink-0"
                  size="sm"
                >
                  <Wand2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Complete Profile</span>
                  <span className="sm:hidden">Complete</span>
                </Button>
              )}
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel} size="sm" className="text-xs md:text-sm flex-1 sm:flex-none">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving} size="sm" className="text-xs md:text-sm flex-1 sm:flex-none">
                    <Save className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    <span className="sm:hidden">{isSaving ? 'Saving...' : 'Save'}</span>
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)} size="sm" className="text-xs md:text-sm flex-shrink-0">
                  <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Edit Profile</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Completion Alert */}
        {completion.score < 80 && (
          <Alert className="mb-6 md:mb-8 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <Wand2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
            <AlertDescription>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-purple-900 mb-2 text-sm md:text-base">
                    Complete your profile to get better roommate matches!
                  </p>
                  <div className="flex items-center space-x-3 mb-2">
                    <Progress value={completion.score} className="w-24 sm:w-32 h-2" />
                    <span className="text-xs sm:text-sm text-purple-700 whitespace-nowrap">
                      {completion.score}% complete
                    </span>
                  </div>
                  {completion.missingFields.length > 0 && (
                    <p className="text-xs sm:text-sm text-purple-600">
                      Missing: {completion.missingFields.join(', ')}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => setShowOnboarding(true)}
                  className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto flex-shrink-0"
                  size="sm"
                >
                  <Wand2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span className="hidden sm:inline">Complete Now</span>
                  <span className="sm:hidden">Complete</span>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="basic" className="text-xs md:text-sm py-2 md:py-3">
                  <span className="hidden sm:inline">Basic Info</span>
                  <span className="sm:hidden">Basic</span>
                </TabsTrigger>
                <TabsTrigger value="lifestyle" className="text-xs md:text-sm py-2 md:py-3">
                  <span className="hidden sm:inline">Lifestyle</span>
                  <span className="sm:hidden">Life</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="text-xs md:text-sm py-2 md:py-3">
                  <span className="hidden sm:inline">Preferences</span>
                  <span className="sm:hidden">Prefs</span>
                </TabsTrigger>
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
                      <Label htmlFor="bio" className="text-sm md:text-base">Bio</Label>
                      {isEditing ? (
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          placeholder="Tell others about yourself..."
                          rows={4}
                          className="text-sm md:text-base"
                        />
                      ) : (
                        <p className="text-gray-700 mt-1 text-sm md:text-base p-3 bg-gray-50 rounded-md">
                          {formData.bio || 'No bio added yet.'}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="occupation" className="text-sm md:text-base">Occupation</Label>
                        {isEditing ? (
                          <Input
                            id="occupation"
                            value={formData.occupation}
                            onChange={(e) => handleInputChange('occupation', e.target.value)}
                            placeholder="Your job title"
                            className="text-sm md:text-base"
                          />
                        ) : (
                          <p className="text-gray-700 mt-1 text-sm md:text-base p-2 bg-gray-50 rounded-md">
                            {formData.occupation || 'Not specified'}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="education" className="text-sm md:text-base">Education</Label>
                        {isEditing ? (
                          <select
                            id="education"
                            value={formData.education}
                            onChange={(e) => handleInputChange('education', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm md:text-base"
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
                          <p className="text-gray-700 mt-1 text-sm md:text-base p-2 bg-gray-50 rounded-md">
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
                      <Label htmlFor="phone" className="text-sm md:text-base">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="text-sm md:text-base"
                        />
                      ) : (
                        <p className="text-gray-700 mt-1 text-sm md:text-base p-2 bg-gray-50 rounded-md">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-sm md:text-base">City</Label>
                        {isEditing ? (
                          <Input
                            id="city"
                            value={formData.location.city}
                            onChange={(e) => handleInputChange('location.city', e.target.value)}
                            placeholder="San Francisco"
                            className="text-sm md:text-base"
                          />
                        ) : (
                          <p className="text-gray-700 mt-1 text-sm md:text-base p-2 bg-gray-50 rounded-md">
                            {formData.location.city || 'Not specified'}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="state" className="text-sm md:text-base">State</Label>
                        {isEditing ? (
                          <Input
                            id="state"
                            value={formData.location.state}
                            onChange={(e) => handleInputChange('location.state', e.target.value)}
                            placeholder="California"
                            className="text-sm md:text-base"
                          />
                        ) : (
                          <p className="text-gray-700 mt-1 text-sm md:text-base p-2 bg-gray-50 rounded-md">
                            {formData.location.state || 'Not specified'}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-2 lg:col-span-1">
                        <Label htmlFor="country" className="text-sm md:text-base">Country</Label>
                        {isEditing ? (
                          <Input
                            id="country"
                            value={formData.location.country}
                            onChange={(e) => handleInputChange('location.country', e.target.value)}
                            placeholder="United States"
                            className="text-sm md:text-base"
                          />
                        ) : (
                          <p className="text-gray-700 mt-1 text-sm md:text-base p-2 bg-gray-50 rounded-md">
                            {formData.location.country || 'Not specified'}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lifestyle">
                <LifestyleEditor isEditing={isEditing} />
              </TabsContent>

              <TabsContent value="preferences">
                <RoommatePreferencesEditor isEditing={isEditing} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-0 lg:space-y-3">
                  <Avatar className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                    <AvatarImage
                      src={profile?.photos?.find(p => p.isPrimary)?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`}
                    />
                    <AvatarFallback className="text-lg md:text-xl">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left lg:text-center flex-1">
                    <h3 className="font-semibold text-lg md:text-xl">{fullName}</h3>
                    <p className="text-gray-600 text-sm md:text-base break-all">{user?.email}</p>
                    <div className="flex items-center justify-center sm:justify-start lg:justify-center space-x-2 mt-2">
                      <Progress value={completion.score} className="w-20 md:w-24 h-1.5" />
                      <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
                        {completion.score}% complete
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm md:text-base">Email:</span>
                    <div className="flex items-center space-x-1">
                      {user?.isEmailVerified ? (
                        <Check className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                      )}
                      <span className="text-xs md:text-sm">
                        {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>

                  {formData.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm md:text-base">Phone:</span>
                      <div className="flex items-center space-x-1">
                        {user?.isPhoneVerified ? (
                          <Check className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                        )}
                        <span className="text-xs md:text-sm">
                          {user?.isPhoneVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Photo Gallery */}
                {profile?.photos && profile.photos.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm md:text-base font-medium text-gray-900">Photos ({profile.photos.length})</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {profile.photos.slice(0, 6).map((photo, index) => (
                        <div key={photo.id} className="relative aspect-square">
                          <img
                            src={photo.thumbnailUrl || photo.url}
                            alt={`Profile photo ${index + 1}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                          {photo.isPrimary && (
                            <Badge className="absolute top-1 left-1 bg-yellow-500 hover:bg-yellow-600 text-xs px-1 py-0">
                              <Star className="w-2 h-2" />
                            </Badge>
                          )}
                        </div>
                      ))}
                      {profile.photos.length > 6 && (
                        <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
                          <span className="text-xs text-gray-500">+{profile.photos.length - 6}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button variant="outline" className="w-full" onClick={handleUpdatePhotos}>
                  <Camera className="w-4 h-4 mr-2" />
                  {profile?.photos && profile.photos.length > 0 ? 'Update Photos' : 'Add Photos'}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {completion.score < 80 && (
                  <Button
                    onClick={() => setShowOnboarding(true)}
                    className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-sm md:text-base"
                    size="sm"
                  >
                    <Wand2 className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    <span className="hidden sm:inline">Complete Profile ({completion.score}%)</span>
                    <span className="sm:hidden">Complete ({completion.score}%)</span>
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start text-sm md:text-base" onClick={handleViewMessages} size="sm">
                  <MessageCircle className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  <span className="hidden sm:inline">View Messages</span>
                  <span className="sm:hidden">Messages</span>
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm md:text-base" onClick={handleManageFavorites} size="sm">
                  <Heart className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  <span className="hidden sm:inline">Manage Favorites</span>
                  <span className="sm:hidden">Favorites</span>
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm md:text-base" onClick={handleDiscoverySettings} size="sm">
                  <Star className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  <span className="hidden sm:inline">Discovery Settings</span>
                  <span className="sm:hidden">Discovery</span>
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm md:text-base" onClick={handleUpdatePhotos} size="sm">
                  <Camera className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  <span className="hidden sm:inline">{profile?.photos && profile.photos.length > 0 ? 'Update Photos' : 'Add Photos'}</span>
                  <span className="sm:hidden">Photos</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={showPhotoUpload}
        onClose={() => setShowPhotoUpload(false)}
        onPhotosUploaded={handlePhotosUploaded}
      />
    </div>
  );
}
