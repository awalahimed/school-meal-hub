import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { z } from "zod";

const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  content: z.string().min(10, "Content must be at least 10 characters").max(1000),
});

export const AnnouncementManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: announcements } = useQuery({
    queryKey: ["staff-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!user) throw new Error("Not authenticated");

      const title = formData.get("title") as string;
      const content = formData.get("content") as string;

      announcementSchema.parse({ title, content });

      const { error } = await supabase.from("announcements").insert({
        title,
        content,
        posted_by: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-announcements"] });
      toast.success("Announcement posted successfully");
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to post announcement");
    },
  });

  const updateAnnouncement = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const title = formData.get("title") as string;
      const content = formData.get("content") as string;

      announcementSchema.parse({ title, content });

      const { error } = await supabase
        .from("announcements")
        .update({ title, content })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-announcements"] });
      toast.success("Announcement updated successfully");
      setEditingAnnouncement(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update announcement");
    },
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-announcements"] });
      toast.success("Announcement deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete announcement");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createAnnouncement.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateAnnouncement.mutate({ id: editingAnnouncement.id, formData });
  };

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
            <DialogDescription>Post an announcement for all students</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Announcement title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Announcement content"
                rows={4}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Post Announcement
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {announcements?.map((announcement) => (
          <Card key={announcement.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-2 font-semibold">{announcement.title}</h3>
                  <p className="mb-2 text-sm text-muted-foreground">{announcement.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(announcement.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                {announcement.posted_by === user?.id && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingAnnouncement(announcement)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAnnouncement.mutate(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingAnnouncement} onOpenChange={() => setEditingAnnouncement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription>Update your announcement</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                name="title"
                defaultValue={editingAnnouncement?.title}
                placeholder="Announcement title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                name="content"
                defaultValue={editingAnnouncement?.content}
                placeholder="Announcement content"
                rows={4}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Update Announcement
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
