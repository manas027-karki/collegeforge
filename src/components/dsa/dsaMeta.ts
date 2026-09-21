import type { Difficulty, DSAPlatform } from '../../types'
import type { BadgeTone } from '../StatusBadge'

export const DIFFICULTY_ORDER: readonly Difficulty[] = ['EASY', 'MEDIUM', 'HARD']

export const DSA_TOPICS: readonly string[] = [
  'Arrays',
  'Strings',
  'Linked List',
  'Stack',
  'Queue',
  'Binary Tree',
  'BST',
  'Heap',
  'Graph',
  'Dynamic Programming',
  'Greedy',
  'Backtracking',
  'Sorting',
  'Searching',
  'Hashing',
]

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
}

export const DIFFICULTY_TONES: Record<Difficulty, BadgeTone> = {
  EASY: 'green',
  MEDIUM: 'amber',
  HARD: 'red',
}

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  EASY: '#10b981',
  MEDIUM: '#f59e0b',
  HARD: '#f43f5e',
}

export const PLATFORM_LABELS: Record<DSAPlatform, string> = {
  LEETCODE: 'LeetCode',
  OTHER: 'Other',
}

export const PLATFORM_CHIP_CLASS: Record<DSAPlatform, string> = {
  LEETCODE: 'bg-sky-50 text-sky-700 ring-sky-200',
  OTHER: 'bg-neutral-100 text-neutral-600 ring-neutral-200',
}