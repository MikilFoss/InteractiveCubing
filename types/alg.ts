export interface AlgCase {
  id: number;
  name: string;
  algs: string[];
  category: string;
  setup?: string;
  split?: boolean;
}

export interface AlgSet {
  name: string;
  description?: string;
  cases: AlgCase[];
}

export type F2LCategory =
  | "Basic Inserts"
  | "Corner in U, Edge in U"
  | "Corner in Slot, Edge in U"
  | "Corner in U, Edge in Slot"
  | "Both in Slot";
