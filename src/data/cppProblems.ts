import { CppProblem } from '../types';

export const CPP_PROBLEMS: CppProblem[] = [
  {
    id: 'cpp-1',
    title: 'Reverse an Array In-Place',
    difficulty: 'Easy',
    category: 'Arrays',
    description: `Write a function in C++ that takes a vector of integers and reverses it **in-place** (without allocating another vector).

In interview settings, the interviewer tests your knowledge of the two-pointer technique, array indexing, and \`std::swap\` vs manual swapping.`,
    constraints: [
      '1 <= nums.size() <= 10^5',
      '-10^9 <= nums[i] <= 10^9',
      'Auxiliary Space must be O(1)',
    ],
    examples: [
      {
        input: 'nums = [1, 2, 3, 4, 5]',
        output: '[5, 4, 3, 2, 1]',
        explanation: 'The array elements are reversed from end to start.',
      },
      {
        input: 'nums = [10, 20]',
        output: '[20, 10]',
        explanation: 'First and last elements swapped.',
      },
    ],
    starterCode: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// Function to reverse vector in-place
void reverseArray(vector<int>& nums) {
    // Write your code here
    int left = 0;
    int right = nums.size() - 1;
    
    while (left < right) {
        swap(nums[left], nums[right]);
        left++;
        right--;
    }
}

int main() {
    vector<int> sample = {1, 2, 3, 4, 5};
    reverseArray(sample);
    
    // Print reversed array
    for (int num : sample) {
        cout << num << " ";
    }
    cout << endl;
    return 0;
}
`,
    testCases: [
      { input: '[1, 2, 3, 4, 5]', output: '[5, 4, 3, 2, 1]' },
      { input: '[42]', output: '[42]', explanation: 'Single element remains identical' },
      { input: '[-1, 0, 1]', output: '[1, 0, -1]' },
    ],
    solutionHints: [
      'Think about two indices: one starting at 0 (left) and one starting at size - 1 (right).',
      'Swap the elements at left and right, then advance left and retreat right while left < right.',
      'Time complexity will be O(N/2) = O(N), Space complexity is O(1) auxiliary.',
    ],
    timeComplexityOptimal: 'O(N)',
    spaceComplexityOptimal: 'O(1)',
  },
  {
    id: 'cpp-2',
    title: 'Valid Palindrome (Case & Alphanumeric)',
    difficulty: 'Easy',
    category: 'Strings',
    description: `Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise. 
A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

This tests your command of standard library functions like \`isalnum()\` and \`tolower()\`, along with pointer traversal.`,
    constraints: [
      '1 <= s.length() <= 2 * 10^5',
      's consists only of printable ASCII characters.',
    ],
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: 'true',
        explanation: '"amanaplanacanalpanama" is a palindrome.',
      },
      {
        input: 's = "race a car"',
        output: 'false',
        explanation: '"raceacar" is not a palindrome.',
      },
    ],
    starterCode: `#include <iostream>
#include <string>
#include <cctype>

using namespace std;

bool isPalindrome(string s) {
    int left = 0;
    int right = s.length() - 1;
    
    while (left < right) {
        while (left < right && !isalnum(s[left])) left++;
        while (left < right && !isalnum(s[right])) right--;
        
        if (tolower(s[left]) != tolower(s[right])) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}

int main() {
    string test = "A man, a plan, a canal: Panama";
    cout << (isPalindrome(test) ? "true" : "false") << endl;
    return 0;
}
`,
    testCases: [
      { input: '"A man, a plan, a canal: Panama"', output: 'true' },
      { input: '"race a car"', output: 'false' },
      { input: '" "', output: 'true', explanation: 'Empty after filtering is valid' },
    ],
    solutionHints: [
      'Do you need to create a new cleaned string? Not necessarily—you can skip invalid characters in-place using two pointers.',
      'Use `isalnum(c)` from `<cctype>` to test if a character is alphanumeric.',
      'Use `tolower(c)` to compare case-insensitively.',
    ],
    timeComplexityOptimal: 'O(N)',
    spaceComplexityOptimal: 'O(1)',
  },
  {
    id: 'cpp-3',
    title: 'Two Sum with Hash Map',
    difficulty: 'Easy',
    category: 'Hash Maps',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.
Show the interviewer how you transition from an O(N^2) brute force to an optimal O(N) using \`std::unordered_map\`.`,
    constraints: [
      '2 <= nums.size() <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
      },
    ],
    starterCode: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

vector<int> twoSum(const vector<int>& nums, int target) {
    unordered_map<int, int> seen; // value -> index
    
    for (int i = 0; i < nums.size(); ++i) {
        int complement = target - nums[i];
        if (seen.find(complement) != seen.end()) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = twoSum(nums, target);
    cout << "[" << result[0] << ", " << result[1] << "]" << endl;
    return 0;
}
`,
    testCases: [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]' },
      { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' },
      { input: 'nums = [3, 3], target = 6', output: '[0, 1]' },
    ],
    solutionHints: [
      'For any element `x`, the required pair is `target - x`.',
      'Store each visited number and its index in `unordered_map<int, int>`.',
      'Average lookup time in `unordered_map` is O(1) compared to O(log N) in `std::map`.',
    ],
    timeComplexityOptimal: 'O(N)',
    spaceComplexityOptimal: 'O(N)',
  },
  {
    id: 'cpp-4',
    title: 'Check Balanced Parentheses',
    difficulty: 'Easy',
    category: 'Stack & Queue',
    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    constraints: [
      '1 <= s.length() <= 10^4',
      's consists of parentheses only \x27()[]{}\x27.',
    ],
    examples: [
      {
        input: 's = "()[]{}"',
        output: 'true',
      },
      {
        input: 's = "(]"',
        output: 'false',
      },
      {
        input: 's = "([{}])"',
        output: 'true',
      },
    ],
    starterCode: `#include <iostream>
#include <string>
#include <stack>

using namespace std;

bool isValidParentheses(string s) {
    stack<char> st;
    
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            if (st.empty()) return false;
            char top = st.top();
            st.pop();
            
            if (c == ')' && top != '(') return false;
            if (c == '}' && top != '{') return false;
            if (c == ']' && top != '[') return false;
        }
    }
    
    return st.empty();
}

int main() {
    string s = "{[()]}";
    cout << (isValidParentheses(s) ? "Valid" : "Invalid") << endl;
    return 0;
}
`,
    testCases: [
      { input: '"()[]{}"', output: 'true' },
      { input: '"(]"', output: 'false' },
      { input: '"({[]})"', output: 'true' },
      { input: '"]"', output: 'false', explanation: 'Closing bracket on empty stack' },
    ],
    solutionHints: [
      'The Last-In, First-Out (LIFO) property of a stack fits matched nesting perfectly.',
      'Check `st.empty()` before calling `st.top()` to avoid segmentation faults / undefined behavior.',
      'At the end of processing, verify that `st.empty()` is true (no unclosed brackets remaining).',
    ],
    timeComplexityOptimal: 'O(N)',
    spaceComplexityOptimal: 'O(N)',
  },
  {
    id: 'cpp-5',
    title: 'Maximum Subarray (Kadane\x27s Algorithm)',
    difficulty: 'Medium',
    category: 'Arrays',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A classic interview favorite to test whether candidates know Kadane's dynamic programming greedy algorithm in O(N) rather than O(N^2) or O(N^3).`,
    constraints: [
      '1 <= nums.size() <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
    examples: [
      {
        input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
        output: '6',
        explanation: 'Subarray [4, -1, 2, 1] has the largest sum = 6.',
      },
      {
        input: 'nums = [1]',
        output: '1',
      },
      {
        input: 'nums = [5, 4, -1, 7, 8]',
        output: '23',
      },
    ],
    starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
#include <climits>

using namespace std;

int maxSubArray(const vector<int>& nums) {
    int maxCurrent = nums[0];
    int maxGlobal = nums[0];
    
    for (size_t i = 1; i < nums.size(); ++i) {
        maxCurrent = max(nums[i], maxCurrent + nums[i]);
        maxGlobal = max(maxGlobal, maxCurrent);
    }
    
    return maxGlobal;
}

int main() {
    vector<int> nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    cout << "Max Sum: " << maxSubArray(nums) << endl;
    return 0;
}
`,
    testCases: [
      { input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6' },
      { input: '[1]', output: '1' },
      { input: '[-5, -2, -9]', output: '-2', explanation: 'All negative array: largest single negative' },
    ],
    solutionHints: [
      'At each index `i`, we decide whether to add `nums[i]` to our existing subarray or start a fresh subarray at `nums[i]`.',
      'Formula: `currentMax = max(nums[i], currentMax + nums[i])`.',
      'Remember to initialize variables with `nums[0]` rather than `0` to handle all-negative arrays correctly.',
    ],
    timeComplexityOptimal: 'O(N)',
    spaceComplexityOptimal: 'O(1)',
  },
  {
    id: 'cpp-6',
    title: 'Find Missing Number in 1 to N',
    difficulty: 'Easy',
    category: 'Vectors',
    description: `Given an array \`nums\` containing \`n\` distinct numbers in the range \`[0, n]\`, return the only number in the range that is missing from the array.

Interviewer asks you to discuss multiple approaches: Arithmetic Sum (Gauss), Bitwise XOR, and HashSet.`,
    constraints: [
      'n == nums.size()',
      '1 <= n <= 10^4',
      'All numbers in nums are unique.',
    ],
    examples: [
      {
        input: 'nums = [3, 0, 1]',
        output: '2',
        explanation: 'n = 3 since there are 3 numbers, range [0, 3]. 2 is missing.',
      },
      {
        input: 'nums = [0, 1]',
        output: '2',
        explanation: 'n = 2, range [0, 2]. 2 is missing.',
      },
    ],
    starterCode: `#include <iostream>
#include <vector>

using namespace std;

// Using XOR approach (prevents integer overflow)
int missingNumber(const vector<int>& nums) {
    int n = nums.size();
    int xorTotal = 0;
    
    for (int i = 0; i <= n; ++i) {
        xorTotal ^= i;
    }
    for (int num : nums) {
        xorTotal ^= num;
    }
    
    return xorTotal;
}

int main() {
    vector<int> nums = {3, 0, 1};
    cout << "Missing number: " << missingNumber(nums) << endl;
    return 0;
}
`,
    testCases: [
      { input: '[3, 0, 1]', output: '2' },
      { input: '[0, 1]', output: '2' },
      { input: '[9,6,4,2,3,5,7,0,1]', output: '8' },
    ],
    solutionHints: [
      'Approach 1: Expected sum = n * (n + 1) / 2. Subtract all array values. Note: Watch for potential integer overflow if n is huge.',
      'Approach 2: Bitwise XOR. Since x ^ x = 0, XORing all indices [0..n] with all elements leaves only the missing number.',
      'Space complexity is O(1) in both optimal solutions.',
    ],
    timeComplexityOptimal: 'O(N)',
    spaceComplexityOptimal: 'O(1)',
  },
  {
    id: 'cpp-7',
    title: 'Count Character Frequencies',
    difficulty: 'Easy',
    category: 'Hash Maps',
    description: `Given a string \`s\`, print the frequency of each character in order of appearance or alphabetical order.

Demonstrates foundational mastery of \`std::map\` (ordered, O(log K)) vs \`std::unordered_map\` (unordered, O(1) average) or fixed-size array \`int freq[256] = {0}\`.`,
    constraints: [
      '1 <= s.length() <= 10^5',
      's consists of lowercase English letters.',
    ],
    examples: [
      {
        input: 's = "programming"',
        output: 'a:1, g:2, i:1, m:2, n:1, o:1, p:1, r:2',
        explanation: 'Alphabetical frequency count.',
      },
    ],
    starterCode: `#include <iostream>
#include <string>
#include <map>

using namespace std;

void printFrequencies(const string& s) {
    map<char, int> freq;
    for (char c : s) {
        freq[c]++;
    }
    
    for (const auto& pair : freq) {
        cout << pair.first << ":" << pair.second << " ";
    }
    cout << endl;
}

int main() {
    string s = "programming";
    printFrequencies(s);
    return 0;
}
`,
    testCases: [
      { input: '"programming"', output: 'a:1, g:2, i:1, m:2, n:1, o:1, p:1, r:2' },
      { input: '"banana"', output: 'a:3, b:1, n:2' },
    ],
    solutionHints: [
      'If alphabetical order is requested, `std::map<char, int>` automatically keeps keys sorted (Red-Black tree).',
      'If memory is critical and character set is ASCII, a fixed array `int counts[26] = {0}` achieves O(1) space.',
      'Explain to the interviewer when to pick `unordered_map` (hash table) vs `map` (balanced BST).',
    ],
    timeComplexityOptimal: 'O(N)',
    spaceComplexityOptimal: 'O(1) [fixed alphabet size]',
  },
  {
    id: 'cpp-8',
    title: 'Merge Two Sorted Vectors',
    difficulty: 'Medium',
    category: 'Pointers & Memory',
    description: `You are given two integer vectors \`nums1\` and \`nums2\`, sorted in non-decreasing order. Merge \`nums2\` into \`nums1\` as one sorted vector.

Assume \`nums1\` has a size equal to \`m + n\`, where the first \`m\` elements denote the elements that should be merged, and the last \`n\` elements are set to 0 and should be ignored.

The challenge: Can you merge backwards in-place to achieve O(1) extra space?`,
    constraints: [
      'nums1.size() == m + n',
      'nums2.size() == n',
      '0 <= m, n <= 200',
    ],
    examples: [
      {
        input: 'nums1 = [1, 2, 3, 0, 0, 0], m = 3, nums2 = [2, 5, 6], n = 3',
        output: '[1, 2, 2, 3, 5, 6]',
        explanation: 'The merged sorted array.',
      },
    ],
    starterCode: `#include <iostream>
#include <vector>

using namespace std;

void merge(vector<int>& nums1, int m, const vector<int>& nums2, int n) {
    int p1 = m - 1;
    int p2 = n - 1;
    int p = m + n - 1;
    
    // Fill from the end backwards to avoid overwriting elements
    while (p1 >= 0 && p2 >= 0) {
        if (nums1[p1] > nums2[p2]) {
            nums1[p] = nums1[p1];
            p1--;
        } else {
            nums1[p] = nums2[p2];
            p2--;
        }
        p--;
    }
    
    // Copy remaining nums2 elements if any
    while (p2 >= 0) {
        nums1[p] = nums2[p2];
        p2--;
        p--;
    }
}

int main() {
    vector<int> nums1 = {1, 2, 3, 0, 0, 0};
    vector<int> nums2 = {2, 5, 6};
    merge(nums1, 3, nums2, 3);
    
    for (int v : nums1) cout << v << " ";
    cout << endl;
    return 0;
}
`,
    testCases: [
      { input: 'nums1=[1,2,3,0,0,0], m=3, nums2=[2,5,6], n=3', output: '[1, 2, 2, 3, 5, 6]' },
      { input: 'nums1=[1], m=1, nums2=[], n=0', output: '[1]' },
      { input: 'nums1=[0], m=0, nums2=[1], n=1', output: '[1]' },
    ],
    solutionHints: [
      'If you merge from the front, you will overwrite elements in `nums1` that have not been read yet.',
      'Solution: Start three pointers at the back (`p1 = m - 1`, `p2 = n - 1`, `writePtr = m + n - 1`).',
      'Compare `nums1[p1]` and `nums2[p2]`, place the larger one at `writePtr`, and decrement.',
    ],
    timeComplexityOptimal: 'O(m + n)',
    spaceComplexityOptimal: 'O(1)',
  },
];
