
import UserProfileForm from "@/components/profile/UserProfileForm";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile information that appears on invoices
        </p>
      </div>
      
      <UserProfileForm />
    </div>
  );
}
