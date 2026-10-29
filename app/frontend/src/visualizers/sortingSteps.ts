import { SortingStep } from './types';

export function extractArrayFromInput(
  sampleInput: unknown,
  fallback: number[]
): number[] {
  if (Array.isArray(sampleInput)) {
    const nums = sampleInput.map(Number).filter((n) => !Number.isNaN(n));
    if (nums.length > 0) return nums;
  }
  if (sampleInput && typeof sampleInput === 'object') {
    const record = sampleInput as Record<string, unknown>;
    if (Array.isArray(record.array)) {
      const nums = record.array.map(Number).filter((n) => !Number.isNaN(n));
      if (nums.length > 0) return nums;
    }
  }
  return fallback;
}

export function generateBubbleSortSteps(initial: number[]): SortingStep[] {
  const arr = [...initial];
  const n = arr.length;
  const steps: SortingStep[] = [];
  const sorted = new Set<number>();

  steps.push({
    array: [...arr],
    comparing: [],
    swapped: [],
    sortedIndices: [],
    highlightIndex: null,
    description: `เริ่มต้น Bubble Sort ด้วยข้อมูล [${arr.join(', ')}]`,
  });

  for (let i = 0; i < n - 1; i++) {
    let swappedInPass = false;
    for (let j = 0; j < n - 1 - i; j++) {
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapped: [],
        sortedIndices: Array.from(sorted),
        highlightIndex: null,
        description: `รอบที่ ${i + 1}: เปรียบเทียบ arr[${j}] = ${arr[j]} กับ arr[${j + 1}] = ${arr[j + 1]}`,
      });

      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swappedInPass = true;

        steps.push({
          array: [...arr],
          comparing: [],
          swapped: [j, j + 1],
          sortedIndices: Array.from(sorted),
          highlightIndex: null,
          description: `${arr[j + 1]} > ${arr[j]} จึงสลับตำแหน่งเป็น [${arr[j]}, ${arr[j + 1]}]`,
        });
      }
    }

    sorted.add(n - 1 - i);
    steps.push({
      array: [...arr],
      comparing: [],
      swapped: [],
      sortedIndices: Array.from(sorted),
      highlightIndex: n - 1 - i,
      description: `จบรอบที่ ${i + 1}: ค่า ${arr[n - 1 - i]} อยู่ในตำแหน่งที่ถูกต้องแล้ว`,
    });

    if (!swappedInPass) {
      for (let k = 0; k < n - 1 - i; k++) {
        sorted.add(k);
      }
      break;
    }
  }

  for (let k = 0; k < n; k++) {
    sorted.add(k);
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapped: [],
    sortedIndices: Array.from(sorted),
    highlightIndex: null,
    description: `เรียงลำดับเสร็จสมบูรณ์: [${arr.join(', ')}]`,
  });

  return steps;
}

export function generateSelectionSortSteps(initial: number[]): SortingStep[] {
  const arr = [...initial];
  const n = arr.length;
  const steps: SortingStep[] = [];
  const sorted = new Set<number>();

  steps.push({
    array: [...arr],
    comparing: [],
    swapped: [],
    sortedIndices: [],
    highlightIndex: null,
    description: `เริ่มต้น Selection Sort ด้วยข้อมูล [${arr.join(', ')}]`,
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push({
      array: [...arr],
      comparing: [i],
      swapped: [],
      sortedIndices: Array.from(sorted),
      highlightIndex: minIdx,
      description: `รอบที่ ${i + 1}: กำหนดค่าต่ำสุดเริ่มต้นที่ arr[${minIdx}] = ${arr[minIdx]}`,
    });

    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...arr],
        comparing: [minIdx, j],
        swapped: [],
        sortedIndices: Array.from(sorted),
        highlightIndex: minIdx,
        description: `เปรียบเทียบ arr[${j}] = ${arr[j]} กับค่าต่ำสุดปัจจุบัน arr[${minIdx}] = ${arr[minIdx]}`,
      });

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        steps.push({
          array: [...arr],
          comparing: [j],
          swapped: [],
          sortedIndices: Array.from(sorted),
          highlightIndex: minIdx,
          description: `พบค่าต่ำสุดใหม่ที่ arr[${minIdx}] = ${arr[minIdx]}`,
        });
      }
    }

    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;

      steps.push({
        array: [...arr],
        comparing: [],
        swapped: [i, minIdx],
        sortedIndices: Array.from(sorted),
        highlightIndex: i,
        description: `สลับค่าต่ำสุด ${arr[i]} มาไว้ที่ตำแหน่ง index ${i}`,
      });
    }

    sorted.add(i);
    steps.push({
      array: [...arr],
      comparing: [],
      swapped: [],
      sortedIndices: Array.from(sorted),
      highlightIndex: null,
      description: `ตำแหน่งที่ ${i} (ค่า ${arr[i]}) เรียงลำดับเสร็จแล้ว`,
    });
  }

  for (let k = 0; k < n; k++) {
    sorted.add(k);
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapped: [],
    sortedIndices: Array.from(sorted),
    highlightIndex: null,
    description: `เรียงลำดับเสร็จสมบูรณ์: [${arr.join(', ')}]`,
  });

  return steps;
}

