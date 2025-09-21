export type Language = { id: number; label: string; value: string };

export const languages: Language[] = [
  { id: 71, label: 'Python 3 (3.8.1)', value: 'python' },
  { id: 50, label: 'C (GCC 9.2.0)', value: 'c' },
];

export const defaultTemplateFor = (id: number) => {
  switch (id) {
    case 50:
      return `#include <stdio.h>\nint main(){\n    char buf[10000];\n    while (fgets(buf, sizeof(buf), stdin)) {\n        printf("%s", buf);\n    }\n    return 0;\n}\n`;
    case 71:
    default:
      return `# Read from STDIN and echo\ns = input()\nprint(s)\n`;
  }
};
