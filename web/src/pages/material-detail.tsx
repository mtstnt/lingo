import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parseJson, type Material, type ParsedVocabulary, type ParsedGrammar, type ParsedQuiz } from "@/lib/material-types";

export default function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(false);

  const fetchMaterial = useCallback(() => {
    if (!id) return;
    api.get<Material>(`/material/${id}`).then(({ data }) => {
      setMaterial(data);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    fetchMaterial();
  }, [fetchMaterial]);

  const handleDelete = async () => {
    if (!id) return;
    await api.delete(`/material/${id}`);
    window.location.href = "/my/materials";
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!material) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <p className="text-lg font-medium">Material not found</p>
        <Button variant="outline" render={<Link to="/my/materials" />}>
          <ArrowLeft className="mr-2 size-4" />
          Back to materials
        </Button>
      </div>
    );
  }

  const vocab = parseJson<ParsedVocabulary>(material.vocabulary);
  const grammar = parseJson<ParsedGrammar>(material.grammar);
  const quiz = parseJson<ParsedQuiz>(material.quiz);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" render={<Link to="/my/materials" />}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{material.name}</h1>
            <p className="text-sm text-muted-foreground">
              Created {new Date(material.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <Button variant="destructive" onClick={() => setDeleteTarget(true)}>
          <Trash2 className="mr-2 size-4" />
          Delete
        </Button>
      </div>

      {/* Vocabulary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vocabulary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {vocab.map((v, i) => (
              <div key={i} className="rounded-lg border p-3">
                <p className="mb-2 text-sm font-medium">{v.sentence}</p>
                <div className="flex flex-wrap gap-2">
                  {v.words.map((w, j) => (
                    <Badge key={j} variant="secondary">
                      {w.word} — {w.meaning}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grammar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Grammar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {grammar.map((g, i) => (
              <div key={i} className="rounded-lg border p-3">
                <p className="mb-1 text-xs text-muted-foreground">
                  Sentence {g.sentence_index + 1}
                </p>
                <div className="flex flex-wrap gap-1">
                  {g.structures.map((s, j) => (
                    <Badge key={j} variant="secondary" className="bg-accent">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiz */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {quiz.map((q, i) => (
              <div key={i} className="rounded-lg border p-4">
                <p className="mb-3 text-sm font-medium">
                  {i + 1}. {q.question}
                </p>
                <div className="flex flex-col gap-1.5">
                  {q.options.map((opt, j) => (
                    <div
                      key={j}
                      className={
                        j === q.correct_index
                          ? "rounded-md bg-green-100 px-3 py-2 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground"
                      }
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <Dialog open={deleteTarget} onOpenChange={setDeleteTarget}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete material?</DialogTitle>
            <DialogDescription>
              This will permanently delete &ldquo;{material.name}&rdquo;. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(false)}>Cancel</Button>
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
