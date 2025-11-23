import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LogOut, Search, Utensils, Bell } from "lucide-react";
import { StudentSearch } from "@/components/staff/StudentSearch";
import { AnnouncementManager } from "@/components/staff/AnnouncementManager";

const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <ProtectedRoute allowedRoles={["staff"]}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div>
              <h1 className="text-2xl font-bold">Staff Dashboard</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Student Search & Meal Recording */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  <CardTitle>Student Meal Recording</CardTitle>
                </div>
                <CardDescription>
                  Search for students by ID and record their meals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StudentSearch />
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-warning" />
                  <CardTitle>Announcements</CardTitle>
                </div>
                <CardDescription>
                  Post and manage announcements for students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnnouncementManager />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default StaffDashboard;
