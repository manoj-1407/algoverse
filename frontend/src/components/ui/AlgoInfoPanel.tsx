import { useState } from "react";
import { Code2, BookOpen, Cpu, ChevronDown, ChevronUp } from "lucide-react";

interface AlgoInfo {
  description: string;
  pseudocode: string[];
  useCases: string[];
  funFact: string;
}

const INFO: Record<string, AlgoInfo> = {
  quicksort: {
    description: "Divides array around a pivot, recursively sorting subarrays. On average the fastest comparison-based sort in practice due to excellent cache behavior.",
    pseudocode: ["pick pivot (last element)", "partition: move smaller to left, larger to right", "recursively quicksort left partition", "recursively quicksort right partition"],
    useCases: ["General-purpose sorting", "In-memory sorting (large datasets)", "Systems where average case matters more than worst case"],
    funFact: "Developed by Tony Hoare in 1959 while trying to sort Russian-English dictionary entries for machine translation.",
  },
  mergesort: {
    description: "Divide array in half recursively until single elements, then merge sorted halves. Guarantees O(n log n) always and is stable — preserves equal element order.",
    pseudocode: ["split array in half", "recursively mergesort left half", "recursively mergesort right half", "merge two sorted halves maintaining order"],
    useCases: ["External sorting (data too large for RAM)", "Linked list sorting", "When stability is required", "Parallel sorting"],
    funFact: "Used by Python's sort() and Java's Arrays.sort() for objects (timsort is a hybrid of merge + insertion).",
  },
  heapsort: {
    description: "Builds a max-heap from the array, then repeatedly extracts the maximum to build the sorted output. In-place with O(1) extra space.",
    pseudocode: ["build max-heap from array (heapify)", "for i = n-1 down to 1:", "  swap heap root (max) with arr[i]", "  heapify remaining heap of size i"],
    useCases: ["Memory-constrained systems", "Priority queue-based scheduling", "When guaranteed O(n log n) and O(1) space both needed"],
    funFact: "Invented by J. W. J. Williams in 1964 and improved by Robert Floyd. Has poor cache performance which is why quicksort beats it in practice.",
  },
  bubblesort: {
    description: "Repeatedly passes through the array, swapping adjacent elements that are out of order. Simple to understand but O(n²) makes it impractical for large datasets.",
    pseudocode: ["for each pass i from 0 to n-1:", "  for each j from 0 to n-i-1:", "    if arr[j] > arr[j+1]:", "      swap arr[j] and arr[j+1]"],
    useCases: ["Educational purposes", "Tiny arrays (< 20 elements)", "Nearly sorted arrays (early exit optimization)", "Detecting if array is already sorted"],
    funFact: "Despite being named 'bubble' sort, Donald Knuth considered it so bad he dedicated a whole section in TAOCP to explaining why you should never use it.",
  },
  dijkstra: {
    description: "Finds shortest paths from a source node to all others in a weighted graph. Uses a priority queue to always expand the lowest-cost frontier node first.",
    pseudocode: ["dist[source] = 0, all others = ∞", "push (0, source) to min-heap", "while heap not empty:", "  pop (d, u) with min distance", "  for each neighbor v of u:", "    if d + weight(u,v) < dist[v]: update and push"],
    useCases: ["GPS navigation / Google Maps", "Network routing protocols (OSPF)", "Robot pathfinding", "Social network friend suggestions"],
    funFact: "Edsger Dijkstra designed this algorithm in 1956 in about 20 minutes, without pen and paper, while having coffee. He published it in 1959.",
  },
  fibonacci: {
    description: "Fibonacci sequence where each number is the sum of the two preceding ones. Used to demonstrate the power of memoization over naive recursion.",
    pseudocode: ["DP: dp[0]=0, dp[1]=1", "for i from 2 to n:", "  dp[i] = dp[i-1] + dp[i-2]", "Naive: fib(n) = fib(n-1) + fib(n-2) [exponential]"],
    useCases: ["DP teaching example", "Golden ratio approximation", "Tree structure analysis", "Financial modeling (Fibonacci retracement)"],
    funFact: "The ratio of consecutive Fibonacci numbers converges to φ (1.618...) — the golden ratio, found in spiral galaxies, nautilus shells, and sunflowers.",
  },
  n_queens: {
    description: "Place N queens on an N×N chess board so no two queens attack each other (no shared row, column, or diagonal). Classic backtracking problem.",
    pseudocode: ["for each column in current row:", "  if placement is safe:", "    place queen", "    recurse to next row", "    if solution found: record it", "    remove queen (backtrack)"],
    useCases: ["Constraint satisfaction problems", "VLSI testing", "Parallel computing scheduling", "Compiler register allocation"],
    funFact: "For n=8 there are exactly 92 solutions (12 unique, ignoring reflections/rotations). The first computer solution was found in 1972.",
  },
  kmp: {
    description: "Knuth-Morris-Pratt searches for a pattern in text in O(n+m) time. The LPS (Longest Proper Prefix which is also Suffix) table lets it skip redundant comparisons.",
    pseudocode: ["precompute LPS array for pattern:", "  track length of previous longest prefix-suffix", "search using LPS to skip on mismatch:", "  never re-examine already matched characters"],
    useCases: ["Text editors (Ctrl+F search)", "Intrusion detection systems", "DNA sequence matching", "Log file pattern scanning"],
    funFact: "Discovered independently by Knuth, Morris, and Pratt around 1970. Published jointly in 1977. Runs in linear time — a breakthrough over naive O(nm).",
  },
  huffman: {
    description: "Builds an optimal prefix-free binary code by assigning shorter codes to more frequent characters. Guaranteed to produce the minimum-bit-length encoding.",
    pseudocode: ["count frequency of each character", "insert all chars into min-heap by frequency", "while heap has > 1 node:", "  extract two minimums, merge them, re-insert", "assign 0/1 codes by traversing the tree"],
    useCases: ["gzip / zlib compression", "JPEG image encoding", "MP3 audio encoding", "ZIP file format"],
    funFact: "David Huffman invented this as a graduate student at MIT in 1951 as a course assignment. His professor Robert Fano had been working on a similar problem for years.",
  },
  sieve: {
    description: "Marks all multiples of each prime as composite, leaving only primes unmarked. Ancient algorithm — one of the most efficient ways to find all primes up to N.",
    pseudocode: ["create boolean array [0..n], set all true", "set [0] = [1] = false", "for i from 2 to √n:", "  if sieve[i] is true (i is prime):", "    mark all multiples i², i²+i, ... as false"],
    useCases: ["Cryptography (RSA key generation)", "Finding prime factors", "Number theory research", "Competitive programming"],
    funFact: "Invented by the Greek mathematician Eratosthenes around 240 BCE. Modern variants like the Sieve of Atkin run in O(n / log log n) time.",
  },
};

const DEFAULT_INFO: AlgoInfo = {
  description: "Select an algorithm to see its description, pseudocode, and real-world use cases.",
  pseudocode: [],
  useCases: [],
  funFact: "",
};

interface Props { algorithm: string; }

export default function AlgoInfoPanel({ algorithm }: Props) {
  const [open, setOpen] = useState(true);
  const info = INFO[algorithm] || DEFAULT_INFO;

  return (
    <div className="card">
      <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-indigo-400" />
          <span className="font-display font-semibold text-sm text-white capitalize">{algorithm.replace(/_/g," ")}</span>
        </div>
        {open ? <ChevronUp size={14} className="text-[#475569]" /> : <ChevronDown size={14} className="text-[#475569]" />}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <p className="text-xs text-[#94a3b8] leading-relaxed">{info.description}</p>

          {info.pseudocode.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Code2 size={11} className="text-indigo-400" />
                <span className="label text-[9px]">Pseudocode</span>
              </div>
              <div className="bg-[#020209] rounded-xl p-3 border border-[#1a1a2e] space-y-1">
                {info.pseudocode.map((line, i) => (
                  <div key={i} className="font-mono text-[10px]" style={{ paddingLeft: line.startsWith(" ") ? "12px" : "0", color: line.startsWith(" ") ? "#94a3b8" : "#c4b5fd" }}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}

          {info.useCases.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Cpu size={11} className="text-emerald-400" />
                <span className="label text-[9px]">Real-world use cases</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {info.useCases.map((u, i) => (
                  <span key={i} className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px]">{u}</span>
                ))}
              </div>
            </div>
          )}

          {info.funFact && (
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">
              <span className="text-amber-400 text-[9px] font-mono font-semibold">💡 Fun fact: </span>
              <span className="text-[#94a3b8] text-[10px] leading-relaxed">{info.funFact}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
