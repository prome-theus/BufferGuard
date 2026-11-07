# BufferGuard – System Architecture & Technical Design

## 1. System Overview

**BufferGuard** is an interactive cybersecurity research, simulation, and prevention platform engineered to illustrate how buffer overflows occur in the C programming language, how they impact low-level computer memory, and how software engineers can systematically detect and prevent them.

The system decouples presentation, static analysis orchestration, and low-level C compilation into three cooperating layers:

```mermaid
graph TD
    User([Security Analyst / Student]) -->|HTTPS / REST| Frontend[React 18 + Vite + Tailwind Frontend]
    Frontend -->|Monaco C Editor| Monaco[Monaco Code Editor]
    Frontend -->|Memory Grid Visualizer| Visualizer[Interactive Byte Matrix]
    Frontend -->|Axios REST Client| Backend[FastAPI Backend Engine]

    subgraph Backend Core
        Backend --> Router[REST API Routers]
        Router --> Scanner[CCodeScanner Engine]
        Router --> Simulator[BufferSimulator Engine]
        Router --> Sandbox[SandboxManager]
        Router --> DB[(SQLite Database / SQLAlchemy)]
        Router --> Reporter[ReportGenerator PDF/JSON/CSV]
    end

    subgraph C11 Runtime Subsystem
        Sandbox -->|Controlled Execution| GCC[MinGW GCC C11 Compiler]
        GCC --> MemoryLayout[memory_layout.exe]
        GCC --> SafeStrLib[safe_str.c / safe_str.h]
        GCC --> Examples[Approved Benchmark Binaries]
    end
```

---

## 2. Component Architecture

### 2.1 Frontend Presentation Tier
- **Framework:** React 18.3 with TypeScript and Vite 5.4.
- **Styling:** Tailwind CSS with dark-theme glassmorphism, responsive navigation drawer, and custom status pills.
- **Editor:** Integrated Monaco Editor with C language syntax highlighting, line jump indicators, and live editing.
- **Visuals:** Animated memory cell grid (`MemoryGrid.tsx`) with byte hex offsets, boundary markers, and out-of-bounds corruption highlights.
- **Telemetry:** Recharts data visualizations showing security score trends, CWE frequency, and safe vs. vulnerable program ratios.

### 2.2 Backend Orchestration Tier
- **Framework:** Python 3.13 with FastAPI.
- **Persistence:** SQLite 3 with SQLAlchemy ORM (models: `Scan`, `Vulnerability`, `Simulation`, `Report`, `LearningProgress`).
- **Static Analysis Engine (`CCodeScanner`):** Context-aware lexical scanner identifying dangerous calls (`gets`, `strcpy`, `strcat`, `sprintf`, `%s` in `scanf`), array out-of-bounds indices, and loop off-by-one errors (`<= SIZE`).
- **Simulation Engine (`BufferSimulator`):** Simulates byte write operations into bounded memory arrays, models null terminator behavior (`\0`), and computes exact excess corruption bytes.
- **Security Sandbox (`SandboxManager`):** Enforces host machine isolation by rejecting arbitrary user code execution while enabling safe syntax verification (`-fsyntax-only`) and running strictly pre-approved educational benchmarks.

### 2.3 C11 Core Engine Tier
- **Language Standard:** ISO C11 (`-std=c11`).
- **Safe String Library (`safe_str.c`):** Provides safe replacements for standard C string operations:
  - `safe_strcpy()`: Bounds-enforced copy with guaranteed null termination.
  - `safe_strcat()`: Capacity-aware string concatenation.
  - `safe_readline()`: Safe stream input reading replacing `gets()` and `scanf("%s")`.
  - `safe_check_bounds()`: Array index validation.
- **Low-Level Memory Inspector (`memory_layout.c`):** Direct process inspection dumping addresses for text, data, bss, heap, and stack segments, frame pointers, and canary sentinels in JSON format.

---

## 3. Data Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Student
    participant UI as Frontend (React)
    participant API as FastAPI Backend
    participant Scanner as CCodeScanner Engine
    participant DB as SQLite DB
    participant C as C11 Runtime

    User->>UI: Input C Code or Load Benchmark
    UI->>API: POST /api/scanner/analyze {filename, code}
    API->>Scanner: analyze_source(code, filename)
    Scanner-->>API: Findings list + Security Score (0-100)
    API->>DB: Persist Scan and Vulnerability records
    API-->>UI: Return ScanResponse JSON
    UI-->>User: Display Vulnerability Cards, CWE Badges, and Line Markers

    User->>UI: Run Buffer Simulation (Input: "CYBERSECURITY", Cap: 10B)
    UI->>API: POST /api/simulator/run {buffer_size: 10, input_text: "..."}
    API-->>UI: Return MemoryCell grid with 4 excess overflow bytes
    UI-->>User: Animate memory grid with Red Corruption Cells
```

---

## 4. Database Entity-Relationship (ER) Schema

```mermaid
erDiagram
    SCANS ||--o{ VULNERABILITIES : contains
    SCANS ||--o{ REPORTS : generates
    
    SCANS {
        int id PK
        string filename
        string source_hash
        datetime scan_timestamp
        string status
        int total_findings
        float security_score
        text code_content
    }

    VULNERABILITIES {
        int id PK
        int scan_id FK
        string vulnerability_type
        string severity
        string confidence
        int line_number
        text code_snippet
        text description
        text possible_consequences
        text recommendation
        text safer_code
        string cwe_id
    }

    SIMULATIONS {
        int id PK
        int buffer_size
        int input_length
        string input_text
        string simulation_mode
        string result
        boolean is_overflow
        int excess_bytes
        datetime created_at
    }

    REPORTS {
        int id PK
        int scan_id FK
        string report_type
        datetime generated_at
        string file_path
    }

    LEARNING_PROGRESS {
        int id PK
        string topic_id
        string topic_title
        boolean completion_status
        int quiz_score
        datetime updated_at
    }
```
