[
  {
    slug: 'sum-two-numbers-python',
    title: 'Sum of Two Numbers',
    statement: `## Sum of Two Numbers

Write a program that reads two integers and prints their sum.

**Your task:** Fix the buggy code so it correctly computes the sum.

**Input:** 
- Two integers separated by space

**Output:**
- Single integer (sum)

**Example:**
- Input: 3 4
- Output: 7`,
    language_id: 71,
    buggy_code: `# Buggy code
nums = input().split()
a = nums[0]
b = nums[1]
print(a - b)  # BUG: using subtraction and strings not converted to int`,
    difficulty: 'easy',
    testcases: [
      { input: '3 4\n', expected_output: '7\n', is_sample: true },
      { input: '10 15\n', expected_output: '25\n', is_sample: false }
    ]
  },
  {
    slug: 'factorial-python',
    title: 'Factorial of a Number',
    statement: `## Factorial

Given a number n, calculate n!.

**Your task:** Fix the code to compute factorial using recursion.

**Input:**
- A single integer n (0 ≤ n ≤ 10)

**Output:**
- Factorial value

**Example:**
- Input: 5
- Output: 120`,
    language_id: 71,
    buggy_code: `def fact(n):
    if n == 0:
        return 0  # BUG: should return 1
    return n * fact(n - 1)

n = int(input())
print(fact(n))`,
    difficulty: 'easy',
    testcases: [
      { input: '5\n', expected_output: '120\n', is_sample: true },
      { input: '0\n', expected_output: '1\n', is_sample: false }
    ]
  },
  {
    slug: 'reverse-string-python',
    title: 'Reverse a String',
    statement: `## Reverse String

Read a string and print it reversed.

**Input:**
- A string

**Output:**
- Reversed string

**Example:**
- Input: hello
- Output: olleh`,
    language_id: 71,
    buggy_code: `s = input()
print(s[0:])  # BUG: not reversed`,
    difficulty: 'easy',
    testcases: [
      { input: 'hello\n', expected_output: 'olleh\n', is_sample: true },
      { input: 'world\n', expected_output: 'dlrow\n', is_sample: false }
    ]
  },
  {
    slug: 'prime-check-python',
    title: 'Check Prime Number',
    statement: `## Prime Number Check

Given a number n, check if it's prime.

**Input:**
- A single integer

**Output:**
- 'YES' if prime, 'NO' otherwise

**Example:**
- Input: 7
- Output: YES`,
    language_id: 71,
    buggy_code: `n = int(input())
if n % 2 == 0:
    print("YES")  # BUG: assumes all even are prime
else:
    print("NO")`,
    difficulty: 'medium',
    testcases: [
      { input: '7\n', expected_output: 'YES\n', is_sample: true },
      { input: '8\n', expected_output: 'NO\n', is_sample: false }
    ]
  },
  {
    slug: 'fibonacci-python',
    title: 'Nth Fibonacci Number',
    statement: `## Fibonacci Number

Given n, print the nth Fibonacci number (0-indexed).

**Input:**
- An integer n

**Output:**
- nth Fibonacci number

**Example:**
- Input: 5
- Output: 5`,
    language_id: 71,
    buggy_code: `def fib(n):
    if n <= 1:
        return 1  # BUG: should return n
    return fib(n-1) + fib(n-2)

n = int(input())
print(fib(n))`,
    difficulty: 'medium',
    testcases: [
      { input: '5\n', expected_output: '5\n', is_sample: true },
      { input: '7\n', expected_output: '13\n', is_sample: false }
    ]
  },
  {
    slug: 'palindrome-check-python',
    title: 'Check Palindrome String',
    statement: `## Palindrome Check

Check if a string is a palindrome.

**Input:**
- A string

**Output:**
- 'YES' if palindrome, else 'NO'

**Example:**
- Input: madam
- Output: YES`,
    language_id: 71,
    buggy_code: `s = input()
if s == s.upper():  # BUG: wrong check
    print("YES")
else:
    print("NO")`,
    difficulty: 'medium',
    testcases: [
      { input: 'madam\n', expected_output: 'YES\n', is_sample: true },
      { input: 'hello\n', expected_output: 'NO\n', is_sample: false }
    ]
  },
  {
    slug: 'gcd-python',
    title: 'Greatest Common Divisor',
    statement: `## GCD

Find the GCD of two numbers.

**Input:**
- Two integers

**Output:**
- Single integer (gcd)

**Example:**
- Input: 12 18
- Output: 6`,
    language_id: 71,
    buggy_code: `import math
x, y = map(int, input().split())
print(x*y)  # BUG: printing product`,
    difficulty: 'hard',
    testcases: [
      { input: '12 18\n', expected_output: '6\n', is_sample: true },
      { input: '100 25\n', expected_output: '25\n', is_sample: false }
    ]
  },
  {
    slug: 'matrix-transpose-python',
    title: 'Matrix Transpose',
    statement: `## Matrix Transpose

Transpose a matrix.

**Input:**
- n m (rows and cols)
- matrix elements row-wise

**Output:**
- Transposed matrix

**Example:**
- Input: 2 2\n1 2\n3 4
- Output: 1 3\n2 4`,
    language_id: 71,
    buggy_code: `n, m = map(int, input().split())
mat = [list(map(int, input().split())) for _ in range(n)]
for i in range(n):  # BUG: should loop cols first
    for j in range(m):
        print(mat[i][j], end=" ")
    print()`,
    difficulty: 'hard',
    testcases: [
      { input: '2 2\n1 2\n3 4\n', expected_output: '1 3 \n2 4 \n', is_sample: true },
      { input: '2 3\n1 2 3\n4 5 6\n', expected_output: '1 4 \n2 5 \n3 6 \n', is_sample: false }
    ]
  },
  {
    slug: 'binary-search-python',
    title: 'Binary Search',
    statement: `## Binary Search

Find an element in sorted array.

**Input:**
- n (size)
- array elements
- target value

**Output:**
- Index (0-based) or -1

**Example:**
- Input: 5\n1 2 3 4 5\n3
- Output: 2`,
    language_id: 71,
    buggy_code: `def binary_search(arr, x):
    for i in range(len(arr)):
        if arr[i] == x:
            return i
    return -1  # BUG: linear search not binary

n = int(input())
arr = list(map(int, input().split()))
target = int(input())
print(binary_search(arr, target))`,
    difficulty: 'hard',
    testcases: [
      { input: '5\n1 2 3 4 5\n3\n', expected_output: '2\n', is_sample: true },
      { input: '5\n10 20 30 40 50\n25\n', expected_output: '-1\n', is_sample: false }
    ]
  },
  {
    slug: 'armstrong-python',
    title: 'Armstrong Number',
    statement: `## Armstrong Number

Check if a number is Armstrong (sum of digits^len).

**Input:**
- Single integer

**Output:**
- 'YES' or 'NO'

**Example:**
- Input: 153
- Output: YES`,
    language_id: 71,
    buggy_code: `n = input()
s = sum(int(d) for d in n)  # BUG: power not used
if s == int(n):
    print("YES")
else:
    print("NO")`,
    difficulty: 'medium',
    testcases: [
      { input: '153\n', expected_output: 'YES\n', is_sample: true },
      { input: '123\n', expected_output: 'NO\n', is_sample: false }
    ]
  },
  {
    slug: 'sum-two-numbers-c',
    title: 'Sum of Two Numbers (C)',
    statement: `## Sum of Two Numbers

Write a program that reads two integers and prints their sum.

**Input:** 
- Two integers separated by space

**Output:**
- Single integer (sum)

**Example:**
- Input: 3 4
- Output: 7`,
    language_id: 54,
    buggy_code: `#include <stdio.h>
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", a-b); // BUG: subtraction instead of addition
    return 0;
}`,
    difficulty: 'easy',
    testcases: [
      { input: '3 4\n', expected_output: '7\n', is_sample: true },
      { input: '10 15\n', expected_output: '25\n', is_sample: false }
    ]
  },
  {
    slug: 'factorial-c',
    title: 'Factorial (C)',
    statement: `## Factorial

Given a number n, compute n!.

**Input:**
- Single integer n

**Output:**
- Factorial

**Example:**
- Input: 4
- Output: 24`,
    language_id: 54,
    buggy_code: `#include <stdio.h>
int fact(int n) {
    if (n == 0) return 0; // BUG: should return 1
    return n * fact(n-1);
}
int main() {
    int n; scanf("%d", &n);
    printf("%d", fact(n));
    return 0;
}`,
    difficulty: 'easy',
    testcases: [
      { input: '4\n', expected_output: '24\n', is_sample: true },
      { input: '0\n', expected_output: '1\n', is_sample: false }
    ]
  },
  {
    slug: 'reverse-string-c',
    title: 'Reverse String (C)',
    statement: `## Reverse String

Read a string and print it reversed.

**Input:**
- A string

**Output:**
- Reversed string

**Example:**
- Input: hello
- Output: olleh`,
    language_id: 54,
    buggy_code: `#include <stdio.h>
#include <string.h>
int main() {
    char s[100];
    scanf("%s", s);
    printf("%s", s); // BUG: not reversed
    return 0;
}`,
    difficulty: 'easy',
    testcases: [
      { input: 'hello\n', expected_output: 'olleh\n', is_sample: true },
      { input: 'world\n', expected_output: 'dlrow\n', is_sample: false }
    ]
  },
  {
    slug: 'prime-check-c',
    title: 'Prime Check (C)',
    statement: `## Prime Check

Check if a number is prime.

**Input:**
- Single integer

**Output:**
- YES or NO

**Example:**
- Input: 7
- Output: YES`,
    language_id: 54,
    buggy_code: `#include <stdio.h>
int main() {
    int n; scanf("%d", &n);
    if (n % 2 == 0) printf("YES"); // BUG: wrong logic
    else printf("NO");
    return 0;
}`,
    difficulty: 'medium',
    testcases: [
      { input: '7\n', expected_output: 'YES\n', is_sample: true },
      { input: '8\n', expected_output: 'NO\n', is_sample: false }
    ]
  },
  {
    slug: 'fibonacci-c',
    title: 'Fibonacci (C)',
    statement: `## Fibonacci

Given n, print the nth Fibonacci number.

**Input:**
- Single integer n

**Output:**
- Fibonacci number

**Example:**
- Input: 5
- Output: 5`,
    language_id: 54,
    buggy_code: `#include <stdio.h>
int fib(int n) {
    if (n <= 1) return 1; // BUG: should return n
    return fib(n-1) + fib(n-2);
}
int main() {
    int n; scanf("%d", &n);
    printf("%d", fib(n));
    return 0;
}`,
    difficulty: 'medium',
    testcases: [
      { input: '5\n', expected_output: '5\n', is_sample: true },
      { input: '7\n', expected_output: '13\n', is_sample: false }
    ]
  },
  {
    slug: 'palindrome-c',
    title: 'Palindrome Check (C)',
    statement: `## Palindrome Check

Check if string is palindrome.

**Input:**
- A string

**Output:**
- YES or NO

**Example:**
- Input: madam
- Output: YES`,
    language_id: 54,
    buggy_code: `#include <stdio.h>
#include <string.h>
int main() {
    char s[100];
    scanf("%s", s);
    if (strcmp(s, "madam") == 0) // BUG: hardcoded string
        printf("YES");
    else printf("NO");
    return 0;
}`,
    difficulty: 'medium',
    testcases: [
      { input: 'madam\n', expected_output: 'YES\n', is_sample: true },
      { input: 'hello\n', expected_output: 'NO\n', is_sample: false }
    ]
  },
  {
    slug: 'gcd-c',
    title: 'Greatest Common Divisor (C)',
    statement: `## GCD

Find GCD of two integers.

**Input:**
- Two integers

**Output:**
- GCD value

**Example:**
- Input: 12 18
- Output: 6`,
    language_id: 54,
    buggy_code: `#include <stdio.h>
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", a*b); // BUG: prints product
    return 0;
}`,
    difficulty: 'hard',
    testcases: [
      { input: '12 18\n', expected_output: '6\n', is_sample: true },
      { input: '100 25\n', expected_output: '25\n', is_sample: false }
