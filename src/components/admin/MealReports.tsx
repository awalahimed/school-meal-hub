import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Utensils, Users } from "lucide-react";

export const MealReports = () => {
  const { data: mealStats } = useQuery({
    queryKey: ["meal-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meals")
        .select("meal_type, meal_date, student_id");

      if (error) throw error;

      const totalMeals = data.length;
      const breakfast = data.filter((m) => m.meal_type === "breakfast").length;
      const lunch = data.filter((m) => m.meal_type === "lunch").length;
      const dinner = data.filter((m) => m.meal_type === "dinner").length;

      return {
        total: totalMeals,
        breakfast,
        lunch,
        dinner,
      };
    },
  });

  const { data: recentMeals } = useQuery({
    queryKey: ["recent-meals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meals")
        .select("*, student:students(full_name, student_id)")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mealStats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Breakfast</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mealStats?.breakfast || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lunch</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mealStats?.lunch || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dinner</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mealStats?.dinner || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Meals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Meal Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Meal Type</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentMeals?.map((meal) => (
                <TableRow key={meal.id}>
                  <TableCell className="font-mono">{meal.student?.student_id}</TableCell>
                  <TableCell>{meal.student?.full_name}</TableCell>
                  <TableCell className="capitalize">{meal.meal_type}</TableCell>
                  <TableCell>{new Date(meal.meal_date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
