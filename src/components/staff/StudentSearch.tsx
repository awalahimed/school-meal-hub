import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const StudentSearch = () => {
  const [searchId, setSearchId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const searchStudent = async () => {
    if (!searchId.trim()) {
      toast.error("Please enter a student ID");
      return;
    }

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("student_id", searchId.toUpperCase())
      .single();

    if (error || !data) {
      toast.error("Student not found");
      setSelectedStudent(null);
      return;
    }

    setSelectedStudent(data);
  };

  const { data: todaysMeals } = useQuery({
    queryKey: ["todays-meals", selectedStudent?.id],
    queryFn: async () => {
      if (!selectedStudent) return [];

      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("student_id", selectedStudent.id)
        .eq("meal_date", today);

      if (error) throw error;
      return data;
    },
    enabled: !!selectedStudent,
  });

  const recordMeal = useMutation({
    mutationFn: async (mealType: "breakfast" | "lunch" | "dinner") => {
      if (!selectedStudent || !user) return;

      const today = new Date().toISOString().split("T")[0];

      const { error } = await supabase.from("meals").insert({
        student_id: selectedStudent.id,
        meal_type: mealType,
        meal_date: today,
        recorded_by: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todays-meals"] });
      toast.success("Meal recorded successfully");
    },
    onError: (error: any) => {
      if (error.message.includes("duplicate")) {
        toast.error("Meal already recorded for today");
      } else {
        toast.error("Failed to record meal");
      }
    },
  });

  const hasMeal = (mealType: string) => {
    return todaysMeals?.some((m) => m.meal_type === mealType);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 space-y-2">
          <Label htmlFor="student-id">Student ID</Label>
          <Input
            id="student-id"
            placeholder="Enter student ID (e.g., STU123456)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchStudent()}
          />
        </div>
        <Button onClick={searchStudent} className="mt-8">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      {/* Student Info & Meal Recording */}
      {selectedStudent && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-6 space-y-2">
              <h3 className="text-lg font-semibold">{selectedStudent.full_name}</h3>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>ID: {selectedStudent.student_id}</span>
                <span>Grade: {selectedStudent.grade}</span>
                <span>Sex: {selectedStudent.sex}</span>
              </div>
              <Badge
                variant={
                  selectedStudent.status === "active"
                    ? "default"
                    : selectedStudent.status === "suspended"
                    ? "destructive"
                    : "secondary"
                }
              >
                {selectedStudent.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Record Today's Meals</h4>
              <div className="grid gap-3 md:grid-cols-3">
                <Button
                  onClick={() => recordMeal.mutate("breakfast")}
                  disabled={hasMeal("breakfast") || selectedStudent.status !== "active"}
                  variant={hasMeal("breakfast") ? "outline" : "default"}
                >
                  {hasMeal("breakfast") && <Check className="mr-2 h-4 w-4" />}
                  Breakfast
                </Button>
                <Button
                  onClick={() => recordMeal.mutate("lunch")}
                  disabled={hasMeal("lunch") || selectedStudent.status !== "active"}
                  variant={hasMeal("lunch") ? "outline" : "default"}
                >
                  {hasMeal("lunch") && <Check className="mr-2 h-4 w-4" />}
                  Lunch
                </Button>
                <Button
                  onClick={() => recordMeal.mutate("dinner")}
                  disabled={hasMeal("dinner") || selectedStudent.status !== "active"}
                  variant={hasMeal("dinner") ? "outline" : "default"}
                >
                  {hasMeal("dinner") && <Check className="mr-2 h-4 w-4" />}
                  Dinner
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
