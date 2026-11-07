from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.learning import LearningProgress
from backend.app.schemas.learning import LearningTopic, ProgressUpdate, QuizQuestion

router = APIRouter(prefix="/api/learning", tags=["Learning Center"])

TOPICS_DATA: List[Dict[str, Any]] = [
    {
        "id": "intro-buffer-overflow",
        "title": "1. Introduction to Buffer Overflow",
        "category": "Fundamentals",
        "difficulty": "Beginner",
        "summary": "Core concepts of memory buffers, how overflows happen, and why C is susceptible.",
        "content_markdown": """### What is a Buffer Overflow?
A buffer overflow occurs when a program writes more data to a block of allocated memory (a buffer) than the buffer was designed to hold. In languages without built-in boundary checking like C and C++, the extra data smashes into adjacent memory locations.

#### Key Mechanics:
- **Memory Buffer:** A contiguous block of memory allocated for variables, arrays, or structs.
- **Unchecked Bounds:** Standard C does not verify whether array indices or pointer dereferences are within bounds at runtime.
- **Consequence:** Corrupting adjacent data structures, program variables, or CPU return pointers.
""",
        "c_example_unsafe": "char buf[4];\nstrcpy(buf, \"OVERFLOW\"); /* 9 bytes into 4-byte buffer! */",
        "c_example_safe": "char buf[4];\nsnprintf(buf, sizeof(buf), \"%s\", \"OVERFLOW\"); /* Bounded to 3 chars + '\\0' */",
        "quizzes": [
            {
                "id": 1,
                "question": "What happens when more bytes are written into a C buffer than its declared capacity?",
                "options": [
                    "The runtime automatically resizes the array",
                    "C throws an ArrayOutOfBoundsException",
                    "Excess bytes overwrite adjacent memory cells (Undefined Behavior)",
                    "The compiler cancels program execution"
                ],
                "correct_index": 2,
                "explanation": "C does not perform runtime bounds checking. Extra bytes write directly into adjacent memory."
            }
        ]
    },
    {
        "id": "c-memory-management",
        "title": "2. Understanding C Memory Management",
        "category": "Architecture",
        "difficulty": "Beginner",
        "summary": "How operating systems segment process memory into text, data, bss, heap, and stack.",
        "content_markdown": """### Process Memory Layout
A typical C program's virtual memory address space is divided into 5 standard segments:
1. **Text Segment (Code):** Read-only instructions.
2. **Initialized Data (.data):** Global and static variables with initial values.
3. **BSS (.bss):** Uninitialized global and static variables.
4. **Heap Segment:** Dynamically allocated memory (malloc, calloc), grows upward toward higher addresses.
5. **Stack Segment:** Local variables, stack frames, return addresses; grows downward toward lower addresses.
""",
        "c_example_unsafe": "int global_var = 10; // Data segment\nvoid func() { char local[16]; // Stack segment }",
        "c_example_safe": "int main() { char *dyn = malloc(32); free(dyn); return 0; }",
        "quizzes": [
            {
                "id": 2,
                "question": "Which memory segment typically holds local function variables?",
                "options": ["Heap", "Stack", "Text Segment", "BSS Segment"],
                "correct_index": 1,
                "explanation": "Local variables declared inside function blocks reside on the Stack frame."
            }
        ]
    },
    {
        "id": "stack-vs-heap",
        "title": "3. Stack and Heap Memory",
        "category": "Architecture",
        "difficulty": "Intermediate",
        "summary": "Contrasting allocation mechanics, lifetime, and overflow implications of stack vs heap.",
        "content_markdown": """### Stack vs Heap Comparison
- **Stack Memory:**
  - Automatic allocation and deallocation upon function entry/return.
  - Very fast LIFO (Last In First Out) structure.
  - Vulnerable to Stack Smashing (CWE-121).
- **Heap Memory:**
  - Manual allocation via `malloc()`, `calloc()`, and deallocation via `free()`.
  - Slower, fragmented over time.
  - Vulnerable to Heap Overflow (CWE-122) and Use-After-Free (CWE-416).
""",
        "c_example_unsafe": "char *h = malloc(8); strcpy(h, \"1234567890\"); // Corrupts heap metadata",
        "c_example_safe": "char *h = malloc(16); if (h) { strncpy(h, \"1234567890\", 15); h[15] = '\\0'; free(h); }",
        "quizzes": [
            {
                "id": 3,
                "question": "Which memory region is managed automatically by the compiler using function call frames?",
                "options": ["Heap", "Stack", "Dynamic Pool", "Shared Segment"],
                "correct_index": 1,
                "explanation": "The stack automatically pushes and pops activation records as functions are called and return."
            }
        ]
    },
    {
        "id": "char-arrays-strings",
        "title": "4. Character Arrays and Strings",
        "category": "C Language",
        "difficulty": "Beginner",
        "summary": "How C strings are simply null-terminated contiguous byte arrays.",
        "content_markdown": """### C String Representation
In C, there is no primitive `string` data type. A string is merely an array of `char` bytes terminated by the ASCII null byte `\\0` (value 0).

```
Index:    0    1    2    3    4    5
Content: 'H'  'E'  'L'  'L'  'O'  '\\0'
Byte:   0x48 0x45 0x4C 0x4C 0x4F 0x00
```
Capacity must always be: **Array Size >= String Length + 1**.
""",
        "c_example_unsafe": "char word[5] = \"HELLO\"; // Error: No room for null terminator! Has 5 chars, needs 6 bytes.",
        "c_example_safe": "char word[6] = \"HELLO\"; // Valid: 5 chars + 1 byte for '\\0'",
        "quizzes": [
            {
                "id": 4,
                "question": "How many bytes of storage does the string 'SYSTEM' require in C?",
                "options": ["6 bytes", "7 bytes", "8 bytes", "5 bytes"],
                "correct_index": 1,
                "explanation": "'SYSTEM' has 6 characters plus 1 byte for the mandatory '\\0' null terminator, requiring 7 bytes."
            }
        ]
    },
    {
        "id": "null-terminators",
        "title": "5. Null Terminators and String Boundaries",
        "category": "C Language",
        "difficulty": "Beginner",
        "summary": "The critical role of '\\0' and vulnerabilities caused by missing null bytes.",
        "content_markdown": """### The Crucial Role of `\\0`
String functions in C (like `strlen()`, `printf(\"%s\")`, `strcpy()`) do not know array capacity. They continue reading sequential memory bytes until they encounter a byte equal to `0x00`.

If a string lacks a null terminator:
1. Functions read past the buffer into adjacent memory (Information Disclosure / Heartbleed-style bug).
2. Functions write indefinitely until memory segfaults or writes collide.
""",
        "c_example_unsafe": "char a[3] = {'A', 'B', 'C'};\nprintf(\"%s\", a); // Reads past 'C' indefinitely until finding a 0x00 byte!",
        "c_example_safe": "char a[4] = {'A', 'B', 'C', '\\0'};\nprintf(\"%s\", a); // Safely prints ABC",
        "quizzes": [
            {
                "id": 5,
                "question": "What happens if you pass a non-null-terminated char array to printf('%s')?",
                "options": [
                    "It prints an empty string",
                    "It reads past the array into adjacent memory until finding a null byte or crashing",
                    "The compiler generates a syntax error",
                    "It prints only the first byte"
                ],
                "correct_index": 1,
                "explanation": "printf('%s') keeps scanning memory sequentially until it encounters an ASCII 0x00."
            }
        ]
    },
    {
        "id": "stack-buffer-overflow",
        "title": "6. Stack-based Buffer Overflow (CWE-121)",
        "category": "Vulnerabilities",
        "difficulty": "Intermediate",
        "summary": "Stack layout, saved frame pointers, and hijacking instruction pointers via return address overwrites.",
        "content_markdown": """### Stack Layout & Smashing
When a function is called, a stack frame is constructed:
```
[ High Addresses ]
  Function Arguments
  Return Instruction Pointer (Saved RIP/EIP)  <-- Target of exploit!
  Saved Frame Pointer (Saved RBP/EBP)
  Local Variables & Buffers                   <-- Overflow origin
[ Low Addresses ]
```
When an unchecked write writes upwards toward higher addresses, it overwrites local vars -> saved RBP -> saved RIP. When the function returns (`RET`), the CPU jumps to the attacker's chosen address!
""",
        "c_example_unsafe": "void test() {\n  char buf[8];\n  gets(buf); // Overwrites Saved EBP and Return Address!\n}",
        "c_example_safe": "void test() {\n  char buf[8];\n  fgets(buf, sizeof(buf), stdin);\n}",
        "quizzes": [
            {
                "id": 6,
                "question": "What critical CPU control value on the stack is targeted by traditional buffer overflow exploits?",
                "options": ["Program Counter / Return Address", "Stack Base Address", "Data Segment Offset", "Thread Priority Register"],
                "correct_index": 0,
                "explanation": "Overwriting the saved Return Address allows an attacker to hijack the CPU's execution path upon function return."
            }
        ]
    },
    {
        "id": "heap-buffer-overflow",
        "title": "7. Heap-based Buffer Overflow (CWE-122)",
        "category": "Vulnerabilities",
        "difficulty": "Advanced",
        "summary": "Overwriting dynamically allocated chunks and corrupting heap allocator chunk headers.",
        "content_markdown": """### Heap Buffer Overflow Mechanics
Unlike stack overflows which overwrite return addresses, heap overflows overwrite:
- Adjacent dynamically allocated objects.
- C++ vtables and function pointers stored on the heap.
- Heap allocator metadata (chunk headers, size flags, forward/backward linked list pointers).
""",
        "c_example_unsafe": "struct User *u = malloc(sizeof(struct User));\nchar *buf = malloc(16);\nstrcpy(buf, huge_input); // Overwrites struct User data!",
        "c_example_safe": "snprintf(buf, 16, \"%s\", input);",
        "quizzes": [
            {
                "id": 7,
                "question": "What can a heap buffer overflow corrupt?",
                "options": ["Only the text segment", "Adjacent allocated buffers, function pointers, and allocator metadata", "Kernel ROM memory", "BIOS chip tables"],
                "correct_index": 1,
                "explanation": "Heap overflows corrupt adjacent memory chunks, dynamic function pointers, and malloc chunk headers."
            }
        ]
    },
    {
        "id": "off-by-one",
        "title": "8. Off-by-One Errors (CWE-193)",
        "category": "Vulnerabilities",
        "difficulty": "Intermediate",
        "summary": "Boundary mismatch errors that write exactly 1 byte past buffer capacity.",
        "content_markdown": """### Subtle Yet Fatal: The Single-Byte Overwrite
Off-by-one errors occur due to loop indexing confusion (e.g., `<=` instead of `<`) or forgetting the null terminator.

Even a single byte overflow can overwrite the least significant byte of the saved base pointer (`EBP/RBP`), shifting the caller's stack frame into attacker-controlled memory (Stack Pivoting).
""",
        "c_example_unsafe": "for (int i = 0; i <= 10; i++) buf[i] = 'A'; /* buf[10] array only has indices 0-9! */",
        "c_example_safe": "for (int i = 0; i < 10; i++) buf[i] = 'A';",
        "quizzes": [
            {
                "id": 8,
                "question": "For an array declared as 'int arr[10];', which index access represents an out-of-bounds error?",
                "options": ["arr[0]", "arr[5]", "arr[9]", "arr[10]"],
                "correct_index": 3,
                "explanation": "In 0-indexed C arrays of size 10, valid indices are 0 through 9. Index 10 is out-of-bounds."
            }
        ]
    },
    {
        "id": "unsafe-functions",
        "title": "9. Dangerous and Banned C Functions (CWE-676)",
        "category": "Secure Coding",
        "difficulty": "Beginner",
        "summary": "Detailed breakdown of legacy unsafe C standard library functions.",
        "content_markdown": """### Banned Functions Table
| Unsafe Function | Risk Factor | Safe Replacement |
|---|---|---|
| `gets(buf)` | Unbounded read | `fgets(buf, sizeof(buf), stdin)` |
| `strcpy(dst, src)` | Unbounded copy | `snprintf(dst, sizeof(dst), \"%s\", src)` |
| `strcat(dst, src)` | Unbounded append | `strncat(dst, src, sizeof(dst)-strlen(dst)-1)` |
| `sprintf(dst, ...)` | Unbounded format | `snprintf(dst, sizeof(dst), ...)` |
| `scanf(\"%s\", buf)` | Unbounded token read | `scanf(\"%31s\", buf)` (with width specifier) |
""",
        "c_example_unsafe": "sprintf(buffer, \"User: %s\", name);",
        "c_example_safe": "snprintf(buffer, sizeof(buffer), \"User: %s\", name);",
        "quizzes": [
            {
                "id": 9,
                "question": "Why was gets() completely removed from the ISO C11 standard?",
                "options": [
                    "It was too slow",
                    "It has no parameter to specify buffer size, making overflow prevention impossible",
                    "It only worked on ASCII strings",
                    "It conflicted with C++ streams"
                ],
                "correct_index": 1,
                "explanation": "gets() lacks any buffer size argument, making it fundamentally impossible to prevent overflows."
            }
        ]
    },
    {
        "id": "secure-c-practices",
        "title": "10. Secure C Programming Practices",
        "category": "Secure Coding",
        "difficulty": "Intermediate",
        "summary": "Defensive guidelines, input size validation, and safe buffer manipulation.",
        "content_markdown": """### Defensive Programming Guidelines
1. Always calculate and validate remaining destination capacity before writing.
2. Use size-bounded functions (`snprintf`, `fgets`).
3. Explicitly verify return values of I/O and string operations.
4. Always ensure the terminating byte `\\0` is explicitly set if using `strncpy()`.
5. Adopt compiler warning flags: `-Wall -Wextra -Werror -pedantic`.
""",
        "c_example_unsafe": "strncpy(dest, src, sizeof(dest)); /* Dest might not be null terminated if strlen(src) >= sizeof(dest)! */",
        "c_example_safe": "strncpy(dest, src, sizeof(dest) - 1);\ndest[sizeof(dest) - 1] = '\\0';",
        "quizzes": [
            {
                "id": 10,
                "question": "What is a major pitfall of strncpy(dest, src, n)?",
                "options": [
                    "It does not work on ASCII",
                    "If src length >= n, it does NOT null-terminate dest",
                    "It allocates memory on the heap",
                    "It crashes on empty strings"
                ],
                "correct_index": 1,
                "explanation": "If source length equals or exceeds n, strncpy leaves destination without a terminating null byte."
            }
        ]
    },
    {
        "id": "compiler-protections",
        "title": "11. Modern Compiler Security Protections",
        "category": "Mitigations",
        "difficulty": "Intermediate",
        "summary": "Stack canaries, ASLR, DEP/NX, and RELRO mitigations.",
        "content_markdown": """### Operating System & Compiler Mitigations
- **Stack Canaries (`-fstack-protector-all`):** Places a random secret cookie before the return address. If corrupted upon return, program calls `__stack_chk_fail()` and terminates.
- **NX / DEP (Data Execution Prevention):** Marks stack and heap pages as Non-Executable (`-z noexecstack`), preventing execution of injected shellcode.
- **ASLR (Address Space Layout Randomization):** Randomizes stack, heap, and library base addresses on each program run.
- **RELRO (Read-Only Relocations):** Makes GOT (Global Offset Table) read-only after link resolution.
""",
        "c_example_unsafe": "gcc -fno-stack-protector -z execstack demo.c",
        "c_example_safe": "gcc -fstack-protector-strong -D_FORTIFY_SOURCE=2 -O2 -Wl,-z,relro,-z,now demo.c",
        "quizzes": [
            {
                "id": 11,
                "question": "How does a compiler stack canary detect a buffer overflow?",
                "options": [
                    "It halts execution before memory is allocated",
                    "It checks if a sentinel value placed between local buffer and return address has changed",
                    "It encrypts the entire function code",
                    "It disables stack memory completely"
                ],
                "correct_index": 1,
                "explanation": "A canary is a secret integer placed right before the return address; if modified, execution aborts."
            }
        ]
    },
    {
        "id": "address-sanitizer",
        "title": "12. AddressSanitizer (ASan) & Tooling",
        "category": "Tooling",
        "difficulty": "Intermediate",
        "summary": "Instrumenting code with `-fsanitize=address` to catch buffer overflows at runtime.",
        "content_markdown": """### What is AddressSanitizer?
AddressSanitizer (ASan) is a fast memory error detector designed by Google and integrated into GCC and Clang.

#### Features:
- Detects out-of-bounds accesses on Heap, Stack, and Globals.
- Detects Use-After-Free and Double Free errors.
- Minimal CPU overhead (~2x) compared to Valgrind (~20x).

#### Usage:
```bash
gcc -fsanitize=address -g program.c -o program
./program
```
""",
        "c_example_unsafe": "int a[5]; a[5] = 42; // ASan detects global/stack buffer overflow immediately!",
        "c_example_safe": "int a[5]; a[4] = 42; // Valid index within [0..4]",
        "quizzes": [
            {
                "id": 12,
                "question": "Which compiler flag enables AddressSanitizer in GCC or Clang?",
                "options": ["-fsanitize=address", "-fsafe-mode", "-O3", "-Wmemory-check"],
                "correct_index": 0,
                "explanation": "-fsanitize=address instruments memory loads and stores with shadow memory checks."
            }
        ]
    },
    {
        "id": "real-world-consequences",
        "title": "13. Real-world Consequences of Memory Corruption",
        "category": "Cybersecurity",
        "difficulty": "Intermediate",
        "summary": "Historic attacks: Morris Worm, Heartbleed, Stagefright, and modern zero-days.",
        "content_markdown": """### Landmark Memory Corruption Attacks
- **Morris Worm (1988):** First major internet worm; exploited a buffer overflow in the UNIX `fingerd` daemon using `gets()`.
- **Heartbleed (2014):** Missing bounds check in OpenSSL TLS heartbeat extension allowed remote memory extraction of encryption keys.
- **Stagefright (2015):** Integer and buffer overflows in Android media playback library leading to remote code execution.
- **Pegasus Spyware:** Chained zero-click iMessage image-parsing buffer overflows to compromise mobile kernels.
""",
        "c_example_unsafe": "/* Fingerd legacy code snippet */\nchar username[512];\ngets(username);",
        "c_example_safe": "/* Hardened implementation */\nchar username[512];\nfgets(username, sizeof(username), stdin);",
        "quizzes": [
            {
                "id": 13,
                "question": "Which early internet worm exploited gets() in the fingerd service in 1988?",
                "options": ["ILOVEYOU", "Morris Worm", "Stuxnet", "WannaCry"],
                "correct_index": 1,
                "explanation": "The 1988 Morris Worm brought down ~10% of the early Internet using a fingerd gets() stack overflow."
            }
        ]
    },
    {
        "id": "defensive-programming",
        "title": "14. Defensive Programming & Safe String Libraries",
        "category": "Secure Coding",
        "difficulty": "Advanced",
        "summary": "Building resilient C software using custom bounds-checked abstractions.",
        "content_markdown": """### Principles of Defensive Programming
1. **Never Trust Input:** Treat every string from network, user, or file as potentially malicious and unbounded.
2. **Fail Closed:** If a buffer is too small, truncate safely or return an explicit error code rather than continuing in an invalid state.
3. **Encapsulate Buffer Management:** Use structured string types with explicit capacity fields (like SDS or safe string wrappers) instead of raw `char*`.
""",
        "c_example_unsafe": "void log_data(char *msg) { char b[64]; sprintf(b, \"LOG: %s\", msg); }",
        "c_example_safe": "typedef struct { char *data; size_t capacity; size_t length; } SafeString;\n/* Safe bounded operations */",
        "quizzes": [
            {
                "id": 14,
                "question": "What is the core principle of defensive programming regarding external input?",
                "options": [
                    "Assume input is well-formed if passed from internal network",
                    "Never trust input; validate length and format before copying into memory",
                    "Rely on compiler warnings alone",
                    "Only sanitize numeric integers"
                ],
                "correct_index": 1,
                "explanation": "Defensive programming requires validating lengths, types, and boundaries on all external data."
            }
        ]
    }
]

@router.get("/topics", response_model=List[LearningTopic])
def get_all_topics(db: Session = Depends(get_db)):
    progress_records = {p.topic_id: p for p in db.query(LearningProgress).all()}
    
    result = []
    for t in TOPICS_DATA:
        topic_copy = dict(t)
        prog = progress_records.get(t["id"])
        topic_copy["completed"] = prog.completion_status if prog else False
        topic_copy["score"] = prog.quiz_score if prog else 0
        result.append(topic_copy)
    return result

@router.get("/topics/{topic_id}", response_model=LearningTopic)
def get_topic_detail(topic_id: str, db: Session = Depends(get_db)):
    topic = next((t for t in TOPICS_DATA if t["id"] == topic_id), None)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found.")

    prog = db.query(LearningProgress).filter(LearningProgress.topic_id == topic_id).first()
    topic_copy = dict(topic)
    topic_copy["completed"] = prog.completion_status if prog else False
    topic_copy["score"] = prog.quiz_score if prog else 0
    return topic_copy

@router.post("/progress")
def update_progress(payload: ProgressUpdate, db: Session = Depends(get_db)):
    prog = db.query(LearningProgress).filter(LearningProgress.topic_id == payload.topic_id).first()
    topic = next((t for t in TOPICS_DATA if t["id"] == payload.topic_id), None)
    title = topic["title"] if topic else payload.topic_id

    if prog:
        prog.completion_status = payload.completion_status
        prog.quiz_score = payload.quiz_score
    else:
        prog = LearningProgress(
            topic_id=payload.topic_id,
            topic_title=title,
            completion_status=payload.completion_status,
            quiz_score=payload.quiz_score
        )
        db.add(prog)

    db.commit()
    db.refresh(prog)
    return {
        "success": True,
        "topic_id": prog.topic_id,
        "completed": prog.completion_status,
        "score": prog.quiz_score
    }
