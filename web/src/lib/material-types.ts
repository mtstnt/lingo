export interface Material {
  id: number;
  resource_id: number;
  user_id: number;
  name: string;
  vocabulary: string;
  grammar: string;
  quiz: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedVocabulary {
  sentence: string;
  words: { word: string; meaning: string }[];
}

export interface ParsedGrammar {
  sentence_index: number;
  structures: string[];
}

export interface ParsedQuiz {
  question: string;
  options: string[];
  correct_index: number;
}

export function parseJson<T>(raw: string): T[] {
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}
