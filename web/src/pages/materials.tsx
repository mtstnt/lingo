import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BookOpen, HelpCircle, Languages, Sparkles } from "lucide-react";
import { parseJson, type ParsedVocabulary, type ParsedGrammar, type ParsedQuiz } from "@/lib/material-types";
import type { Material } from "@/lib/material-types";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = useCallback(() => {
    api.get<Material[]>("/material").then(({ data }) => {
      setMaterials([...data].sort((a, b) => b.name.localeCompare(a.name)));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Materials</h1>
        <p className="text-muted-foreground">AI-generated learning materials from your resources</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium">No materials yet</p>
          <p className="text-sm text-muted-foreground">
            Queue a resource for processing to generate materials.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((m) => {
            const vocab = parseJson<ParsedVocabulary>(m.vocabulary);
            const grammar = parseJson<ParsedGrammar>(m.grammar);
            const quiz = parseJson<ParsedQuiz>(m.quiz);
            const wordCount = vocab.reduce((sum, v) => sum + v.words.length, 0);

            return (
              <Link key={m.id} to={`/my/materials/${m.id}`} className="block">
                <Card className="group transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="size-4 shrink-0 text-muted-foreground" />
                        <CardTitle className="line-clamp-1 text-base">{m.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        <Languages className="mr-1 size-3" />
                        {wordCount} words
                      </Badge>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        <Sparkles className="mr-1 size-3" />
                        {grammar.length} structures
                      </Badge>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <HelpCircle className="mr-1 size-3" />
                        {quiz.length} questions
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <span className="cursor-default text-xs text-muted-foreground" />
                          }
                        >
                          {formatDistanceToNow(m.createdAt, { addSuffix: true })}
                        </TooltipTrigger>
                        <TooltipContent>
                          {new Date(m.createdAt).toLocaleString()}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
