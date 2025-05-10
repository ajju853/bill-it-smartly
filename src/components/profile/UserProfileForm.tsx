
import { useState, useEffect, ChangeEvent } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getUserProfile, saveUserProfile, deleteUserProfile, UserProfile } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function UserProfileForm() {
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [profileLogo, setProfileLogo] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    const savedProfile = getUserProfile();
    if (savedProfile) {
      setProfile({
        name: savedProfile.name,
        businessName: savedProfile.businessName,
        email: savedProfile.email,
        phone: savedProfile.phone || "",
        address: savedProfile.address || "",
      });
      setProfileLogo(savedProfile.logo);
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!profile.name || !profile.businessName || !profile.email) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      saveUserProfile({
        ...profile,
        logo: profileLogo,
      } as UserProfile);
      
      toast({
        title: "Profile saved",
        description: "Your profile has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error saving profile",
        description: "There was an error saving your profile",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
      deleteUserProfile();
      setProfile({
        name: "",
        businessName: "",
        email: "",
        phone: "",
        address: "",
      });
      setProfileLogo(undefined);
      
      toast({
        title: "Profile deleted",
        description: "Your profile has been deleted successfully",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>
          Create or update your profile information. This information will appear on your invoices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="logo">Logo</Label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-lg border flex items-center justify-center overflow-hidden bg-muted">
              {profileLogo ? (
                <img src={profileLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-muted-foreground text-sm">No logo</span>
              )}
            </div>
            <div className="flex-1">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload a logo to display on your invoices. Max size 2MB.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="required">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessName" className="required">Business Name</Label>
            <Input
              id="businessName"
              name="businessName"
              value={profile.businessName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="required">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={profile.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Business Address</Label>
          <Textarea
            id="address"
            name="address"
            value={profile.address}
            onChange={handleChange}
            rows={3}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
        <Button variant="destructive" onClick={handleDelete}>
          Delete Profile
        </Button>
        <Button onClick={handleSubmit}>Save Profile</Button>
      </CardFooter>
    </Card>
  );
}
