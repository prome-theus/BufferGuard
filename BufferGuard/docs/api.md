# BufferGuard – REST API Specifications

The BufferGuard backend exposes modular REST endpoints documented with OpenAPI/Swagger.

Base URL: `http://localhost:8000/api`

---

## 1. System Health & Diagnostics

### `GET /api/health`
Checks backend and database operational status.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "system": "BufferGuard Core Engine",
  "version": "1.0.0",
  "database": "SQLite connected"
}
```

---

## 2. Dashboard Endpoints

### `GET /api/dashboard/summary`
Retrieves aggregated vulnerability findings, overall security score, and scan counts.

**Response (200 OK):**
```json
{
  "total_scans": 14,
  "potential_vulnerabilities": 4,
  "confirmed_vulnerabilities": 8,
  "high_risk_findings": 6,
  "safe_programs": 5,
  "total_simulations": 12,
  "overall_security_score": 84.5,
  "latest_scan_date": "2026-11-07T13:26:37.161079"
}
```

### `GET /api/dashboard/activity`
Returns the 5 most recent scans, simulations, and individual vulnerability findings.

---

## 3. Vulnerability Scanner Endpoints

### `POST /api/scanner/analyze`
Submits C source code for static lexical analysis.

**Request Body:**
```json
{
  "filename": "auth_service.c",
  "code": "#include <stdio.h>\nint main() { char b[8]; gets(b); return 0; }"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "filename": "auth_service.c",
  "source_hash": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
  "scan_timestamp": "2026-11-07T13:26:37.161079",
  "status": "COMPLETED",
  "total_findings": 1,
  "security_score": 75.0,
  "vulnerabilities": [
    {
      "id": 1,
      "scan_id": 1,
      "vulnerability_type": "Obsolete Unbounded Function (gets)",
      "severity": "Critical",
      "confidence": "Confirmed",
      "line_number": 2,
      "code_snippet": "gets(b);",
      "description": "gets() reads input from stdin until a newline without any bounds checking.",
      "possible_consequences": "Arbitrary code execution, stack smashing, crash via segmentation fault.",
      "recommendation": "Replace with fgets(buffer, sizeof(buffer), stdin) to enforce bounded reading.",
      "safer_code": "if (fgets(buffer, sizeof(buffer), stdin) == NULL) { /* handle error */ }",
      "cwe_id": "CWE-120: Buffer Copy without Checking Size of Input"
    }
  ]
}
```

### `POST /api/scanner/upload`
Uploads a `.c` or `.h` file via `multipart/form-data` with a 500KB size limit.

### `GET /api/scanner/history`
Returns historical scan summaries.

### `GET /api/scanner/results/{scan_id}`
Retrieves a specific scan result with full vulnerability findings.

### `GET /api/scanner/samples`
Returns built-in educational C benchmark programs.

---

## 4. Buffer Overflow Simulator Endpoints

### `POST /api/simulator/run`
Computes the memory grid byte layout and overflow state.

**Request Body:**
```json
{
  "buffer_size": 10,
  "input_text": "CYBERSECURITY",
  "simulation_mode": "UNSAFE_CONCEPTUAL"
}
```

**Response (200 OK):**
```json
{
  "buffer_size": 10,
  "input_text": "CYBERSECURITY",
  "input_length": 13,
  "simulation_mode": "UNSAFE_CONCEPTUAL",
  "result": "OVERFLOW_DETECTED",
  "is_overflow": true,
  "excess_bytes": 4,
  "cells": [
    {
      "index": 0,
      "char": "C",
      "byte_hex": "0x43",
      "is_occupied": true,
      "is_buffer": true,
      "is_overflow": false,
      "is_null_terminator": false,
      "address_offset": "+0B"
    }
  ],
  "explanation": "Input requires 14 bytes (13 characters + '\\0') exceeding the 10-byte buffer by 4 bytes."
}
```

### `GET /api/simulator/examples`
Returns simulation presets.

---

## 5. Playground Endpoints

### `GET /api/playground/examples`
Lists approved educational C code benchmarks.

### `POST /api/playground/compile`
Runs safe syntax checking on submitted C code via `gcc -fsyntax-only`.

### `POST /api/playground/run-approved`
Executes pre-approved educational benchmarks under a 3-second timeout limit.

---

## 6. Reports Endpoints

### `GET /api/reports`
Lists all generated audit reports.

### `POST /api/reports/generate`
Generates a downloadable `PDF`, `JSON`, or `CSV` report from scan data.

### `GET /api/reports/{report_id}/download`
Downloads the generated report file with the proper `Content-Type` header.

---

## 7. Analytics Endpoints

### `GET /api/analytics/overview`
Provides high-level metrics including CWE distribution and safe vs. vulnerable program ratios.

### `GET /api/analytics/trends`
Provides time-series data for scan scores and finding counts.

---

## 8. Learning Center Endpoints

### `GET /api/learning/topics`
Lists all 14 cybersecurity curriculum modules and completion states.

### `GET /api/learning/topics/{topic_id}`
Retrieves lesson text, diagrams, code comparisons, and quiz questions.

### `POST /api/learning/progress`
Records quiz scores and module completion status in the database.
