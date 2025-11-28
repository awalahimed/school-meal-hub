import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Clock, Save } from "lucide-react";

interface MealSchedule {
  id: string;
  meal_type: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export const MealScheduleManager = () => {
  const queryClient = useQueryClient();
  const [editingSchedules, setEditingSchedules] = useState<Record<string, { start_time: string; end_time: string }>>({});

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["meal-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meal_schedules")
        .select("*")
        .order("meal_type");

      if (error) throw error;
      return data as MealSchedule[];
    },
  });

  const updateSchedule = useMutation({
    mutationFn: async ({ id, start_time, end_time }: { id: string; start_time: string; end_time: string }) => {
      const { error } = await supabase
        .from("meal_schedules")
        .update({ start_time, end_time })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-schedules"] });
      toast.success("Schedule updated successfully");
      setEditingSchedules({});
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update schedule");
    },
  });

  const handleTimeChange = (scheduleId: string, field: "start_time" | "end_time", value: string) => {
    setEditingSchedules(prev => ({
      ...prev,
      [scheduleId]: {
        ...prev[scheduleId],
        [field]: value,
      },
    }));
  };

  const handleSave = (schedule: MealSchedule) => {
    const edits = editingSchedules[schedule.id];
    if (!edits) return;

    updateSchedule.mutate({
      id: schedule.id,
      start_time: edits.start_time || schedule.start_time,
      end_time: edits.end_time || schedule.end_time,
    });
  };

  const formatTimeForInput = (time: string) => {
    // Convert "HH:MM:SS" to "HH:MM"
    return time.slice(0, 5);
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "🌅";
      case "lunch":
        return "☀️";
      case "dinner":
        return "🌙";
      default:
        return "🍽️";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading schedules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-muted/50 p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            Configure the serving times for each meal type. Staff will only be able to record meals during these hours.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {schedules?.map((schedule) => {
          const editing = editingSchedules[schedule.id];
          const startTime = editing?.start_time || formatTimeForInput(schedule.start_time);
          const endTime = editing?.end_time || formatTimeForInput(schedule.end_time);
          const hasChanges = editing && (
            editing.start_time !== formatTimeForInput(schedule.start_time) ||
            editing.end_time !== formatTimeForInput(schedule.end_time)
          );

          return (
            <Card key={schedule.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg capitalize">
                  <span className="text-2xl">{getMealIcon(schedule.meal_type)}</span>
                  {schedule.meal_type}
                </CardTitle>
                <CardDescription>
                  Set the serving hours for {schedule.meal_type}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`start-${schedule.id}`}>Start Time</Label>
                  <Input
                    id={`start-${schedule.id}`}
                    type="time"
                    value={startTime}
                    onChange={(e) => handleTimeChange(schedule.id, "start_time", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`end-${schedule.id}`}>End Time</Label>
                  <Input
                    id={`end-${schedule.id}`}
                    type="time"
                    value={endTime}
                    onChange={(e) => handleTimeChange(schedule.id, "end_time", e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => handleSave(schedule)}
                  disabled={!hasChanges || updateSchedule.isPending}
                  className="w-full"
                  size="sm"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
