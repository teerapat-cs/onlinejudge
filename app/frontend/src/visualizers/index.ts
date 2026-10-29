import React from 'react';

import { BinarySearchVisualizer } from './BinarySearchVisualizer';
import {
  BubbleSortVisualizer,
  SelectionSortVisualizer,
  SortingVisualizer,
} from './SortingVisualizer';
import { VisualizerProps } from './types';

export {
  BinarySearchVisualizer,
  BubbleSortVisualizer,
  SelectionSortVisualizer,
  SortingVisualizer,
};
export type { VisualizerProps };

export const VISUALIZER_REGISTRY: Record<
  string,
  React.ComponentType<VisualizerProps>
> = {
  'bubble-sort': BubbleSortVisualizer,
  'selection-sort': SelectionSortVisualizer,
  'binary-search': BinarySearchVisualizer,
};

export function getVisualizer(
  slug: string
): React.ComponentType<VisualizerProps> | null {
  return VISUALIZER_REGISTRY[slug] ?? null;
}

