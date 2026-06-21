import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface QueueEntry {
  id: number;
  resource_id: number;
  user_id: number;
  status: "pending" | "processing" | "completed" | "canceled" | "failed";
  retry_count: number;
  last_processing_attempt_at: string | null;
  prompt: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  canceled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function QueuePage() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(() => {
    api.get<QueueEntry[]>("/queue").then(({ data }) => {
      setQueue(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleCancel = async (id: number) => {
    await api.delete(`/queue/${id}`);
    fetchQueue();
  };

  const isActive = (status: QueueEntry["status"]) =>
    status === "pending" || status === "processing";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Processing Queue</h1>
        <p className="text-muted-foreground">Track resource processing status</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : queue.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium">Queue is empty</p>
          <p className="text-sm text-muted-foreground">
            Add resources to the processing queue from the Resources page.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Resource ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Retries</TableHead>
              <TableHead>Prompt</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {queue.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="font-medium">#{q.resource_id}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusColors[q.status]}>
                    {q.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{q.retry_count}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {q.prompt}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(q.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {isActive(q.status) && (
                    <Button variant="ghost" size="icon" onClick={() => handleCancel(q.id)}>
                      <XCircle className="size-4 text-destructive" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
