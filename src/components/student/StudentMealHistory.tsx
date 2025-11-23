import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Check } from "lucide-react";

export const StudentMealHistory = () => {
  const { user } = useAuth();

  const { data: student } = useQuery({
    queryKey: ["student-for-meals", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: meals, isLoading } = useQuery({
    queryKey: ["student-meals", student?.id],
    queryFn: async () => {
      if (!student) return [];

      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("student_id", student.id)
        .order("meal_date", { ascending: false })
        .limit(30);

      if (error) throw error;
      return data;
    },
    enabled: !!student,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!meals || meals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-muted-foreground">No meal records found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Breakfast</TableHead>
            <TableHead>Lunch</TableHead>
            <TableHead>Dinner</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from(
            meals.reduce((acc, meal) => {
              const date = meal.meal_date;
              if (!acc.has(date)) {
                acc.set(date, []);
              }
              acc.get(date)?.push(meal);
              return acc;
            }, new Map<string, typeof meals>())
          ).map(([date, dayMeals]) => (
            <TableRow key={date}>
              <TableCell>{format(new Date(date), "MMM d, yyyy")}</TableCell>
              <TableCell>
                {dayMeals.some((m) => m.meal_type === "breakfast") && (
                  <Check className="h-4 w-4 text-success" />
                )}
              </TableCell>
              <TableCell>
                {dayMeals.some((m) => m.meal_type === "lunch") && (
                  <Check className="h-4 w-4 text-success" />
                )}
              </TableCell>
              <TableCell>
                {dayMeals.some((m) => m.meal_type === "dinner") && (
                  <Check className="h-4 w-4 text-success" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
