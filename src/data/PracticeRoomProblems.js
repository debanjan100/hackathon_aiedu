/* ── Practice Room — Problem Bank ── */

const T = {
  python:     '# Write your Python solution here\ndef solution():\n    pass\n\nprint(solution())\n',
  c:          '#include <stdio.h>\n\nint main() {\n    // Write your C solution here\n    return 0;\n}\n',
  cpp:        '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your C++ solution here\n    return 0;\n}\n',
  java:       'public class Solution {\n    public static void main(String[] args) {\n        // Write your Java solution here\n    }\n}\n',
  javascript: '// Write your JavaScript solution here\nfunction solution() {\n    \n}\n\nconsole.log(solution());\n',
};

export const PROBLEMS = [
  /* ── Arrays ── */
  {
    id: 'ts', title: 'Two Sum',
    topic: 'Arrays', difficulty: 'Easy', companies: ['Google', 'Amazon', 'Meta'],
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9.' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'nums[1] + nums[2] = 2 + 4 = 6.' },
    ],
    hints: ['Think about using a hash map to store complements.', 'For each number, check if target - number exists in your map.'],
    starterCode: {
      python: 'def twoSum(nums, target):\n    # Write your code here\n    pass\n\nprint(twoSum([2,7,11,15], 9))\n',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nvector<int> twoSum(vector<int>& n, int t) { return {}; }\nint main() { vector<int> n={2,7,11,15}; auto r=twoSum(n,9); cout<<"["<<r[0]<<","<<r[1]<<"]"; }',
      java: 'import java.util.*;\npublic class Solution {\n    public static int[] twoSum(int[] n, int t) { return new int[]{}; }\n    public static void main(String[] a) { int[] r = twoSum(new int[]{2,7,11,15}, 9); System.out.println("["+r[0]+","+r[1]+"]"); }\n}',
      javascript: 'function twoSum(nums, target) {\n    // Write your code here\n}\nconsole.log(twoSum([2,7,11,15], 9));\n',
      c: '#include <stdio.h>\nint main() { printf("[0,1]\\n"); return 0; }'
    },
  },
  {
    id: 'bsp', title: 'Best Time to Buy & Sell Stock',
    topic: 'Arrays', difficulty: 'Easy', companies: ['Amazon', 'Microsoft', 'Goldman Sachs'],
    description: 'Given an array `prices` where `prices[i]` is the price of a stock on day `i`, find the maximum profit you can achieve. You may only complete one transaction.',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price=1), sell on day 5 (price=6), profit = 5.' },
      { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'No profitable transaction possible.' },
    ],
    hints: ['Track the minimum price seen so far.', 'At each step, calculate profit from selling at current price.'],
    starterCode: {
      python: 'def maxProfit(prices):\n    # Write your code here\n    pass\n\nprint(maxProfit([7,1,5,3,6,4]))\n',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint maxProfit(vector<int>& p) { return 0; }\nint main() { vector<int> p={7,1,5,3,6,4}; cout << maxProfit(p); }',
      java: 'public class Solution {\n    public static int maxProfit(int[] p) { return 0; }\n    public static void main(String[] a) { System.out.println(maxProfit(new int[]{7,1,5,3,6,4})); }\n}',
      javascript: 'function maxProfit(prices) {\n    // Write your code here\n}\nconsole.log(maxProfit([7,1,5,3,6,4]));\n',
      c: '#include <stdio.h>\nint main() { printf("5\\n"); return 0; }'
    },
  },
  {
    id: 'cd', title: 'Contains Duplicate',
    topic: 'Arrays', difficulty: 'Easy', companies: ['Apple', 'Adobe'],
    description: 'Given an integer array `nums`, return `true` if any value appears at least twice, and `false` if every element is distinct.',
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true', explanation: '1 appears twice.' },
      { input: 'nums = [1,2,3,4]', output: 'false', explanation: 'All distinct.' },
    ],
    hints: ['A Set has O(1) lookup time.', 'Compare the set size with array length.'],
    starterCode: {
      python: 'def containsDuplicate(nums):\n    # Write your code here\n    pass\n\nprint(containsDuplicate([1,2,3,1]))\n',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nbool containsDuplicate(vector<int>& n) { return false; }\nint main() { vector<int> n={1,2,3,1}; cout << (containsDuplicate(n) ? "true" : "false"); }',
      java: 'import java.util.*;\npublic class Solution {\n    public static boolean containsDuplicate(int[] n) { return false; }\n    public static void main(String[] a) { System.out.println(containsDuplicate(new int[]{1,2,3,1})); }\n}',
      javascript: 'function containsDuplicate(nums) {\n    // Write your code here\n}\nconsole.log(containsDuplicate([1,2,3,1]));\n',
      c: '#include <stdio.h>\nint main() { printf("true\\n"); return 0; }'
    },
  },

  /* ── Strings ── */
  {
    id: 'lss', title: 'Longest Substring Without Repeating Characters',
    topic: 'Strings', difficulty: 'Medium', companies: ['Amazon', 'Google', 'Meta'],
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    examples: [
      { input: "s = 'abcabcbb'", output: '3', explanation: "The substring 'abc' has length 3." },
      { input: "s = 'bbbbb'", output: '1', explanation: "The answer is 'b', length 1." },
    ],
    hints: ['Use a sliding window approach.', 'Maintain a set of characters in the current window.'],
    starterCode: {
      python: 'def lengthOfLongestSubstring(s: str) -> int:\n    # Write your code here\n    pass\n\nprint(lengthOfLongestSubstring("abcabcbb"))\n',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint lengthOfLongestSubstring(string s) {\n    // Write your code here\n    return 0;\n}\nint main() { cout << lengthOfLongestSubstring("abcabcbb") << endl; }',
      java: 'import java.util.*;\npublic class Solution {\n    public static int lengthOfLongestSubstring(String s) { return 0; }\n    public static void main(String[] a) { System.out.println(lengthOfLongestSubstring("abcabcbb")); }\n}',
      javascript: 'function lengthOfLongestSubstring(s) {\n    // Write your code here\n}\nconsole.log(lengthOfLongestSubstring("abcabcbb"));\n',
      c: '#include <stdio.h>\nint main() { printf("3\\n"); return 0; }'
    },
  },
  {
    id: 'vp', title: 'Valid Parentheses',
    topic: 'Strings', difficulty: 'Easy', companies: ['Meta', 'Google', 'Bloomberg'],
    description: 'Given a string `s` containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. A string is valid if brackets are closed in the correct order.',
    examples: [
      { input: "s = '()'", output: 'true', explanation: 'Valid single pair.' },
      { input: "s = '(]'", output: 'false', explanation: 'Mismatched brackets.' },
    ],
    hints: ['Use a stack data structure.', 'Push opening brackets, pop and compare for closing brackets.'],
    starterCode: {
      python: 'def isValid(s: str) -> bool:\n    # Write your code here\n    pass\n\nprint(isValid("()"))\n',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nbool isValid(string s) { return false; }\nint main() { cout << (isValid("()") ? "true" : "false"); }',
      java: 'public class Solution {\n    public static boolean isValid(String s) { return false; }\n    public static void main(String[] a) { System.out.println(isValid("()")); }\n}',
      javascript: 'function isValid(s) {\n    // Write your code here\n}\nconsole.log(isValid("()"));\n',
      c: '#include <stdio.h>\nint main() { printf("true\\n"); return 0; }'
    },
  },

  /* ── Sorting ── */
  {
    id: 'mi', title: 'Merge Intervals',
    topic: 'Sorting', difficulty: 'Medium', companies: ['Google', 'Meta', 'Microsoft'],
    description: 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.',
    examples: [
      { input: '[[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: 'Intervals [1,3] and [2,6] overlap → [1,6].' },
    ],
    hints: ['Sort intervals by start time first.', 'Compare the end of the last merged interval with the start of the current one.'],
    starterCode: {
      python: 'def merge(intervals):\n    # Write your code here\n    pass\n\nprint(merge([[1,3],[2,6],[8,10],[15,18]]))\n',
      cpp: T.cpp, java: T.java, javascript: T.javascript, c: T.c
    },
  },

  /* ── Linked Lists / Pointers ── */
  {
    id: 'rl', title: 'Reverse Linked List',
    topic: 'Pointers', difficulty: 'Easy', companies: ['Amazon', 'Microsoft', 'Apple'],
    description: 'Given the head of a singly linked list, reverse the list and return the reversed list.',
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: 'Simple iterative or recursive reversal.' },
    ],
    hints: ['Use three pointers: prev, curr, next.', 'At each step, reverse the current node\'s next pointer.'],
    starterCode: {
      python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverseList(head):\n    # Write your code here\n    pass\n',
      cpp: T.cpp, java: T.java, javascript: T.javascript, c: T.c
    },
  },
  {
    id: 'mc', title: 'Merge Two Sorted Lists',
    topic: 'Pointers', difficulty: 'Easy', companies: ['Amazon', 'Apple'],
    description: 'Merge two sorted linked lists and return it as a sorted list.',
    examples: [
      { input: 'l1 = [1,2,4], l2 = [1,3,4]', output: '[1,1,2,3,4,4]', explanation: 'Merge in sorted order.' },
    ],
    hints: ['Use a dummy head node to simplify the merge.', 'Compare the current nodes of both lists.'],
    starterCode: {
      python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef mergeTwoLists(l1, l2):\n    # Write your code here\n    pass\n',
      cpp: T.cpp, java: T.java, javascript: T.javascript, c: T.c
    },
  },

  /* ── Trees ── */
  {
    id: 'mdt', title: 'Maximum Depth of Binary Tree',
    topic: 'Trees', difficulty: 'Easy', companies: ['Amazon', 'Google'],
    description: 'Given the root of a binary tree, return its maximum depth. The maximum depth is the number of nodes along the longest path from root to the farthest leaf.',
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3', explanation: 'The tree has depth 3.' },
    ],
    hints: ['Think recursively: depth = 1 + max(left depth, right depth).', 'Base case: empty tree has depth 0.'],
    starterCode: {
      python: 'class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef maxDepth(root):\n    # Write your code here\n    pass\n',
      cpp: T.cpp, java: T.java, javascript: T.javascript, c: T.c
    },
  },
  {
    id: 'ibst', title: 'Validate Binary Search Tree',
    topic: 'Trees', difficulty: 'Medium', companies: ['Meta', 'Microsoft'],
    description: 'Given the root of a binary tree, determine if it is a valid binary search tree. In a BST, every node\'s left subtree has values less than the node, and right subtree has values greater.',
    examples: [
      { input: 'root = [2,1,3]', output: 'true', explanation: 'Valid BST.' },
      { input: 'root = [5,1,4,null,null,3,6]', output: 'false', explanation: 'Node 4 is in the right subtree of 5 but is less than 5.' },
    ],
    hints: ['Use an inorder traversal — it should produce a sorted sequence.', 'Or pass min/max bounds recursively.'],
    starterCode: {
      python: 'class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef isValidBST(root):\n    # Write your code here\n    pass\n',
      cpp: T.cpp, java: T.java, javascript: T.javascript, c: T.c
    },
  },

  /* ── Graphs ── */
  {
    id: 'da', title: "Dijkstra's Algorithm",
    topic: 'Graphs', difficulty: 'Hard', companies: ['Google', 'Uber', 'Apple'],
    description: 'Find shortest paths from a source vertex to all other vertices in a weighted graph using Dijkstra\'s algorithm.',
    examples: [
      { input: 'graph = {0: {1:4, 2:1}}, source = 0', output: '{0:0, 1:3, 2:1}', explanation: 'Shortest path from 0 to 1 goes via 2.' },
    ],
    hints: ['Use a priority queue (min-heap).', 'Relax edges greedily — always process the closest unvisited vertex.'],
    starterCode: {
      python: 'import heapq\ndef dijkstra(graph, src):\n    # Write your code here\n    pass\n\nprint(dijkstra({0:{1:4,2:1},1:{},2:{1:2}}, 0))\n',
      cpp: T.cpp, java: T.java, javascript: T.javascript, c: T.c
    },
  },
  {
    id: 'ni', title: 'Number of Islands',
    topic: 'Graphs', difficulty: 'Medium', companies: ['Amazon', 'Microsoft', 'Google'],
    description: 'Given an m x n 2D grid of \'1\'s (land) and \'0\'s (water), return the number of islands. An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.',
    examples: [
      { input: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]', output: '2', explanation: 'Two separate island groups.' },
    ],
    hints: ['Use BFS or DFS to explore each island.', 'Mark visited cells to avoid counting them again.'],
    starterCode: {
      python: 'def numIslands(grid):\n    # Write your code here\n    pass\n\nprint(numIslands([["1","1","0"],["1","1","0"],["0","0","1"]]))\n',
      cpp: T.cpp, java: T.java, javascript: T.javascript, c: T.c
    },
  },

  /* ── Dynamic Programming ── */
  {
    id: 'cs', title: 'Climbing Stairs',
    topic: 'Dynamic Programming', difficulty: 'Easy', companies: ['Amazon', 'Google'],
    description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    examples: [
      { input: 'n = 2', output: '2', explanation: '1+1 or 2.' },
      { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, or 2+1.' },
    ],
    hints: ['This is the Fibonacci sequence!', 'dp[i] = dp[i-1] + dp[i-2].'],
    starterCode: {
      python: 'def climbStairs(n: int) -> int:\n    # Write your code here\n    pass\n\nprint(climbStairs(3))\n',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint climbStairs(int n) { return 0; }\nint main() { cout << climbStairs(3); }',
      java: 'public class Solution {\n    public static int climbStairs(int n) { return 0; }\n    public static void main(String[] a) { System.out.println(climbStairs(3)); }\n}',
      javascript: 'function climbStairs(n) {\n    // Write your code here\n}\nconsole.log(climbStairs(3));\n',
      c: '#include <stdio.h>\nint main() { printf("3\\n"); return 0; }'
    },
  },
  {
    id: 'hr', title: 'House Robber',
    topic: 'Dynamic Programming', difficulty: 'Medium', companies: ['Google', 'Amazon', 'Cisco'],
    description: 'Given an array of non-negative integers representing the amount of money at each house, determine the maximum amount you can rob without robbing two adjacent houses.',
    examples: [
      { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Rob house 1 ($1) + house 3 ($3) = $4.' },
      { input: 'nums = [2,7,9,3,1]', output: '12', explanation: 'Rob house 1 ($2) + house 3 ($9) + house 5 ($1) = $12.' },
    ],
    hints: ['At each house, choose: rob it (skip previous) or skip it (keep previous max).', 'dp[i] = max(dp[i-1], dp[i-2] + nums[i]).'],
    starterCode: {
      python: 'def rob(nums):\n    # Write your code here\n    pass\n\nprint(rob([2,7,9,3,1]))\n',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint rob(vector<int>& n) { return 0; }\nint main() { vector<int> n={2,7,9,3,1}; cout << rob(n); }',
      java: 'public class Solution {\n    public static int rob(int[] n) { return 0; }\n    public static void main(String[] a) { System.out.println(rob(new int[]{2,7,9,3,1})); }\n}',
      javascript: 'function rob(nums) {\n    // Write your code here\n}\nconsole.log(rob([2,7,9,3,1]));\n',
      c: '#include <stdio.h>\nint main() { printf("12\\n"); return 0; }'
    },
  },

  /* ── Greedy ── */
  {
    id: 'ji', title: 'Jump Game',
    topic: 'Greedy', difficulty: 'Medium', companies: ['Amazon', 'Google', 'Apple'],
    description: 'Given an array of non-negative integers `nums`, you are initially positioned at the first index. Each element represents your maximum jump length. Determine if you can reach the last index.',
    examples: [
      { input: 'nums = [2,3,1,1,4]', output: 'true', explanation: 'Jump 1→2→last.' },
      { input: 'nums = [3,2,1,0,4]', output: 'false', explanation: 'Stuck at index 3.' },
    ],
    hints: ['Track the furthest index you can reach.', 'If current index > furthest reachable, return false.'],
    starterCode: {
      python: 'def canJump(nums):\n    # Write your code here\n    pass\n\nprint(canJump([2,3,1,1,4]))\n',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nbool canJump(vector<int>& n) { return false; }\nint main() { vector<int> n={2,3,1,1,4}; cout << (canJump(n) ? "true" : "false"); }',
      java: 'public class Solution {\n    public static boolean canJump(int[] n) { return false; }\n    public static void main(String[] a) { System.out.println(canJump(new int[]{2,3,1,1,4})); }\n}',
      javascript: 'function canJump(nums) {\n    // Write your code here\n}\nconsole.log(canJump([2,3,1,1,4]));\n',
      c: '#include <stdio.h>\nint main() { printf("true\\n"); return 0; }'
    },
  },
];

export const TOPICS = ['All', 'Saved', 'Arrays', 'Strings', 'Trees', 'Graphs', 'Dynamic Programming', 'Greedy', 'Sorting', 'Pointers'];

export const LANGUAGES = {
  python:     { label: 'Python',     monacoId: 'python',     pistonId: 'python',     version: '3.10.0', ext: 'py'  },
  c:          { label: 'C',          monacoId: 'c',          pistonId: 'c',          version: '10.2.0', ext: 'c'   },
  cpp:        { label: 'C++',        monacoId: 'cpp',        pistonId: 'cpp',        version: '10.2.0', ext: 'cpp' },
  java:       { label: 'Java',       monacoId: 'java',       pistonId: 'java',       version: '15.0.2', ext: 'java'},
  javascript: { label: 'JavaScript', monacoId: 'javascript', pistonId: 'javascript', version: '18.15.0', ext: 'js'  },
};

export const STARTER_TEMPLATES = {
  python:     '# Write your Python solution here\ndef solution():\n    pass\n\nprint(solution())\n',
  c:          '#include <stdio.h>\n\nint main() {\n    // Write your C solution here\n    return 0;\n}\n',
  cpp:        '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your C++ solution here\n    return 0;\n}\n',
  java:       'public class Solution {\n    public static void main(String[] args) {\n        // Write your Java solution here\n    }\n}\n',
  javascript: '// Write your JavaScript solution here\nfunction solution() {\n    \n}\n\nconsole.log(solution());\n',
};

export const DIFF_COLORS = { Easy: '#4ade80', Medium: '#faad14', Hard: '#ff6b6b' };
export const DIFF_BG     = { Easy: 'rgba(74,222,128,0.1)', Medium: 'rgba(250,173,20,0.1)', Hard: 'rgba(255,107,107,0.1)' };
