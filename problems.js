{
  "problems": [
    {
      "slug": "echo",
      "title": "Echo",
      "statement": "## Echo\n\nRead a single line from standard input and print it.\n\n### Constraints\n- Input length <= 10^4\n\n### Sample\nInput:\n```\nhello\n```\nOutput:\n```\nhello\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "hello\n", "expected_output": "hello\n", "is_sample": true },
        { "input": "world\n", "expected_output": "world\n", "is_sample": true },
        { "input": "42\n", "expected_output": "42\n", "is_sample": false },
        { "input": "Code Judge!\n", "expected_output": "Code Judge!\n", "is_sample": false }
      ]
    },
    {
      "slug": "sum-a-b",
      "title": "A + B",
      "statement": "## A + B\n\nGiven two integers A and B (0 <= A, B <= 10^9) on one line, print their sum.\n\n### Sample\nInput:\n```\n3 5\n```\nOutput:\n```\n8\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "3 5\n", "expected_output": "8\n", "is_sample": true },
        { "input": "10 20\n", "expected_output": "30\n", "is_sample": true },
        { "input": "0 0\n", "expected_output": "0\n", "is_sample": false },
        { "input": "100 1\n", "expected_output": "101\n", "is_sample": false }
      ]
    },
    {
      "slug": "max-of-two",
      "title": "Maximum of Two Numbers",
      "statement": "## Maximum of Two Numbers\n\nRead two integers and print the larger one.\n\n### Constraints\n- -10^9 <= A, B <= 10^9\n\n### Sample\nInput:\n```\n4 7\n```\nOutput:\n```\n7\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "4 7\n", "expected_output": "7\n", "is_sample": true },
        { "input": "15 8\n", "expected_output": "15\n", "is_sample": true },
        { "input": "10 3\n", "expected_output": "10\n", "is_sample": false },
        { "input": "5 5\n", "expected_output": "5\n", "is_sample": false }
      ]
    },
    {
      "slug": "reverse-string",
      "title": "Reverse a String",
      "statement": "## Reverse a String\n\nRead a string and print it reversed.\n\n### Sample\nInput:\n```\nhello\n```\nOutput:\n```\nolleh\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "hello\n", "expected_output": "olleh\n", "is_sample": true },
        { "input": "abc\n", "expected_output": "cba\n", "is_sample": false },
        { "input": "racecar\n", "expected_output": "racecar\n", "is_sample": false }
      ]
    },
    {
      "slug": "factorial",
      "title": "Factorial",
      "statement": "## Factorial\n\nGiven an integer N (0 <= N <= 20), print N!.\n\n### Sample\nInput:\n```\n5\n```\nOutput:\n```\n120\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "5\n", "expected_output": "120\n", "is_sample": true },
        { "input": "0\n", "expected_output": "1\n", "is_sample": false },
        { "input": "1\n", "expected_output": "1\n", "is_sample": false }
      ]
    },
    {
      "slug": "palindrome-check",
      "title": "Palindrome Check",
      "statement": "## Palindrome Check\n\nGiven a string, check if it is a palindrome (case-sensitive). Print YES if it is, NO otherwise.\n\n### Sample\nInput:\n```\nmadam\n```\nOutput:\n```\nYES\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "madam\n", "expected_output": "YES\n", "is_sample": true },
        { "input": "hello\n", "expected_output": "NO\n", "is_sample": false },
        { "input": "racecar\n", "expected_output": "YES\n", "is_sample": false }
      ]
    },
    {
      "slug": "fibonacci",
      "title": "Fibonacci Number",
      "statement": "## Fibonacci Number\n\nGiven an integer N (0 <= N <= 30), print the Nth Fibonacci number (0-indexed).\n\n### Sample\nInput:\n```\n6\n```\nOutput:\n```\n8\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "6\n", "expected_output": "8\n", "is_sample": true },
        { "input": "0\n", "expected_output": "0\n", "is_sample": false },
        { "input": "1\n", "expected_output": "1\n", "is_sample": false }
      ]
    },
    {
      "slug": "prime-check",
      "title": "Prime Check",
      "statement": "## Prime Check\n\nGiven an integer N, print YES if it is prime, NO otherwise.\n\n### Sample\nInput:\n```\n7\n```\nOutput:\n```\nYES\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "7\n", "expected_output": "YES\n", "is_sample": true },
        { "input": "9\n", "expected_output": "NO\n", "is_sample": false },
        { "input": "2\n", "expected_output": "YES\n", "is_sample": false }
      ]
    },
    {
      "slug": "matrix-sum",
      "title": "Matrix Sum",
      "statement": "## Matrix Sum\n\nRead a 2D matrix of size N x M and print the sum of all elements.\n\n### Constraints\n- 1 <= N, M <= 100\n- -1000 <= element <= 1000\n\n### Sample\nInput:\n```\n2 2\n1 2\n3 4\n```\nOutput:\n```\n10\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "2 2\n1 2\n3 4\n", "expected_output": "10\n", "is_sample": true },
        { "input": "1 3\n1 2 3\n", "expected_output": "6\n", "is_sample": false },
        { "input": "2 3\n-1 -2 -3\n4 5 6\n", "expected_output": "9\n", "is_sample": false }
      ]
    },
    {
      "slug": "array-max",
      "title": "Array Maximum",
      "statement": "## Array Maximum\n\nRead an array of N integers and print the maximum value.\n\n### Constraints\n- 1 <= N <= 1000\n\n### Sample\nInput:\n```\n5\n1 9 2 8 3\n```\nOutput:\n```\n9\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "5\n1 9 2 8 3\n", "expected_output": "9\n", "is_sample": true },
        { "input": "3\n-1 -5 -3\n", "expected_output": "-1\n", "is_sample": false },
        { "input": "4\n10 20 30 40\n", "expected_output": "40\n", "is_sample": false }
      ]
    },
    {
      "slug": "gcd",
      "title": "Greatest Common Divisor",
      "statement": "## Greatest Common Divisor\n\nGiven two integers A and B, print their GCD.\n\n### Sample\nInput:\n```\n12 18\n```\nOutput:\n```\n6\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "12 18\n", "expected_output": "6\n", "is_sample": true },
        { "input": "7 13\n", "expected_output": "1\n", "is_sample": false },
        { "input": "21 14\n", "expected_output": "7\n", "is_sample": false }
      ]
    },
    {
      "slug": "lcm",
      "title": "Least Common Multiple",
      "statement": "## Least Common Multiple\n\nGiven two integers A and B, print their LCM.\n\n### Sample\nInput:\n```\n4 6\n```\nOutput:\n```\n12\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "4 6\n", "expected_output": "12\n", "is_sample": true },
        { "input": "5 7\n", "expected_output": "35\n", "is_sample": false },
        { "input": "10 15\n", "expected_output": "30\n", "is_sample": false }
      ]
    },
    {
      "slug": "count-vowels",
      "title": "Count Vowels",
      "statement": "## Count Vowels\n\nRead a string and print the number of vowels in it.\n\n### Sample\nInput:\n```\nhello\n```\nOutput:\n```\n2\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "hello\n", "expected_output": "2\n", "is_sample": true },
        { "input": "AEIOU\n", "expected_output": "5\n", "is_sample": false },
        { "input": "xyz\n", "expected_output": "0\n", "is_sample": false }
      ]
    },
    {
      "slug": "sum-digits",
      "title": "Sum of Digits",
      "statement": "## Sum of Digits\n\nRead an integer N and print the sum of its digits.\n\n### Sample\nInput:\n```\n1234\n```\nOutput:\n```\n10\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "1234\n", "expected_output": "10\n", "is_sample": true },
        { "input": "999\n", "expected_output": "27\n", "is_sample": false },
        { "input": "0\n", "expected_output": "0\n", "is_sample": false }
      ]
    },
    {
      "slug": "string-length",
      "title": "String Length",
      "statement": "## String Length\n\nRead a string and print its length.\n\n### Sample\nInput:\n```\nhello\n```\nOutput:\n```\n5\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "hello\n", "expected_output": "5\n", "is_sample": true },
        { "input": "abc\n", "expected_output": "3\n", "is_sample": false },
        { "input": "Code\n", "expected_output": "4\n", "is_sample": false }
      ]
    },
    {
      "slug": "reverse-number",
      "title": "Reverse Number",
      "statement": "## Reverse Number\n\nGiven an integer N, print its digits reversed.\n\n### Sample\nInput:\n```\n123\n```\nOutput:\n```\n321\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "123\n", "expected_output": "321\n", "is_sample": true },
        { "input": "100\n", "expected_output": "1\n", "is_sample": false },
        { "input": "4005\n", "expected_output": "5004\n", "is_sample": false }
      ]
    },
    {
      "slug": "celsius-to-fahrenheit",
      "title": "Celsius to Fahrenheit",
      "statement": "## Celsius to Fahrenheit\n\nRead a Celsius temperature and convert it to Fahrenheit using the formula F = (C * 9/5) + 32.\n\n### Sample\nInput:\n```\n0\n```\nOutput:\n```\n32\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "0\n", "expected_output": "32\n", "is_sample": true },
        { "input": "100\n", "expected_output": "212\n", "is_sample": false },
        { "input": "-40\n", "expected_output": "-40\n", "is_sample": false }
      ]
    },
    {
      "slug": "leap-year",
      "title": "Leap Year",
      "statement": "## Leap Year\n\nGiven a year, print YES if it's a leap year, otherwise print NO.\n\n### Sample\nInput:\n```\n2000\n```\nOutput:\n```\nYES\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "2000\n", "expected_output": "YES\n", "is_sample": true },
        { "input": "1900\n", "expected_output": "NO\n", "is_sample": false },
        { "input": "2024\n", "expected_output": "YES\n", "is_sample": false }
      ]
    },
    {
      "slug": "array-sum",
      "title": "Array Sum",
      "statement": "## Array Sum\n\nRead an array of N integers and print the sum of all elements.\n\n### Sample\nInput:\n```\n4\n1 2 3 4\n```\nOutput:\n```\n10\n```",
      "time_limit_ms": 2000,
      "memory_limit_kb": 65536,
      "testcases": [
        { "input": "4\n1 2 3 4\n", "expected_output": "10\n", "is_sample": true },
        { "input": "3\n10 20 30\n", "expected_output": "60\n", "is_sample": false },
        { "input": "5\n-1 -2 -3 -4 -5\n", "expected_output": "-15\n", "is_sample": false }
      ]
    }
  ]
}
