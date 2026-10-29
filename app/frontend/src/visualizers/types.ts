export interface VisualizerProps {
  sampleInput: unknown;
}

export interface SortingStep {
  array: number[];
  comparing: number[];
  swapped: number[];
  sortedIndices: number[];
  highlightIndex: number | null;
  description: string;
}

export interface BinarySearchStep {
  array: number[];
  target: number;
  low: number;
  mid: number | null;
  high: number;
  foundIndex: number | null;
  eliminatedIndices: number[];
  description: string;
}

