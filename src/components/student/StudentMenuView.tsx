import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { UtensilsCrossed, Coffee, Soup } from "lucide-react";

export const StudentMenuView = () => {
  const currentDay = format(new Date(), "EEEE"); // Returns "Monday", "Tuesday", etc.

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ["today-menu", currentDay],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_menu_templates")
        .select("*")
        .eq("day_of_week", currentDay)
        .order("meal_type");

      if (error) throw error;
      return data;
    },
  });

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return <Coffee className="h-6 w-6" />;
      case "lunch":
        return <UtensilsCrossed className="h-6 w-6" />;
      case "dinner":
        return <Soup className="h-6 w-6" />;
      default:
        return <UtensilsCrossed className="h-6 w-6" />;
    }
  };

  const getMealGradient = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "from-orange-500/80 to-yellow-500/80";
      case "lunch":
        return "from-primary/80 to-purple-600/80";
      case "dinner":
        return "from-blue-500/80 to-indigo-600/80";
      default:
        return "from-primary/80 to-purple-600/80";
    }
  };

  const getMealEmoji = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "🥐";
      case "lunch":
        return "🍔";
      case "dinner":
        return "🍝";
      default:
        return "🍽️";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-24">
        <Skeleton className="h-48 rounded-[32px]" />
        <Skeleton className="h-48 rounded-[32px]" />
        <Skeleton className="h-48 rounded-[32px]" />
      </div>
    );
  }

  const breakfast = menuItems?.find((item) => item.meal_type === "breakfast");
  const lunch = menuItems?.find((item) => item.meal_type === "lunch");
  const dinner = menuItems?.find((item) => item.meal_type === "dinner");

  const renderMealCard = (meal: any, mealType: string) => {
    if (!meal || meal.main_dish === "Not set") return null;

    return (
      <Card className="rounded-[32px] overflow-hidden shadow-xl border-0 relative h-48">
        <div className={`absolute inset-0 bg-gradient-to-br ${getMealGradient(mealType)} flex flex-col justify-end p-6 text-white`}>
          <div className="absolute top-6 right-6 text-6xl opacity-20">{getMealEmoji(mealType)}</div>
          <div className="flex items-center gap-2 mb-2">
            {getMealIcon(mealType)}
            <span className="text-sm font-semibold uppercase tracking-wide">{mealType}</span>
          </div>
          <h3 className="text-2xl font-bold">{meal.main_dish}</h3>
          {meal.description && meal.description !== "Menu not configured yet" && (
            <p className="text-sm opacity-90 mt-1">{meal.description}</p>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Today's Menu</h2>
        <p className="text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
      </div>

      <div className="space-y-4">
        {renderMealCard(breakfast, "breakfast")}
        {renderMealCard(lunch, "lunch")}
        {renderMealCard(dinner, "dinner")}
        
        {(!breakfast || breakfast.main_dish === "Not set") && 
         (!lunch || lunch.main_dish === "Not set") && 
         (!dinner || dinner.main_dish === "Not set") && (
          <Card className="rounded-[32px] p-8 text-center">
            <p className="text-muted-foreground">
              No menu configured for {currentDay} yet. Please check back later.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
