// data/algorithms.ts

export interface Algorithm {
  id: string;
  name: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  section?: string;
}

export const algorithmsByCategory: Record<string, Algorithm[]> = {
  sorting: [
    { id: 'bubble', name: 'Bubble Sort', description: 'Repeatedly compares adjacent values and bubbles largest toward end', timeComplexity: 'O(n²)', spaceComplexity: 'O(1)' },
    { id: 'selection', name: 'Selection Sort', description: 'Scans unsorted portion to select minimum element each pass', timeComplexity: 'O(n²)', spaceComplexity: 'O(1)' },
    { id: 'insertion', name: 'Insertion Sort', description: 'Builds sorted prefix by inserting each element in correct position', timeComplexity: 'O(n²)', spaceComplexity: 'O(1)' },
    { id: 'merge', name: 'Merge Sort', description: 'Divides array in half recursively then merges sorted halves', timeComplexity: 'O(n log n)', spaceComplexity: 'O(n)' },
    { id: 'quick', name: 'Quick Sort', description: 'Partitions array around pivot and recursively sorts each side', timeComplexity: 'O(n log n)', spaceComplexity: 'O(log n)' },
    { id: 'heap', name: 'Heap Sort', description: 'Builds max-heap then extracts maximum element repeatedly', timeComplexity: 'O(n log n)', spaceComplexity: 'O(1)' },
  ],
  dp: [
    { id: 'fibonacci', name: 'Fibonacci', description: 'Stores previously solved subproblems to avoid redundant work', timeComplexity: 'O(n)', spaceComplexity: 'O(n)' },
    { id: 'knapsack', name: '0/1 Knapsack', description: 'Fills DP table to find maximum value within weight capacity', timeComplexity: 'O(n×W)', spaceComplexity: 'O(n×W)' },
    { id: 'lcs', name: 'LCS', description: 'Finds longest sequence common to both input strings', timeComplexity: 'O(m×n)', spaceComplexity: 'O(m×n)' },
    { id: 'lis', name: 'LIS', description: 'Finds longest subsequence where elements are strictly increasing', timeComplexity: 'O(n²)', spaceComplexity: 'O(n)' },
    { id: 'mcm', name: 'Matrix Chain Multiplication', description: 'Finds optimal order to multiply chain of matrices', timeComplexity: 'O(n³)', spaceComplexity: 'O(n²)' },
  ],
  graph: [
    { id: 'bfs', name: 'BFS', description: 'Explores nodes level by level using a queue', timeComplexity: 'O(V+E)', spaceComplexity: 'O(V)' },
    { id: 'dfs', name: 'DFS', description: 'Explores as deep as possible before backtracking', timeComplexity: 'O(V+E)', spaceComplexity: 'O(V)' },
    { id: 'dijkstra', name: 'Dijkstra', description: 'Finds shortest path from source to all nodes using priority queue', timeComplexity: 'O((V+E)logV)', spaceComplexity: 'O(V)' },
    { id: 'bellman-ford', name: 'Bellman-Ford', description: 'Detects negative cycles and finds shortest paths in weighted graphs', timeComplexity: 'O(V×E)', spaceComplexity: 'O(V)' },
    { id: 'floyd-warshall', name: 'Floyd-Warshall', description: 'Finds shortest paths between all pairs of vertices', timeComplexity: 'O(V³)', spaceComplexity: 'O(V²)' },
    { id: 'kruskal', name: "Kruskal's Algorithm", description: 'Builds minimum spanning tree by sorting edges by weight', timeComplexity: 'O(E log E)', spaceComplexity: 'O(V)' },
    { id: 'prim', name: "Prim's Algorithm", description: 'Grows minimum spanning tree from a starting node greedily', timeComplexity: 'O(E log V)', spaceComplexity: 'O(V)' },
  ],
  tree: [
    { id: 'bst-insert', name: 'BST Insert', description: 'Inserts new node at correct BST position', timeComplexity: 'O(h)', spaceComplexity: 'O(1)' },
    { id: 'bst-delete', name: 'BST Delete', description: 'Removes node while maintaining BST property', timeComplexity: 'O(h)', spaceComplexity: 'O(1)' },
    { id: 'bst-search', name: 'BST Search', description: 'Traverses tree to find target value', timeComplexity: 'O(h)', spaceComplexity: 'O(1)' },
    { id: 'inorder', name: 'Inorder Traversal', description: 'Visits Left → Root → Right recursively', timeComplexity: 'O(n)', spaceComplexity: 'O(h)' },
    { id: 'preorder', name: 'Preorder Traversal', description: 'Visits Root → Left → Right recursively', timeComplexity: 'O(n)', spaceComplexity: 'O(h)' },
    { id: 'postorder', name: 'Postorder Traversal', description: 'Visits Left → Right → Root recursively', timeComplexity: 'O(n)', spaceComplexity: 'O(h)' },
  ],
  stack: [
    { id: 'basic-stack-ops', name: 'Basic Operations', description: 'Interactive Push, Pop, Peek, isEmpty, isFull', timeComplexity: 'O(1)', spaceComplexity: 'O(n)', section: 'Interactive' },
    { id: 'balanced-parens', name: 'Balanced Parentheses', description: 'Checks if brackets in an expression are properly matched', timeComplexity: 'O(n)', spaceComplexity: 'O(n)', section: 'Expression Problems' },
    { id: 'infix-postfix', name: 'Infix to Postfix', description: 'Converts infix expression to postfix using operator precedence', timeComplexity: 'O(n)', spaceComplexity: 'O(n)', section: 'Expression Problems' },
    { id: 'infix-prefix', name: 'Infix to Prefix', description: 'Converts infix expression to prefix notation', timeComplexity: 'O(n)', spaceComplexity: 'O(n)', section: 'Expression Problems' },
    { id: 'postfix-eval', name: 'Postfix Evaluation', description: 'Evaluates a postfix expression using a stack of operands', timeComplexity: 'O(n)', spaceComplexity: 'O(n)', section: 'Expression Problems' },
    { id: 'prefix-eval', name: 'Prefix Evaluation', description: 'Evaluates a prefix expression by scanning right to left', timeComplexity: 'O(n)', spaceComplexity: 'O(n)', section: 'Expression Problems' },
  ],
  queue: [
    { id: 'basic-queue-ops', name: 'Basic Queue Operations', description: 'Interactive Enqueue, Dequeue, Front, Rear, isEmpty', timeComplexity: 'O(1)', spaceComplexity: 'O(n)', section: 'Interactive' },
    { id: 'circular-queue-ops', name: 'Circular Queue Operations', description: 'Interactive circular queue with wrap-around', timeComplexity: 'O(1)', spaceComplexity: 'O(n)', section: 'Interactive' },
  ],
};

export const categoryNames: Record<string, string> = {
  sorting: 'SORTING ALGORITHMS',
  dp: 'DYNAMIC PROGRAMMING',
  graph: 'GRAPH ALGORITHMS',
  tree: 'TREE ALGORITHMS',
  stack: 'STACK DATA STRUCTURE',
  queue: 'QUEUE DATA STRUCTURE',
};

export const categoryColors: Record<string, string> = {
  sorting: '#63b3ed',
  dp: '#9f7aea',
  graph: '#fc8181',
  tree: '#68d391',
  stack: '#f6ad55',
  queue: '#4fd1c5',
};