import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { Plus, Trash2, Pencil, Send, List, FileText, Globe, Image as ImageIcon, Video } from "lucide-react";

interface Resource {
  id: number;
  user_id: number;
  name: string;
  type: "text" | "url" | "image" | "video";
  content: string;
  createdAt: string;
  updatedAt: string;
}

const typeConfig: Record<
  Resource["type"],
  { color: string; icon: typeof FileText }
> = {
  text: {
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    icon: FileText,
  },
  url: {
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    icon: Globe,
  },
  image: {
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    icon: ImageIcon,
  },
  video: {
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    icon: Video,
  },
};

const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<Resource["type"]>("text");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [urlError, setUrlError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit dialog state
  const [editTarget, setEditTarget] = useState<Resource | null>(null);
  const [editName, setEditName] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editUrlError, setEditUrlError] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Confirm dialog state
  const [queueTarget, setQueueTarget] = useState<Resource | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);

  const fetchResources = useCallback(() => {
    api.get<Resource[]>("/resource").then(({ data }) => {
      setResources(
        [...data].sort((a, b) => b.name.localeCompare(a.name))
      );
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const resetCreateForm = () => {
    setName("");
    setType("text");
    setContent("");
    setFile(null);
    setUrlError("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "url" && !URL_REGEX.test(content)) {
      setUrlError("Please enter a valid URL (e.g. https://example.com)");
      return;
    }
    setSubmitting(true);
    try {
      let payload: string;
      if (type === "image" || type === "video") {
        payload = file ? file.name : "";
      } else {
        payload = content;
      }
      await api.post("/resource", { name, type, content: payload });
      resetCreateForm();
      setCreateOpen(false);
      fetchResources();
    } finally {
      setSubmitting(false);
    }
  };

  const handleTypeChange = (newType: Resource["type"]) => {
    setType(newType);
    setContent("");
    setFile(null);
    setUrlError("");
  };

  const openEdit = (r: Resource) => {
    setEditTarget(r);
    setEditName(r.name);
    setEditContent(r.content);
    setEditFile(null);
    setEditUrlError("");
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    if (editTarget.type === "url" && !URL_REGEX.test(editContent)) {
      setEditUrlError("Please enter a valid URL (e.g. https://example.com)");
      return;
    }
    setEditSubmitting(true);
    try {
      let payload: string;
      if (editTarget.type === "image" || editTarget.type === "video") {
        payload = editFile ? editFile.name : editContent;
      } else {
        payload = editContent;
      }
      await api.patch(`/resource/${editTarget.id}`, { name: editName, content: payload });
      setEditTarget(null);
      fetchResources();
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/resource/${deleteTarget.id}`);
    setDeleteTarget(null);
    fetchResources();
  };

  const handleQueue = async () => {
    if (!queueTarget) return;
    await api.post("/queue", { resource_id: queueTarget.id });
    setQueueTarget(null);
  };

  const sorted = resources;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground">Manage your raw learning materials</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" render={<Link to="/my/resources/queue" />}>
            <List className="size-4" />
            Queue
          </Button>
          <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreateForm(); }}>
            <DialogTrigger
              render={
                <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/80" />
              }
            >
              <Plus className="size-4" />
              Add resource
            </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>New resource</DialogTitle>
                <DialogDescription>Add a new resource for language learning</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My vocabulary list"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => handleTypeChange(v as Resource["type"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {type === "text" && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Paste or type your text content here..."
                      rows={10}
                      required
                    />
                  </div>
                )}

                {type === "url" && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      value={content}
                      onChange={(e) => { setContent(e.target.value); setUrlError(""); }}
                      placeholder="https://example.com/article"
                      aria-invalid={!!urlError}
                      required
                    />
                    {urlError && <p className="text-xs text-destructive">{urlError}</p>}
                  </div>
                )}

                {(type === "image" || type === "video") && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="file">{type === "image" ? "Image" : "Video"} file</Label>
                    <Input
                      id="file"
                      type="file"
                      accept={type === "image" ? "image/*" : "video/*"}
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="file:mr-2 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-sm file:font-medium"
                      required
                    />
                    {file && (
                      <p className="text-xs text-muted-foreground">{file.name}</p>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create resource"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium">No resources yet</p>
          <p className="text-sm text-muted-foreground">Create your first resource to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((r) => {
            const cfg = typeConfig[r.type];
            const Icon = cfg.icon;
            return (
              <Card key={r.id} className="group relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      <CardTitle className="line-clamp-1 text-base">{r.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className={cfg.color}>
                      {r.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {r.content}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="cursor-default text-xs text-muted-foreground" />
                        }
                      >
                        {formatDistanceToNow(r.createdAt, { addSuffix: true })}
                      </TooltipTrigger>
                      <TooltipContent>
                        {new Date(r.createdAt).toLocaleString()}
                      </TooltipContent>
                    </Tooltip>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQueueTarget(r)}
                      >
                        <Send className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(r)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(r)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent>
          {editTarget && (
            <form onSubmit={handleEdit}>
              <DialogHeader>
                <DialogTitle>Edit resource</DialogTitle>
                <DialogDescription>
                  Update &ldquo;{editTarget.name}&rdquo; — type cannot be changed
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Type</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={typeConfig[editTarget.type].color}>
                      {editTarget.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">(cannot be changed)</span>
                  </div>
                </div>

                {editTarget.type === "text" && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-content">Content</Label>
                    <Textarea
                      id="edit-content"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={10}
                      required
                    />
                  </div>
                )}

                {editTarget.type === "url" && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-url">URL</Label>
                    <Input
                      id="edit-url"
                      type="url"
                      value={editContent}
                      onChange={(e) => { setEditContent(e.target.value); setEditUrlError(""); }}
                      aria-invalid={!!editUrlError}
                      required
                    />
                    {editUrlError && <p className="text-xs text-destructive">{editUrlError}</p>}
                  </div>
                )}

                {(editTarget.type === "image" || editTarget.type === "video") && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-file">
                      {editTarget.type === "image" ? "Image" : "Video"} file
                    </Label>
                    <Input
                      id="edit-file"
                      type="file"
                      accept={editTarget.type === "image" ? "image/*" : "video/*"}
                      onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                      className="file:mr-2 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-sm file:font-medium"
                    />
                    <p className="text-xs text-muted-foreground">
                      {editFile ? editFile.name : `Current: ${editContent}`}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={editSubmitting}>
                  {editSubmitting ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Send to queue confirmation */}
      <Dialog open={!!queueTarget} onOpenChange={(open) => { if (!open) setQueueTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send to queue?</DialogTitle>
            <DialogDescription>
              This will send &ldquo;{queueTarget?.name}&rdquo; for AI processing. You can track progress in the Queue page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQueueTarget(null)}>Cancel</Button>
            <Button onClick={handleQueue}>
              <Send className="mr-2 size-4" />
              Send to queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete resource?</DialogTitle>
            <DialogDescription>
              This will permanently delete &ldquo;{deleteTarget?.name}&rdquo;. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
