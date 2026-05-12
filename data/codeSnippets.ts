// data/codeSnippets.ts

const defaultCode: Record<string, string> = {
  javascript: `// Implementation
function algorithm(input) {
  // TODO
  return input;
}`,
  python: `# Implementation
def algorithm(input):
    # TODO
    return input`,
  java: `void algorithm(int[] input) {
    // TODO
}`,
  cpp: `void algorithm(vector<int>& input) {
    // TODO
}`,
  c: `void algorithm(int input[], int n) {
    // TODO
}`,
};

export function getCode(algoId: string, lang: string): string {
  return snippets[algoId]?.[lang] || defaultCode[lang] || '// No code available';
}

const snippets: Record<string, Record<string, string>> = {
  // ──────── SORTING ────────
  bubble: {
    javascript: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
    python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
    java: `void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++)
        for (int j = 0; j < n - i - 1; j++)
            if (arr[j] > arr[j + 1]) {
                int t = arr[j]; arr[j] = arr[j+1]; arr[j+1] = t;
            }
}`,
    cpp: `void bubbleSort(vector<int>& a) {
    for (int i = 0; i < (int)a.size()-1; i++)
        for (int j = 0; j < (int)a.size()-i-1; j++)
            if (a[j] > a[j+1]) swap(a[j], a[j+1]);
}`,
    c: `void bubbleSort(int a[], int n) {
    for (int i = 0; i < n-1; i++)
        for (int j = 0; j < n-i-1; j++)
            if (a[j] > a[j+1]) { int t=a[j]; a[j]=a[j+1]; a[j+1]=t; }
}`,
  },
  selection: {
    javascript: `function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let min = i;
    for (let j = i + 1; j < arr.length; j++)
      if (arr[j] < arr[min]) min = j;
    [arr[i], arr[min]] = [arr[min], arr[i]];
  }
  return arr;
}`,
    python: `def selection_sort(arr):
    for i in range(len(arr)-1):
        m = i
        for j in range(i+1, len(arr)):
            if arr[j] < arr[m]: m = j
        arr[i], arr[m] = arr[m], arr[i]
    return arr`,
    java: `void selectionSort(int[] a) {
    for (int i = 0; i < a.length-1; i++) {
        int m = i;
        for (int j = i+1; j < a.length; j++)
            if (a[j] < a[m]) m = j;
        int t = a[i]; a[i] = a[m]; a[m] = t;
    }
}`,
    cpp: `void selectionSort(vector<int>& a) {
    for (int i = 0; i < (int)a.size()-1; i++) {
        int m = i;
        for (int j = i+1; j < (int)a.size(); j++)
            if (a[j] < a[m]) m = j;
        swap(a[i], a[m]);
    }
}`,
    c: `void selectionSort(int a[], int n) {
    for (int i = 0; i < n-1; i++) {
        int m = i;
        for (int j = i+1; j < n; j++)
            if (a[j] < a[m]) m = j;
        int t = a[i]; a[i] = a[m]; a[m] = t;
    }
}`,
  },
  insertion: {
    javascript: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i], j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j]; j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
    python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key, j = arr[i], i - 1
        while j >= 0 and arr[j] > key:
            arr[j+1] = arr[j]; j -= 1
        arr[j+1] = key
    return arr`,
    java: `void insertionSort(int[] a) {
    for (int i = 1; i < a.length; i++) {
        int key = a[i], j = i - 1;
        while (j >= 0 && a[j] > key) { a[j+1] = a[j]; j--; }
        a[j+1] = key;
    }
}`,
    cpp: `void insertionSort(vector<int>& a) {
    for (int i = 1; i < (int)a.size(); i++) {
        int key = a[i], j = i - 1;
        while (j >= 0 && a[j] > key) { a[j+1] = a[j]; j--; }
        a[j+1] = key;
    }
}`,
    c: `void insertionSort(int a[], int n) {
    for (int i = 1; i < n; i++) {
        int key = a[i], j = i - 1;
        while (j >= 0 && a[j] > key) { a[j+1] = a[j]; j--; }
        a[j+1] = key;
    }
}`,
  },
  merge: {
    javascript: `function mergeSort(a, l=0, r=a.length-1) {
  if (l < r) {
    const m = Math.floor((l+r)/2);
    mergeSort(a, l, m);
    mergeSort(a, m+1, r);
    merge(a, l, m, r);
  }
  return a;
}
function merge(a, l, m, r) {
  const L = a.slice(l, m+1), R = a.slice(m+1, r+1);
  let i=0, j=0, k=l;
  while (i < L.length && j < R.length)
    a[k++] = L[i] <= R[j] ? L[i++] : R[j++];
  while (i < L.length) a[k++] = L[i++];
  while (j < R.length) a[k++] = R[j++];
}`,
    python: `def merge_sort(a):
    if len(a) <= 1: return a
    m = len(a)//2
    l, r = merge_sort(a[:m]), merge_sort(a[m:])
    res, i, j = [], 0, 0
    while i < len(l) and j < len(r):
        if l[i] <= r[j]: res.append(l[i]); i += 1
        else: res.append(r[j]); j += 1
    return res + l[i:] + r[j:]`,
    java: `void mergeSort(int[] a, int l, int r) {
    if (l < r) {
        int m = (l+r)/2;
        mergeSort(a, l, m);
        mergeSort(a, m+1, r);
        merge(a, l, m, r);
    }
}`,
    cpp: `void mergeSort(vector<int>& a, int l, int r) {
    if (l < r) {
        int m = (l+r)/2;
        mergeSort(a, l, m); mergeSort(a, m+1, r);
        merge(a, l, m, r);
    }
}`,
    c: `void mergeSort(int a[], int l, int r) {
    if (l < r) {
        int m = (l+r)/2;
        mergeSort(a, l, m); mergeSort(a, m+1, r);
        merge(a, l, m, r);
    }
}`,
  },
  quick: {
    javascript: `function quickSort(a, lo=0, hi=a.length-1) {
  if (lo < hi) {
    const p = partition(a, lo, hi);
    quickSort(a, lo, p-1);
    quickSort(a, p+1, hi);
  }
  return a;
}
function partition(a, lo, hi) {
  const pivot = a[hi];
  let i = lo - 1;
  for (let j = lo; j < hi; j++)
    if (a[j] < pivot) { i++; [a[i],a[j]] = [a[j],a[i]]; }
  [a[i+1], a[hi]] = [a[hi], a[i+1]];
  return i + 1;
}`,
    python: `def quick_sort(a, lo=0, hi=None):
    if hi is None: hi = len(a)-1
    if lo < hi:
        p = partition(a, lo, hi)
        quick_sort(a, lo, p-1)
        quick_sort(a, p+1, hi)
    return a

def partition(a, lo, hi):
    pivot, i = a[hi], lo-1
    for j in range(lo, hi):
        if a[j] < pivot:
            i += 1; a[i], a[j] = a[j], a[i]
    a[i+1], a[hi] = a[hi], a[i+1]
    return i+1`,
    java: `void quickSort(int[] a, int lo, int hi) {
    if (lo < hi) {
        int p = partition(a, lo, hi);
        quickSort(a, lo, p-1);
        quickSort(a, p+1, hi);
    }
}`,
    cpp: `void quickSort(vector<int>& a, int lo, int hi) {
    if (lo < hi) {
        int p = partition(a, lo, hi);
        quickSort(a, lo, p-1);
        quickSort(a, p+1, hi);
    }
}`,
    c: `void quickSort(int a[], int lo, int hi) {
    if (lo < hi) { int p = partition(a, lo, hi); quickSort(a, lo, p-1); quickSort(a, p+1, hi); }
}`,
  },
  heap: {
    javascript: `function heapSort(a) {
  const n = a.length;
  for (let i = Math.floor(n/2)-1; i >= 0; i--) heapify(a, n, i);
  for (let i = n-1; i > 0; i--) { [a[0],a[i]] = [a[i],a[0]]; heapify(a, i, 0); }
  return a;
}
function heapify(a, n, i) {
  let big = i, l = 2*i+1, r = 2*i+2;
  if (l < n && a[l] > a[big]) big = l;
  if (r < n && a[r] > a[big]) big = r;
  if (big !== i) { [a[i],a[big]] = [a[big],a[i]]; heapify(a, n, big); }
}`,
    python: `def heap_sort(a):
    import heapq
    heapq.heapify(a)
    return [heapq.heappop(a) for _ in range(len(a))]`,
    java: `void heapSort(int[] a) {
    int n = a.length;
    for (int i = n/2-1; i >= 0; i--) heapify(a, n, i);
    for (int i = n-1; i > 0; i--) {
        int t = a[0]; a[0] = a[i]; a[i] = t;
        heapify(a, i, 0);
    }
}`,
    cpp: `void heapSort(vector<int>& a) {
    int n = a.size();
    for (int i = n/2-1; i >= 0; i--) heapify(a, n, i);
    for (int i = n-1; i > 0; i--) { swap(a[0], a[i]); heapify(a, i, 0); }
}`,
    c: `void heapSort(int a[], int n) {
    for (int i = n/2-1; i >= 0; i--) heapify(a, n, i);
    for (int i = n-1; i > 0; i--) { int t=a[0]; a[0]=a[i]; a[i]=t; heapify(a,i,0); }
}`,
  },

  // ──────── DP ────────
  fibonacci: {
    javascript: `function fib(n) {
  const dp = [0, 1];
  for (let i = 2; i <= n; i++)
    dp[i] = dp[i-1] + dp[i-2];
  return dp[n];
}`,
    python: `def fib(n):
    dp = [0, 1]
    for i in range(2, n+1):
        dp.append(dp[i-1] + dp[i-2])
    return dp[n]`,
    java: `int fib(int n) {
    int[] dp = new int[n+1];
    dp[0]=0; dp[1]=1;
    for (int i=2; i<=n; i++) dp[i]=dp[i-1]+dp[i-2];
    return dp[n];
}`,
    cpp: `int fib(int n) {
    vector<int> dp(n+1);
    dp[0]=0; dp[1]=1;
    for (int i=2; i<=n; i++) dp[i]=dp[i-1]+dp[i-2];
    return dp[n];
}`,
    c: `int fib(int n) {
    int dp[n+1]; dp[0]=0; dp[1]=1;
    for (int i=2; i<=n; i++) dp[i]=dp[i-1]+dp[i-2];
    return dp[n];
}`,
  },
  knapsack: {
    javascript: `function knapsack(W, V, cap) {
  const n = W.length;
  const dp = Array(n+1).fill(0).map(() => Array(cap+1).fill(0));
  for (let i = 1; i <= n; i++)
    for (let w = 1; w <= cap; w++)
      dp[i][w] = W[i-1] <= w
        ? Math.max(dp[i-1][w], V[i-1] + dp[i-1][w - W[i-1]])
        : dp[i-1][w];
  return dp[n][cap];
}`,
    python: `def knapsack(W, V, cap):
    n = len(W)
    dp = [[0]*(cap+1) for _ in range(n+1)]
    for i in range(1, n+1):
        for w in range(1, cap+1):
            if W[i-1] <= w:
                dp[i][w] = max(dp[i-1][w], V[i-1]+dp[i-1][w-W[i-1]])
            else:
                dp[i][w] = dp[i-1][w]
    return dp[n][cap]`,
    java: `int knapsack(int[] W, int[] V, int cap) {
    int n = W.length;
    int[][] dp = new int[n+1][cap+1];
    for (int i=1; i<=n; i++)
        for (int w=1; w<=cap; w++)
            dp[i][w] = W[i-1]<=w ? Math.max(dp[i-1][w], V[i-1]+dp[i-1][w-W[i-1]]) : dp[i-1][w];
    return dp[n][cap];
}`,
    cpp: `int knapsack(vector<int>& W, vector<int>& V, int cap) {
    int n = W.size();
    vector<vector<int>> dp(n+1, vector<int>(cap+1, 0));
    for (int i=1; i<=n; i++)
        for (int w=1; w<=cap; w++)
            dp[i][w] = W[i-1]<=w ? max(dp[i-1][w], V[i-1]+dp[i-1][w-W[i-1]]) : dp[i-1][w];
    return dp[n][cap];
}`,
    c: `int knapsack(int W[], int V[], int n, int cap) {
    int dp[n+1][cap+1];
    memset(dp, 0, sizeof(dp));
    for (int i=1; i<=n; i++)
        for (int w=1; w<=cap; w++)
            dp[i][w] = W[i-1]<=w ? (dp[i-1][w] > V[i-1]+dp[i-1][w-W[i-1]] ? dp[i-1][w] : V[i-1]+dp[i-1][w-W[i-1]]) : dp[i-1][w];
    return dp[n][cap];
}`,
  },
  lcs: {
    javascript: `function lcs(a, b) {
  const m = a.length, n = b.length;
  const dp = Array(m+1).fill(0).map(() => Array(n+1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j], dp[i][j-1]);
  return dp[m][n];
}`,
    python: `def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(1, m+1):
        for j in range(1, n+1):
            dp[i][j] = dp[i-1][j-1]+1 if a[i-1]==b[j-1] else max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]`,
    java: `int lcs(String a, String b) {
    int m=a.length(), n=b.length();
    int[][] dp = new int[m+1][n+1];
    for (int i=1;i<=m;i++) for (int j=1;j<=n;j++)
        dp[i][j] = a.charAt(i-1)==b.charAt(j-1) ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j],dp[i][j-1]);
    return dp[m][n];
}`,
    cpp: `int lcs(string a, string b) {
    int m=a.size(), n=b.size();
    vector<vector<int>> dp(m+1, vector<int>(n+1, 0));
    for (int i=1;i<=m;i++) for (int j=1;j<=n;j++)
        dp[i][j] = a[i-1]==b[j-1] ? dp[i-1][j-1]+1 : max(dp[i-1][j],dp[i][j-1]);
    return dp[m][n];
}`,
    c: `int lcs(char *a, char *b) {
    int m=strlen(a), n=strlen(b);
    int dp[m+1][n+1]; memset(dp,0,sizeof(dp));
    for (int i=1;i<=m;i++) for (int j=1;j<=n;j++)
        dp[i][j] = a[i-1]==b[j-1] ? dp[i-1][j-1]+1 : (dp[i-1][j]>dp[i][j-1]?dp[i-1][j]:dp[i][j-1]);
    return dp[m][n];
}`,
  },
  lis: {
    javascript: `function lis(arr) {
  const dp = Array(arr.length).fill(1);
  for (let i = 1; i < arr.length; i++)
    for (let j = 0; j < i; j++)
      if (arr[j] < arr[i]) dp[i] = Math.max(dp[i], dp[j]+1);
  return Math.max(...dp);
}`,
    python: `def lis(arr):
    dp = [1]*len(arr)
    for i in range(1, len(arr)):
        for j in range(i):
            if arr[j] < arr[i]: dp[i] = max(dp[i], dp[j]+1)
    return max(dp)`,
    java: `int lis(int[] a) {
    int[] dp = new int[a.length]; Arrays.fill(dp,1);
    for (int i=1;i<a.length;i++) for (int j=0;j<i;j++)
        if (a[j]<a[i]) dp[i]=Math.max(dp[i],dp[j]+1);
    return Arrays.stream(dp).max().getAsInt();
}`,
    cpp: `int lis(vector<int>& a) {
    vector<int> dp(a.size(), 1);
    for (int i=1;i<(int)a.size();i++) for (int j=0;j<i;j++)
        if (a[j]<a[i]) dp[i]=max(dp[i],dp[j]+1);
    return *max_element(dp.begin(),dp.end());
}`,
    c: `int lis(int a[], int n) {
    int dp[n]; for(int i=0;i<n;i++) dp[i]=1;
    for (int i=1;i<n;i++) for (int j=0;j<i;j++)
        if (a[j]<a[i] && dp[j]+1>dp[i]) dp[i]=dp[j]+1;
    int mx=dp[0]; for(int i=1;i<n;i++) if(dp[i]>mx) mx=dp[i]; return mx;
}`,
  },
  mcm: {
    javascript: `function mcm(dims) {
  const n = dims.length - 1;
  const dp = Array(n).fill(0).map(()=>Array(n).fill(0));
  for (let len = 2; len <= n; len++)
    for (let i = 0; i < n-len+1; i++) {
      const j = i+len-1; dp[i][j] = Infinity;
      for (let k = i; k < j; k++)
        dp[i][j] = Math.min(dp[i][j], dp[i][k]+dp[k+1][j]+dims[i]*dims[k+1]*dims[j+1]);
    }
  return dp[0][n-1];
}`,
    python: `def mcm(dims):
    n = len(dims)-1
    dp = [[0]*n for _ in range(n)]
    for l in range(2, n+1):
        for i in range(n-l+1):
            j = i+l-1; dp[i][j] = float('inf')
            for k in range(i, j):
                dp[i][j] = min(dp[i][j], dp[i][k]+dp[k+1][j]+dims[i]*dims[k+1]*dims[j+1])
    return dp[0][n-1]`,
    java: `int mcm(int[] d) {
    int n=d.length-1; int[][] dp=new int[n][n];
    for (int l=2;l<=n;l++) for (int i=0;i<n-l+1;i++) {
        int j=i+l-1; dp[i][j]=Integer.MAX_VALUE;
        for (int k=i;k<j;k++) dp[i][j]=Math.min(dp[i][j],dp[i][k]+dp[k+1][j]+d[i]*d[k+1]*d[j+1]);
    } return dp[0][n-1];
}`,
    cpp: `int mcm(vector<int>& d) {
    int n=d.size()-1; vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int l=2;l<=n;l++) for (int i=0;i<n-l+1;i++) {
        int j=i+l-1; dp[i][j]=INT_MAX;
        for (int k=i;k<j;k++) dp[i][j]=min(dp[i][j],dp[i][k]+dp[k+1][j]+d[i]*d[k+1]*d[j+1]);
    } return dp[0][n-1];
}`,
    c: `int mcm(int d[], int sz) {
    int n=sz-1, dp[n][n]; memset(dp,0,sizeof(dp));
    for (int l=2;l<=n;l++) for (int i=0;i<n-l+1;i++) {
        int j=i+l-1; dp[i][j]=INT_MAX;
        for (int k=i;k<j;k++) { int c=dp[i][k]+dp[k+1][j]+d[i]*d[k+1]*d[j+1]; if(c<dp[i][j]) dp[i][j]=c; }
    } return dp[0][n-1];
}`,
  },

  // ──────── GRAPH ────────
  bfs: {
    javascript: `function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start], result = [];
  while (queue.length) {
    const node = queue.shift();
    result.push(node);
    for (const nb of graph[node] || [])
      if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
  }
  return result;
}`,
    python: `from collections import deque
def bfs(graph, start):
    visited, queue, result = {start}, deque([start]), []
    while queue:
        node = queue.popleft()
        result.append(node)
        for nb in graph.get(node, []):
            if nb not in visited:
                visited.add(nb); queue.append(nb)
    return result`,
    java: `void bfs(List<List<Integer>> g, int s) {
    boolean[] vis = new boolean[g.size()];
    Queue<Integer> q = new LinkedList<>();
    vis[s] = true; q.add(s);
    while (!q.isEmpty()) {
        int n = q.poll(); System.out.print(n+" ");
        for (int nb : g.get(n)) if (!vis[nb]) { vis[nb]=true; q.add(nb); }
    }
}`,
    cpp: `void bfs(vector<vector<int>>& g, int s) {
    vector<bool> vis(g.size(), false);
    queue<int> q; vis[s]=true; q.push(s);
    while (!q.empty()) {
        int n=q.front(); q.pop(); cout<<n<<" ";
        for (int nb : g[n]) if (!vis[nb]) { vis[nb]=true; q.push(nb); }
    }
}`,
    c: `void bfs(int g[][10], int n, int s) {
    int vis[10]={0}, q[10], f=0, r=0;
    vis[s]=1; q[r++]=s;
    while (f<r) {
        int nd=q[f++]; printf("%d ",nd);
        for (int i=0;i<n;i++) if (g[nd][i]&&!vis[i]) { vis[i]=1; q[r++]=i; }
    }
}`,
  },
  dfs: {
    javascript: `function dfs(graph, node, visited = new Set()) {
  visited.add(node);
  console.log(node);
  for (const nb of graph[node] || [])
    if (!visited.has(nb)) dfs(graph, nb, visited);
  return visited;
}`,
    python: `def dfs(graph, node, visited=None):
    if visited is None: visited = set()
    visited.add(node)
    print(node)
    for nb in graph.get(node, []):
        if nb not in visited: dfs(graph, nb, visited)
    return visited`,
    java: `void dfs(List<List<Integer>> g, int n, boolean[] vis) {
    vis[n] = true; System.out.print(n+" ");
    for (int nb : g.get(n)) if (!vis[nb]) dfs(g, nb, vis);
}`,
    cpp: `void dfs(vector<vector<int>>& g, int n, vector<bool>& vis) {
    vis[n]=true; cout<<n<<" ";
    for (int nb : g[n]) if (!vis[nb]) dfs(g, nb, vis);
}`,
    c: `void dfs(int g[][10], int n, int node, int vis[]) {
    vis[node]=1; printf("%d ",node);
    for (int i=0;i<n;i++) if (g[node][i]&&!vis[i]) dfs(g,n,i,vis);
}`,
  },
  dijkstra: {
    javascript: `function dijkstra(graph, start) {
  const dist = {}, visited = new Set();
  for (const n in graph) dist[n] = Infinity;
  dist[start] = 0;
  const pq = [[0, start]];
  while (pq.length) {
    pq.sort((a,b)=>a[0]-b[0]);
    const [d, u] = pq.shift();
    if (visited.has(u)) continue;
    visited.add(u);
    for (const [v, w] of graph[u] || [])
      if (dist[u]+w < dist[v]) { dist[v]=dist[u]+w; pq.push([dist[v],v]); }
  }
  return dist;
}`,
    python: `import heapq
def dijkstra(graph, start):
    dist = {n: float('inf') for n in graph}
    dist[start] = 0
    pq = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]: continue
        for v, w in graph[u]:
            if dist[u]+w < dist[v]:
                dist[v] = dist[u]+w
                heapq.heappush(pq, (dist[v], v))
    return dist`,
    java: `void dijkstra(int[][] g, int s, int n) {
    int[] dist = new int[n]; Arrays.fill(dist, Integer.MAX_VALUE);
    dist[s] = 0;
    PriorityQueue<int[]> pq = new PriorityQueue<>((a,b)->a[0]-b[0]);
    pq.offer(new int[]{0,s});
    while (!pq.isEmpty()) {
        int[] cur = pq.poll(); int d=cur[0], u=cur[1];
        if (d > dist[u]) continue;
        for (int v=0;v<n;v++) if (g[u][v]!=0 && dist[u]+g[u][v]<dist[v]) {
            dist[v]=dist[u]+g[u][v]; pq.offer(new int[]{dist[v],v});
        }
    }
}`,
    cpp: `void dijkstra(vector<vector<pair<int,int>>>& g, int s) {
    int n=g.size(); vector<int> dist(n, INT_MAX);
    priority_queue<pair<int,int>,vector<pair<int,int>>,greater<>> pq;
    dist[s]=0; pq.push({0,s});
    while (!pq.empty()) {
        auto [d,u]=pq.top(); pq.pop();
        if (d>dist[u]) continue;
        for (auto [v,w]:g[u]) if (dist[u]+w<dist[v]) { dist[v]=dist[u]+w; pq.push({dist[v],v}); }
    }
}`,
    c: `void dijkstra(int g[][10], int n, int s) {
    int dist[10], vis[10]={0};
    for (int i=0;i<n;i++) dist[i]=INT_MAX;
    dist[s]=0;
    for (int c=0;c<n-1;c++) {
        int u=-1;
        for (int i=0;i<n;i++) if (!vis[i]&&(u==-1||dist[i]<dist[u])) u=i;
        vis[u]=1;
        for (int v=0;v<n;v++) if (g[u][v]&&!vis[v]&&dist[u]+g[u][v]<dist[v]) dist[v]=dist[u]+g[u][v];
    }
}`,
  },
  'bellman-ford': {
    javascript: `function bellmanFord(edges, V, src) {
  const dist = Array(V).fill(Infinity);
  dist[src] = 0;
  for (let i = 0; i < V - 1; i++)
    for (const [u, v, w] of edges)
      if (dist[u] !== Infinity && dist[u] + w < dist[v])
        dist[v] = dist[u] + w;
  // Check negative cycle
  for (const [u, v, w] of edges)
    if (dist[u] !== Infinity && dist[u] + w < dist[v])
      return null; // negative cycle
  return dist;
}`,
    python: `def bellman_ford(edges, V, src):
    dist = [float('inf')] * V
    dist[src] = 0
    for _ in range(V - 1):
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            return None  # negative cycle
    return dist`,
    java: `int[] bellmanFord(int[][] edges, int V, int src) {
    int[] dist = new int[V]; Arrays.fill(dist, Integer.MAX_VALUE);
    dist[src] = 0;
    for (int i = 0; i < V-1; i++)
        for (int[] e : edges)
            if (dist[e[0]] != Integer.MAX_VALUE && dist[e[0]]+e[2] < dist[e[1]])
                dist[e[1]] = dist[e[0]] + e[2];
    return dist;
}`,
    cpp: `vector<int> bellmanFord(vector<tuple<int,int,int>>& edges, int V, int src) {
    vector<int> dist(V, INT_MAX); dist[src] = 0;
    for (int i = 0; i < V-1; i++)
        for (auto& [u,v,w] : edges)
            if (dist[u]!=INT_MAX && dist[u]+w<dist[v]) dist[v]=dist[u]+w;
    return dist;
}`,
    c: `void bellmanFord(int edges[][3], int E, int V, int src, int dist[]) {
    for (int i=0;i<V;i++) dist[i]=INT_MAX;
    dist[src]=0;
    for (int i=0;i<V-1;i++)
        for (int j=0;j<E;j++)
            if (dist[edges[j][0]]!=INT_MAX && dist[edges[j][0]]+edges[j][2]<dist[edges[j][1]])
                dist[edges[j][1]] = dist[edges[j][0]]+edges[j][2];
}`,
  },
  'floyd-warshall': {
    javascript: `function floydWarshall(graph) {
  const n = graph.length;
  const dist = graph.map(row => [...row]);
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (dist[i][k] + dist[k][j] < dist[i][j])
          dist[i][j] = dist[i][k] + dist[k][j];
  return dist;
}`,
    python: `def floyd_warshall(graph):
    n = len(graph)
    dist = [row[:] for row in graph]
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    return dist`,
    java: `void floydWarshall(int[][] g) {
    int n = g.length;
    for (int k=0;k<n;k++)
        for (int i=0;i<n;i++)
            for (int j=0;j<n;j++)
                if (g[i][k]+g[k][j] < g[i][j])
                    g[i][j] = g[i][k]+g[k][j];
}`,
    cpp: `void floydWarshall(vector<vector<int>>& g) {
    int n = g.size();
    for (int k=0;k<n;k++)
        for (int i=0;i<n;i++)
            for (int j=0;j<n;j++)
                g[i][j] = min(g[i][j], g[i][k]+g[k][j]);
}`,
    c: `void floydWarshall(int g[][10], int n) {
    for (int k=0;k<n;k++)
        for (int i=0;i<n;i++)
            for (int j=0;j<n;j++)
                if (g[i][k]+g[k][j]<g[i][j]) g[i][j]=g[i][k]+g[k][j];
}`,
  },
  kruskal: {
    javascript: `function kruskal(edges, V) {
  edges.sort((a,b) => a[2] - b[2]);
  const parent = Array.from({length: V}, (_,i) => i);
  const find = x => parent[x] === x ? x : (parent[x] = find(parent[x]));
  const union = (a,b) => { parent[find(a)] = find(b); };
  const mst = [];
  for (const [u,v,w] of edges) {
    if (find(u) !== find(v)) {
      union(u, v); mst.push([u, v, w]);
    }
  }
  return mst;
}`,
    python: `def kruskal(edges, V):
    edges.sort(key=lambda x: x[2])
    parent = list(range(V))
    def find(x):
        if parent[x] != x: parent[x] = find(parent[x])
        return parent[x]
    mst = []
    for u, v, w in edges:
        if find(u) != find(v):
            parent[find(u)] = find(v)
            mst.append((u, v, w))
    return mst`,
    java: `List<int[]> kruskal(int[][] edges, int V) {
    Arrays.sort(edges, (a,b)->a[2]-b[2]);
    int[] parent = new int[V];
    for (int i=0;i<V;i++) parent[i]=i;
    List<int[]> mst = new ArrayList<>();
    for (int[] e : edges)
        if (find(parent,e[0]) != find(parent,e[1])) {
            union(parent,e[0],e[1]); mst.add(e);
        }
    return mst;
}`,
    cpp: `vector<tuple<int,int,int>> kruskal(vector<tuple<int,int,int>>& edges, int V) {
    sort(edges.begin(), edges.end(), [](auto& a, auto& b){ return get<2>(a)<get<2>(b); });
    vector<int> par(V); iota(par.begin(), par.end(), 0);
    function<int(int)> find = [&](int x){ return par[x]==x?x:par[x]=find(par[x]); };
    vector<tuple<int,int,int>> mst;
    for (auto& [u,v,w] : edges)
        if (find(u)!=find(v)) { par[find(u)]=find(v); mst.push_back({u,v,w}); }
    return mst;
}`,
    c: `// Kruskal's Algorithm (simplified)
int parent[100];
int find(int x) { return parent[x]==x?x:(parent[x]=find(parent[x])); }
void kruskal(int edges[][3], int E, int V) {
    // Sort edges by weight first
    for (int i=0;i<V;i++) parent[i]=i;
    for (int i=0;i<E;i++)
        if (find(edges[i][0])!=find(edges[i][1])) {
            parent[find(edges[i][0])]=find(edges[i][1]);
            printf("%d-%d: %d\\n",edges[i][0],edges[i][1],edges[i][2]);
        }
}`,
  },
  prim: {
    javascript: `function prim(graph, V) {
  const key = Array(V).fill(Infinity);
  const inMST = Array(V).fill(false);
  key[0] = 0;
  let totalWeight = 0;
  for (let count = 0; count < V; count++) {
    let u = -1;
    for (let i = 0; i < V; i++)
      if (!inMST[i] && (u===-1 || key[i] < key[u])) u = i;
    inMST[u] = true;
    totalWeight += key[u];
    for (const [v, w] of graph[u] || [])
      if (!inMST[v] && w < key[v]) key[v] = w;
  }
  return totalWeight;
}`,
    python: `import heapq
def prim(graph, V):
    key = [float('inf')] * V
    in_mst = [False] * V
    key[0] = 0
    pq = [(0, 0)]
    total = 0
    while pq:
        w, u = heapq.heappop(pq)
        if in_mst[u]: continue
        in_mst[u] = True; total += w
        for v, wt in graph[u]:
            if not in_mst[v] and wt < key[v]:
                key[v] = wt
                heapq.heappush(pq, (wt, v))
    return total`,
    java: `int prim(int[][] g, int V) {
    int[] key = new int[V]; Arrays.fill(key, Integer.MAX_VALUE);
    boolean[] inMST = new boolean[V];
    key[0] = 0; int total = 0;
    for (int c=0;c<V;c++) {
        int u=-1;
        for (int i=0;i<V;i++) if (!inMST[i]&&(u==-1||key[i]<key[u])) u=i;
        inMST[u]=true; total+=key[u];
        for (int v=0;v<V;v++) if (g[u][v]!=0&&!inMST[v]&&g[u][v]<key[v]) key[v]=g[u][v];
    } return total;
}`,
    cpp: `int prim(vector<vector<pair<int,int>>>& g, int V) {
    vector<int> key(V, INT_MAX); vector<bool> inMST(V, false);
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    key[0]=0; pq.push({0,0}); int total=0;
    while (!pq.empty()) {
        auto [w,u]=pq.top(); pq.pop();
        if (inMST[u]) continue; inMST[u]=true; total+=w;
        for (auto [v,wt]:g[u]) if (!inMST[v]&&wt<key[v]) { key[v]=wt; pq.push({wt,v}); }
    } return total;
}`,
    c: `int prim(int g[][10], int V) {
    int key[10], inMST[10]={0}, total=0;
    for (int i=0;i<V;i++) key[i]=INT_MAX;
    key[0]=0;
    for (int c=0;c<V;c++) {
        int u=-1;
        for (int i=0;i<V;i++) if (!inMST[i]&&(u==-1||key[i]<key[u])) u=i;
        inMST[u]=1; total+=key[u];
        for (int v=0;v<V;v++) if (g[u][v]&&!inMST[v]&&g[u][v]<key[v]) key[v]=g[u][v];
    } return total;
}`,
  },

  // ──────── TREE ────────
  'bst-insert': {
    javascript: `function insert(root, val) {
  if (!root) return { val, left: null, right: null };
  if (val < root.val) root.left = insert(root.left, val);
  else root.right = insert(root.right, val);
  return root;
}`,
    python: `def insert(root, val):
    if not root: return Node(val)
    if val < root.val: root.left = insert(root.left, val)
    else: root.right = insert(root.right, val)
    return root`,
    java: `Node insert(Node root, int val) {
    if (root==null) return new Node(val);
    if (val<root.val) root.left=insert(root.left,val);
    else root.right=insert(root.right,val);
    return root;
}`,
    cpp: `Node* insert(Node* root, int val) {
    if (!root) return new Node(val);
    if (val<root->val) root->left=insert(root->left,val);
    else root->right=insert(root->right,val);
    return root;
}`,
    c: `Node* insert(Node* root, int val) {
    if (!root) return createNode(val);
    if (val<root->val) root->left=insert(root->left,val);
    else root->right=insert(root->right,val);
    return root;
}`,
  },
  'bst-delete': {
    javascript: `function deleteNode(root, key) {
  if (!root) return null;
  if (key < root.val) root.left = deleteNode(root.left, key);
  else if (key > root.val) root.right = deleteNode(root.right, key);
  else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    let min = root.right;
    while (min.left) min = min.left;
    root.val = min.val;
    root.right = deleteNode(root.right, min.val);
  }
  return root;
}`,
    python: `def delete_node(root, key):
    if not root: return None
    if key < root.val: root.left = delete_node(root.left, key)
    elif key > root.val: root.right = delete_node(root.right, key)
    else:
        if not root.left: return root.right
        if not root.right: return root.left
        mn = root.right
        while mn.left: mn = mn.left
        root.val = mn.val
        root.right = delete_node(root.right, mn.val)
    return root`,
    java: `Node delete(Node root, int key) {
    if (root==null) return null;
    if (key<root.val) root.left=delete(root.left,key);
    else if (key>root.val) root.right=delete(root.right,key);
    else {
        if (root.left==null) return root.right;
        if (root.right==null) return root.left;
        Node mn=root.right; while(mn.left!=null) mn=mn.left;
        root.val=mn.val; root.right=delete(root.right,mn.val);
    } return root;
}`,
    cpp: `Node* del(Node* root, int key) {
    if (!root) return nullptr;
    if (key<root->val) root->left=del(root->left,key);
    else if (key>root->val) root->right=del(root->right,key);
    else {
        if (!root->left) return root->right;
        if (!root->right) return root->left;
        Node* mn=root->right; while(mn->left) mn=mn->left;
        root->val=mn->val; root->right=del(root->right,mn->val);
    } return root;
}`,
    c: `Node* del(Node* root, int key) {
    if (!root) return NULL;
    if (key<root->val) root->left=del(root->left,key);
    else if (key>root->val) root->right=del(root->right,key);
    else {
        if (!root->left) return root->right;
        if (!root->right) return root->left;
        Node* mn=root->right; while(mn->left) mn=mn->left;
        root->val=mn->val; root->right=del(root->right,mn->val);
    } return root;
}`,
  },
  'bst-search': {
    javascript: `function search(root, val) {
  if (!root || root.val === val) return root;
  return val < root.val ? search(root.left, val) : search(root.right, val);
}`,
    python: `def search(root, val):
    if not root or root.val == val: return root
    return search(root.left, val) if val < root.val else search(root.right, val)`,
    java: `Node search(Node root, int val) {
    if (root==null || root.val==val) return root;
    return val<root.val ? search(root.left,val) : search(root.right,val);
}`,
    cpp: `Node* search(Node* root, int val) {
    if (!root || root->val==val) return root;
    return val<root->val ? search(root->left,val) : search(root->right,val);
}`,
    c: `Node* search(Node* root, int val) {
    if (!root || root->val==val) return root;
    return val<root->val ? search(root->left,val) : search(root->right,val);
}`,
  },
  inorder: {
    javascript: `function inorder(root) {
  if (!root) return;
  inorder(root.left);
  console.log(root.val);
  inorder(root.right);
}`,
    python: `def inorder(root):
    if not root: return
    inorder(root.left)
    print(root.val)
    inorder(root.right)`,
    java: `void inorder(Node root) {
    if (root==null) return;
    inorder(root.left);
    System.out.print(root.val+" ");
    inorder(root.right);
}`,
    cpp: `void inorder(Node* root) {
    if (!root) return;
    inorder(root->left);
    cout << root->val << " ";
    inorder(root->right);
}`,
    c: `void inorder(Node* root) {
    if (!root) return;
    inorder(root->left);
    printf("%d ",root->val);
    inorder(root->right);
}`,
  },
  preorder: {
    javascript: `function preorder(root) {
  if (!root) return;
  console.log(root.val);
  preorder(root.left);
  preorder(root.right);
}`,
    python: `def preorder(root):
    if not root: return
    print(root.val)
    preorder(root.left)
    preorder(root.right)`,
    java: `void preorder(Node root) {
    if (root==null) return;
    System.out.print(root.val+" ");
    preorder(root.left);
    preorder(root.right);
}`,
    cpp: `void preorder(Node* root) {
    if (!root) return;
    cout << root->val << " ";
    preorder(root->left);
    preorder(root->right);
}`,
    c: `void preorder(Node* root) {
    if (!root) return;
    printf("%d ",root->val);
    preorder(root->left);
    preorder(root->right);
}`,
  },
  postorder: {
    javascript: `function postorder(root) {
  if (!root) return;
  postorder(root.left);
  postorder(root.right);
  console.log(root.val);
}`,
    python: `def postorder(root):
    if not root: return
    postorder(root.left)
    postorder(root.right)
    print(root.val)`,
    java: `void postorder(Node root) {
    if (root==null) return;
    postorder(root.left);
    postorder(root.right);
    System.out.print(root.val+" ");
}`,
    cpp: `void postorder(Node* root) {
    if (!root) return;
    postorder(root->left);
    postorder(root->right);
    cout << root->val << " ";
}`,
    c: `void postorder(Node* root) {
    if (!root) return;
    postorder(root->left);
    postorder(root->right);
    printf("%d ",root->val);
}`,
  },

  // ──────── STACK ────────
  'stack-push': {
    javascript: `class Stack {
  constructor() { this.items = []; }
  push(val) { this.items.push(val); }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
  isEmpty() { return this.items.length === 0; }
}`,
    python: `class Stack:
    def __init__(self):
        self.items = []
    def push(self, val):
        self.items.append(val)
    def pop(self):
        return self.items.pop()
    def peek(self):
        return self.items[-1]
    def is_empty(self):
        return len(self.items) == 0`,
    java: `class Stack {
    int[] arr; int top;
    Stack(int size) { arr = new int[size]; top = -1; }
    void push(int val) { arr[++top] = val; }
    int pop() { return arr[top--]; }
    int peek() { return arr[top]; }
    boolean isEmpty() { return top == -1; }
}`,
    cpp: `class Stack {
    vector<int> v;
public:
    void push(int val) { v.push_back(val); }
    int pop() { int t = v.back(); v.pop_back(); return t; }
    int peek() { return v.back(); }
    bool isEmpty() { return v.empty(); }
};`,
    c: `#define MAX 100
int stack[MAX], top = -1;
void push(int val) { stack[++top] = val; }
int pop() { return stack[top--]; }
int peek() { return stack[top]; }
int isEmpty() { return top == -1; }`,
  },
  'balanced-parens': {
    javascript: `function isBalanced(s) {
  const stack = [], map = {')':'(',']':'[','}':'{'};
  for (const c of s) {
    if ('([{'.includes(c)) stack.push(c);
    else if (stack.pop() !== map[c]) return false;
  }
  return stack.length === 0;
}`,
    python: `def is_balanced(s):
    stack = []
    pairs = {')':'(',']':'[','}':'{'}
    for c in s:
        if c in '([{': stack.append(c)
        elif not stack or stack.pop() != pairs[c]: return False
    return len(stack) == 0`,
    java: `boolean isBalanced(String s) {
    Stack<Character> st = new Stack<>();
    for (char c : s.toCharArray()) {
        if (c=='('||c=='['||c=='{') st.push(c);
        else {
            if (st.isEmpty()) return false;
            char top = st.pop();
            if (c==')'&&top!='(' || c==']'&&top!='[' || c=='}'&&top!='{') return false;
        }
    } return st.isEmpty();
}`,
    cpp: `bool isBalanced(string s) {
    stack<char> st;
    for (char c : s) {
        if (c=='('||c=='['||c=='{') st.push(c);
        else {
            if (st.empty()) return false;
            char top = st.top(); st.pop();
            if (c==')'&&top!='(' || c==']'&&top!='[' || c=='}'&&top!='{') return false;
        }
    } return st.empty();
}`,
    c: `int isBalanced(char s[]) {
    char stack[100]; int top=-1;
    for (int i=0; s[i]; i++) {
        if (s[i]=='('||s[i]=='['||s[i]=='{') stack[++top]=s[i];
        else {
            if (top==-1) return 0;
            char t=stack[top--];
            if (s[i]==')'&&t!='(' || s[i]==']'&&t!='[' || s[i]=='}'&&t!='{') return 0;
        }
    } return top==-1;
}`,
  },
  'infix-postfix': {
    javascript: `function infixToPostfix(expr) {
  const prec = {'+':1,'-':1,'*':2,'/':2,'^':3};
  const stack = []; let result = '';
  for (const c of expr) {
    if (/[a-zA-Z0-9]/.test(c)) result += c;
    else if (c === '(') stack.push(c);
    else if (c === ')') {
      while (stack.length && stack[stack.length-1] !== '(') result += stack.pop();
      stack.pop();
    } else {
      while (stack.length && prec[stack[stack.length-1]] >= prec[c]) result += stack.pop();
      stack.push(c);
    }
  }
  while (stack.length) result += stack.pop();
  return result;
}`,
    python: `def infix_to_postfix(expr):
    prec = {'+':1,'-':1,'*':2,'/':2,'^':3}
    stack, result = [], []
    for c in expr:
        if c.isalnum(): result.append(c)
        elif c == '(': stack.append(c)
        elif c == ')':
            while stack and stack[-1]!='(': result.append(stack.pop())
            stack.pop()
        else:
            while stack and stack[-1]!='(' and prec.get(stack[-1],0)>=prec.get(c,0):
                result.append(stack.pop())
            stack.append(c)
    while stack: result.append(stack.pop())
    return ''.join(result)`,
    java: `String infixToPostfix(String expr) {
    StringBuilder res = new StringBuilder();
    Stack<Character> st = new Stack<>();
    for (char c : expr.toCharArray()) {
        if (Character.isLetterOrDigit(c)) res.append(c);
        else if (c=='(') st.push(c);
        else if (c==')') { while(st.peek()!='(') res.append(st.pop()); st.pop(); }
        else { while(!st.isEmpty()&&prec(st.peek())>=prec(c)) res.append(st.pop()); st.push(c); }
    } while(!st.isEmpty()) res.append(st.pop());
    return res.toString();
}`,
    cpp: `string infixToPostfix(string expr) {
    string res; stack<char> st;
    auto prec = [](char c) { return c=='+'||c=='-'?1:c=='*'||c=='/'?2:c=='^'?3:0; };
    for (char c : expr) {
        if (isalnum(c)) res+=c;
        else if (c=='(') st.push(c);
        else if (c==')') { while(st.top()!='(') { res+=st.top(); st.pop(); } st.pop(); }
        else { while(!st.empty()&&prec(st.top())>=prec(c)) { res+=st.top(); st.pop(); } st.push(c); }
    } while(!st.empty()) { res+=st.top(); st.pop(); }
    return res;
}`,
    c: `void infixToPostfix(char* expr, char* result) {
    char stack[100]; int top=-1, k=0;
    for (int i=0; expr[i]; i++) {
        if (isalnum(expr[i])) result[k++]=expr[i];
        else if (expr[i]=='(') stack[++top]=expr[i];
        else if (expr[i]==')') { while(stack[top]!='(') result[k++]=stack[top--]; top--; }
        else { while(top>=0&&prec(stack[top])>=prec(expr[i])) result[k++]=stack[top--]; stack[++top]=expr[i]; }
    } while(top>=0) result[k++]=stack[top--]; result[k]='\0';
}`,
  },
  'infix-prefix': {
    javascript: `function infixToPrefix(expr) {
  // Reverse, swap brackets, convert to postfix, reverse
  const rev = expr.split('').reverse()
    .map(c => c==='(' ? ')' : c===')' ? '(' : c).join('');
  return infixToPostfix(rev).split('').reverse().join('');
}`,
    python: `def infix_to_prefix(expr):
    rev = expr[::-1]
    rev = rev.replace('(', 'TEMP').replace(')', '(').replace('TEMP', ')')
    postfix = infix_to_postfix(rev)
    return postfix[::-1]`,
    java: `String infixToPrefix(String expr) {
    String rev = new StringBuilder(expr).reverse().toString();
    rev = rev.replace('(','X').replace(')','(').replace('X',')');
    String postfix = infixToPostfix(rev);
    return new StringBuilder(postfix).reverse().toString();
}`,
    cpp: `string infixToPrefix(string expr) {
    reverse(expr.begin(), expr.end());
    for (auto& c : expr) c='('?c=')':c==')'?c='(':c;
    string postfix = infixToPostfix(expr);
    reverse(postfix.begin(), postfix.end());
    return postfix;
}`,
    c: `// Reverse + swap brackets + postfix + reverse
void infixToPrefix(char* expr, char* result) {
    // 1. Reverse expr  2. Swap brackets  3. infixToPostfix  4. Reverse result
}`,
  },
  'postfix-eval': {
    javascript: `function evalPostfix(expr) {
  const stack = [];
  for (const c of expr.split(' ')) {
    if (!isNaN(c)) stack.push(Number(c));
    else {
      const b = stack.pop(), a = stack.pop();
      if (c==='+') stack.push(a+b);
      else if (c==='-') stack.push(a-b);
      else if (c==='*') stack.push(a*b);
      else if (c==='/') stack.push(Math.floor(a/b));
    }
  }
  return stack[0];
}`,
    python: `def eval_postfix(expr):
    stack = []
    for token in expr.split():
        if token.lstrip('-').isdigit(): stack.append(int(token))
        else:
            b, a = stack.pop(), stack.pop()
            if token=='+': stack.append(a+b)
            elif token=='-': stack.append(a-b)
            elif token=='*': stack.append(a*b)
            elif token=='/': stack.append(int(a/b))
    return stack[0]`,
    java: `int evalPostfix(String expr) {
    Stack<Integer> st = new Stack<>();
    for (String t : expr.split(" ")) {
        if (t.matches("-?\\d+")) st.push(Integer.parseInt(t));
        else { int b=st.pop(), a=st.pop();
            switch(t) { case "+":st.push(a+b);break; case "-":st.push(a-b);break;
                case "*":st.push(a*b);break; case "/":st.push(a/b);break; }
        }
    } return st.pop();
}`,
    cpp: `int evalPostfix(string expr) {
    stack<int> st; stringstream ss(expr); string token;
    while (ss >> token) {
        if (isdigit(token[0])||token.size()>1) st.push(stoi(token));
        else { int b=st.top();st.pop(); int a=st.top();st.pop();
            if(token=="+")st.push(a+b); else if(token=="-")st.push(a-b);
            else if(token=="*")st.push(a*b); else st.push(a/b);
        }
    } return st.top();
}`,
    c: `int evalPostfix(char* expr) {
    int stack[100], top=-1;
    char* token = strtok(expr, " ");
    while (token) {
        if (isdigit(token[0])) stack[++top]=atoi(token);
        else { int b=stack[top--], a=stack[top--];
            if(token[0]=='+')stack[++top]=a+b; else if(token[0]=='-')stack[++top]=a-b;
            else if(token[0]=='*')stack[++top]=a*b; else stack[++top]=a/b;
        } token=strtok(NULL," ");
    } return stack[top];
}`,
  },
  'prefix-eval': {
    javascript: `function evalPrefix(expr) {
  const tokens = expr.split(' ').reverse();
  const stack = [];
  for (const t of tokens) {
    if (!isNaN(t)) stack.push(Number(t));
    else {
      const a = stack.pop(), b = stack.pop();
      if (t==='+') stack.push(a+b);
      else if (t==='-') stack.push(a-b);
      else if (t==='*') stack.push(a*b);
      else if (t==='/') stack.push(Math.floor(a/b));
    }
  }
  return stack[0];
}`,
    python: `def eval_prefix(expr):
    stack = []
    for token in reversed(expr.split()):
        if token.lstrip('-').isdigit(): stack.append(int(token))
        else:
            a, b = stack.pop(), stack.pop()
            if token=='+': stack.append(a+b)
            elif token=='-': stack.append(a-b)
            elif token=='*': stack.append(a*b)
            elif token=='/': stack.append(int(a/b))
    return stack[0]`,
    java: `int evalPrefix(String expr) {
    String[] tokens = expr.split(" ");
    Stack<Integer> st = new Stack<>();
    for (int i=tokens.length-1;i>=0;i--) {
        if (tokens[i].matches("-?\\d+")) st.push(Integer.parseInt(tokens[i]));
        else { int a=st.pop(), b=st.pop();
            switch(tokens[i]) { case "+":st.push(a+b);break; case "-":st.push(a-b);break;
                case "*":st.push(a*b);break; case "/":st.push(a/b);break; }
        }
    } return st.pop();
}`,
    cpp: `int evalPrefix(string expr) {
    stack<int> st; vector<string> tokens;
    stringstream ss(expr); string t;
    while (ss>>t) tokens.push_back(t);
    for (int i=tokens.size()-1;i>=0;i--) {
        if (isdigit(tokens[i][0])) st.push(stoi(tokens[i]));
        else { int a=st.top();st.pop(); int b=st.top();st.pop();
            if(tokens[i]=="+")st.push(a+b); else if(tokens[i]=="-")st.push(a-b);
            else if(tokens[i]=="*")st.push(a*b); else st.push(a/b);
        }
    } return st.top();
}`,
    c: `// Similar to postfix but scan tokens right-to-left
// and operands are pushed, then operators pop two & compute`,
  },

  // ──────── QUEUE ────────
  'queue-enqueue': {
    javascript: `class Queue {
  constructor() { this.items = []; }
  enqueue(val) { this.items.push(val); }
  dequeue() { return this.items.shift(); }
  front() { return this.items[0]; }
  isEmpty() { return this.items.length === 0; }
}`,
    python: `from collections import deque
class Queue:
    def __init__(self):
        self.items = deque()
    def enqueue(self, val):
        self.items.append(val)
    def dequeue(self):
        return self.items.popleft()
    def front(self):
        return self.items[0]
    def is_empty(self):
        return len(self.items) == 0`,
    java: `class Queue {
    int[] arr; int front, rear, size;
    Queue(int cap) { arr=new int[cap]; front=0; rear=-1; size=0; }
    void enqueue(int val) { arr[++rear]=val; size++; }
    int dequeue() { size--; return arr[front++]; }
    int front() { return arr[front]; }
    boolean isEmpty() { return size==0; }
}`,
    cpp: `class Queue {
    queue<int> q;
public:
    void enqueue(int val) { q.push(val); }
    int dequeue() { int v=q.front(); q.pop(); return v; }
    int front() { return q.front(); }
    bool isEmpty() { return q.empty(); }
};`,
    c: `int queue[100], front=0, rear=-1;
void enqueue(int val) { queue[++rear]=val; }
int dequeue() { return queue[front++]; }
int frontVal() { return queue[front]; }
int isEmpty() { return front>rear; }`,
  },
  'circular-queue': {
    javascript: `class CircularQueue {
  constructor(k) { this.q = Array(k); this.size = k; this.front = -1; this.rear = -1; }
  enqueue(val) {
    if (this.isFull()) return false;
    if (this.front === -1) this.front = 0;
    this.rear = (this.rear + 1) % this.size;
    this.q[this.rear] = val;
    return true;
  }
  dequeue() {
    if (this.isEmpty()) return -1;
    const val = this.q[this.front];
    if (this.front === this.rear) { this.front = -1; this.rear = -1; }
    else this.front = (this.front + 1) % this.size;
    return val;
  }
  isEmpty() { return this.front === -1; }
  isFull() { return (this.rear + 1) % this.size === this.front; }
}`,
    python: `class CircularQueue:
    def __init__(self, k):
        self.q = [0]*k; self.size = k
        self.front = self.rear = -1
    def enqueue(self, val):
        if self.is_full(): return False
        if self.front == -1: self.front = 0
        self.rear = (self.rear + 1) % self.size
        self.q[self.rear] = val
        return True
    def dequeue(self):
        if self.is_empty(): return -1
        val = self.q[self.front]
        if self.front == self.rear: self.front = self.rear = -1
        else: self.front = (self.front + 1) % self.size
        return val
    def is_empty(self): return self.front == -1
    def is_full(self): return (self.rear+1) % self.size == self.front`,
    java: `class CircularQueue {
    int[] q; int front=-1, rear=-1, size;
    CircularQueue(int k) { q=new int[k]; size=k; }
    boolean enqueue(int val) {
        if (isFull()) return false;
        if (front==-1) front=0;
        rear=(rear+1)%size; q[rear]=val; return true;
    }
    int dequeue() {
        if (isEmpty()) return -1;
        int val=q[front];
        if (front==rear) { front=-1; rear=-1; }
        else front=(front+1)%size; return val;
    }
    boolean isEmpty() { return front==-1; }
    boolean isFull() { return (rear+1)%size==front; }
}`,
    cpp: `class CircularQueue {
    vector<int> q; int front=-1, rear=-1, sz;
public:
    CircularQueue(int k):q(k),sz(k){}
    bool enqueue(int val) {
        if (isFull()) return false;
        if (front==-1) front=0;
        rear=(rear+1)%sz; q[rear]=val; return true;
    }
    int dequeue() {
        if (isEmpty()) return -1;
        int val=q[front];
        if (front==rear) front=rear=-1;
        else front=(front+1)%sz; return val;
    }
    bool isEmpty() { return front==-1; }
    bool isFull() { return (rear+1)%sz==front; }
};`,
    c: `#define MAX 100
int q[MAX], front=-1, rear=-1, size=MAX;
int enqueue(int val) {
    if ((rear+1)%size==front) return 0;
    if (front==-1) front=0;
    rear=(rear+1)%size; q[rear]=val; return 1;
}
int dequeue() {
    if (front==-1) return -1;
    int val=q[front];
    if (front==rear) front=rear=-1;
    else front=(front+1)%size; return val;
}`,
  },
};