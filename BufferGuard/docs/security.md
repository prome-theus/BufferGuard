# BufferGuard – Security & Sandbox Architecture

## 1. Threat Model & Sandboxing Principles

As a cybersecurity educational and scanning platform, **BufferGuard** handles untrusted user C source code. To defend the server host against arbitrary code execution, denial of service, and directory traversal, BufferGuard implements defense-in-depth isolation principles:

```
[Untrusted User Source Code]
              │
              ▼
   [Request Validation Tier]
   - File extension check (.c, .h, .cpp only)
   - Payload size limit (Max 500KB)
   - UTF-8 decoding sanitization
              │
              ▼
  [Static Analysis Sandbox]
  - Pure Python AST/Regex inspection (No binary execution)
  - Memory bounds heuristic checking
              │
              ▼
 [Host Execution Sandbox Policy]
  - Arbitrary user binaries: DISABLED
  - Syntax check: gcc -fsyntax-only (Does NOT create executable)
  - Runtime execution: APPROVED EDUCATIONAL TEMPLATES ONLY
```

---

## 2. Host Isolation Policy

### 2.1 Rejection of Arbitrary Execution
Executing user-supplied C code directly on a web application host introduces catastrophic risks:
- Spawning fork-bombs and denial-of-service loops.
- Reverse shell creation and network port binding.
- Host filesystem tampering and malware installation.

**Rule:** BufferGuard **never** runs arbitrary compiled binaries uploaded or written in the web editor directly on the host machine.

### 2.2 Controlled Educational Execution
Only verified educational templates stored in the immutable catalog (`APPROVED_EXAMPLES`) can be compiled and run by the backend. When executed, they are subject to:
1. **Isolated Temp Directories:** Disposed automatically after execution using `tempfile.TemporaryDirectory()`.
2. **Process Timeouts:** Enforced 3-second hard timeout killing lingering child processes.
3. **No Network Access:** Child processes are invoked without network socket privileges.
4. **Syntax-Only Analysis:** Arbitrary user code is verified using `gcc -fsyntax-only` which checks grammar and types without producing any machine code executable.

---

## 3. Static Scanner Heuristic Accuracy

BufferGuard distinguishes between four levels of confidence:
1. **Confirmed:** Clear, unambiguous buffer overflow (e.g. `gets()` which has no bounds check parameter, or `strcpy(buf, "OVERSIZED...")` where literal length exceeds declared array capacity).
2. **Potential:** Functions like `strcpy(dest, src)` or `strcat()` where destination capacity is fixed but source string length depends on runtime inputs.
3. **Safe Operation:** Operations where literal size or capacity is verified to fit safely (e.g. `strcpy(dest, "HI")` into a 10-byte buffer).
4. **Insufficient Evidence:** Unresolved pointer dereferences or external library calls.

### Scanner Limitations
Static analysis without full symbolic execution cannot prove the absence of vulnerabilities in complex pointer aliases or dynamic heap calculations. The scanner explicitly notes this to students to reinforce that static analysis complements, but does not replace, fuzzing, AddressSanitizer, and defensive coding.
