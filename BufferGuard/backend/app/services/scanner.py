import re
import hashlib
from typing import List, Dict, Any, Tuple

class CCodeScanner:
    """
    Advanced C Source Code Memory-Safety Static Analysis Engine.
    Conservative heuristic & context-aware regex analysis to identify
    potential and confirmed buffer overflow vulnerabilities.
    """

    # CWE Definitions
    CWE_120 = "CWE-120: Buffer Copy without Checking Size of Input"
    CWE_121 = "CWE-121: Stack-based Buffer Overflow"
    CWE_122 = "CWE-122: Heap-based Buffer Overflow"
    CWE_193 = "CWE-193: Off-by-one Error"
    CWE_676 = "CWE-676: Use of Potentially Dangerous Function"
    CWE_787 = "CWE-787: Out-of-bounds Write"

    @classmethod
    def calculate_hash(cls, code: str) -> str:
        return hashlib.sha256(code.encode("utf-8")).hexdigest()

    @classmethod
    def analyze_source(cls, code: str, filename: str = "source.c") -> Tuple[List[Dict[str, Any]], float]:
        lines = code.split("\n")
        findings: List[Dict[str, Any]] = []

        # Track declared stack arrays and their declared sizes: name -> size
        declared_buffers: Dict[str, int] = {}
        buffer_decl_pattern = re.compile(r'\b(char|uint8_t|int8_t)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\[\s*([0-9]+)\s*\]')
        
        # Track malloc calls: ptr -> size_expr
        malloc_pattern = re.compile(r'\b([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:\([a-zA-Z0-9_*\s]+\))?\s*malloc\s*\(([^)]+)\)')

        for idx, line in enumerate(lines):
            # Strip comments for declaration checks
            clean_line = re.sub(r'//.*$', '', line)
            clean_line = re.sub(r'/\*.*?\*/', '', clean_line)

            for match in buffer_decl_pattern.finditer(clean_line):
                buf_name = match.group(2)
                buf_size = int(match.group(3))
                declared_buffers[buf_name] = buf_size

        # Analyze line by line with context
        for line_idx, line in enumerate(lines, start=1):
            stripped = line.strip()
            # Ignore single line comment lines
            if stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
                continue

            # 1. gets() -> Always Confirmed Critical (CWE-120 / CWE-676)
            if re.search(r'\bgets\s*\(', line):
                findings.append({
                    "vulnerability_type": "Obsolete Unbounded Function (gets)",
                    "severity": "Critical",
                    "confidence": "Confirmed",
                    "line_number": line_idx,
                    "code_snippet": line.strip(),
                    "description": "gets() reads input from stdin until a newline or EOF without any bounds checking.",
                    "possible_consequences": "Arbitrary code execution, stack smashing, crash via segmentation fault.",
                    "recommendation": "Replace with fgets(buffer, sizeof(buffer), stdin) to enforce bounded reading.",
                    "safer_code": "if (fgets(buffer, sizeof(buffer), stdin) == NULL) { /* handle error */ }",
                    "cwe_id": cls.CWE_120
                })

            # 2. strcpy() analysis
            strcpy_match = re.search(r'\bstrcpy\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*,\s*([^)]+)\)', line)
            if strcpy_match:
                dest = strcpy_match.group(1)
                src = strcpy_match.group(2).strip()

                # Check if src is a constant string literal
                literal_match = re.match(r'^"([^"]*)"$', src)
                if literal_match and dest in declared_buffers:
                    literal_len = len(literal_match.group(1)) + 1 # +1 for null terminator
                    buf_cap = declared_buffers[dest]
                    if literal_len > buf_cap:
                        findings.append({
                            "vulnerability_type": "Confirmed Stack Buffer Overflow (strcpy literal overflow)",
                            "severity": "Critical",
                            "confidence": "Confirmed",
                            "line_number": line_idx,
                            "code_snippet": line.strip(),
                            "description": f"strcpy writes literal of {literal_len} bytes into buffer '{dest}' of capacity {buf_cap}.",
                            "possible_consequences": "Immediate stack memory corruption, return address overwrite.",
                            "recommendation": f"Expand buffer capacity to at least {literal_len} or use strncpy/snprintf.",
                            "safer_code": f"snprintf({dest}, sizeof({dest}), \"%s\", {src});",
                            "cwe_id": cls.CWE_121
                        })
                    else:
                        findings.append({
                            "vulnerability_type": "Safe Bounded Constant Copy (strcpy)",
                            "severity": "Informational",
                            "confidence": "Safe operation",
                            "line_number": line_idx,
                            "code_snippet": line.strip(),
                            "description": f"strcpy copies a literal of {literal_len} bytes which securely fits in '{dest}' ({buf_cap} bytes).",
                            "possible_consequences": "None under current constant length, though defensive APIs remain best practice.",
                            "recommendation": f"For defensive coding, prefer snprintf({dest}, sizeof({dest}), \"%s\", ...);",
                            "safer_code": f"snprintf({dest}, sizeof({dest}), \"%s\", {src});",
                            "cwe_id": cls.CWE_120
                        })
                else:
                    # Variable src -> Potential or High vulnerability
                    findings.append({
                        "vulnerability_type": "Unbounded String Copy (strcpy)",
                        "severity": "High",
                        "confidence": "Potential",
                        "line_number": line_idx,
                        "code_snippet": line.strip(),
                        "description": f"strcpy copies from '{src}' into '{dest}' without verifying target capacity.",
                        "possible_consequences": "If source exceeds destination capacity, heap or stack memory will be corrupted.",
                        "recommendation": f"Use snprintf({dest}, sizeof({dest}), \"%s\", {src}) with explicit null-termination guarantee.",
                        "safer_code": f"snprintf({dest}, sizeof({dest}), \"%s\", {src});",
                        "cwe_id": cls.CWE_120
                    })

            # 3. strcat() analysis
            strcat_match = re.search(r'\bstrcat\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*,\s*([^)]+)\)', line)
            if strcat_match:
                dest = strcat_match.group(1)
                src = strcat_match.group(2).strip()
                findings.append({
                    "vulnerability_type": "Unbounded String Concatenation (strcat)",
                    "severity": "High",
                    "confidence": "Potential",
                    "line_number": line_idx,
                    "code_snippet": line.strip(),
                    "description": f"strcat appends '{src}' to '{dest}' without checking if combined length fits destination buffer.",
                    "possible_consequences": "Buffer overflow over target array, stack smashing or heap header corruption.",
                    "recommendation": f"Use snprintf with offset tracking or strncat with exact remaining space calculation.",
                    "safer_code": f"size_t cur_len = strlen({dest}); if (cur_len < sizeof({dest})) {{ strncat({dest}, {src}, sizeof({dest}) - cur_len - 1); }}",
                    "cwe_id": cls.CWE_120
                })

            # 4. sprintf() analysis
            sprintf_match = re.search(r'\bsprintf\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*,', line)
            if sprintf_match:
                dest = sprintf_match.group(1)
                findings.append({
                    "vulnerability_type": "Unsafe Formatted Output (sprintf)",
                    "severity": "High",
                    "confidence": "Potential",
                    "line_number": line_idx,
                    "code_snippet": line.strip(),
                    "description": f"sprintf formats data into '{dest}' without capacity limit enforcement.",
                    "possible_consequences": "Buffer overflow if arguments format to more bytes than destination capacity.",
                    "recommendation": f"Replace sprintf with snprintf({dest}, sizeof({dest}), ...).",
                    "safer_code": f"snprintf({dest}, sizeof({dest}), ...);",
                    "cwe_id": cls.CWE_120
                })

            # 5. scanf unbounded %s
            if re.search(r'\b(?:scanf|sscanf|fscanf)\s*\([^,]+,\s*"[^"]*%s[^"]*"', line):
                findings.append({
                    "vulnerability_type": "Unbounded Input Format Specifier (%s in scanf)",
                    "severity": "Critical",
                    "confidence": "Confirmed",
                    "line_number": line_idx,
                    "code_snippet": line.strip(),
                    "description": "scanf with '%s' reads arbitrarily long tokens into the destination buffer without boundary enforcement.",
                    "possible_consequences": "Direct stack overflow upon input exceeding buffer size.",
                    "recommendation": "Specify maximum field width matching buffer size minus one, e.g., '%31s' for a 32-byte buffer.",
                    "safer_code": 'scanf("%31s", buffer); /* for char buffer[32] */',
                    "cwe_id": cls.CWE_120
                })

            # 6. memcpy with sizeof destination pointer vs buffer
            memcpy_match = re.search(r'\bmemcpy\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\)', line)
            if memcpy_match:
                dest_arg = memcpy_match.group(1).strip()
                size_arg = memcpy_match.group(3).strip()
                # Check for sizeof(pointer) mistake
                if re.match(r'sizeof\s*\(\s*(?:char\*|void\*|int\*|[a-zA-Z_][a-zA-Z0-9_]*_t\*)\s*\)', size_arg):
                    findings.append({
                        "vulnerability_type": "Suspicious Size Argument (sizeof pointer in memcpy)",
                        "severity": "Medium",
                        "confidence": "Potential",
                        "line_number": line_idx,
                        "code_snippet": line.strip(),
                        "description": f"memcpy uses sizeof(pointer) ({size_arg}) instead of buffer byte capacity or element count.",
                        "possible_consequences": "Under-copying data (4 or 8 bytes) or buffer misalignment.",
                        "recommendation": "Pass exact payload length or sizeof(target_array) rather than pointer type size.",
                        "safer_code": f"memcpy({dest_arg}, src, sizeof(destination_array));",
                        "cwe_id": cls.CWE_787
                    })

            # 7. Off-by-one errors in loops (e.g., for (int i = 0; i <= SIZE; i++))
            off_by_one = re.search(r'for\s*\([^;]*;\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*<=\s*([a-zA-Z0-9_]+)\s*;', line)
            if off_by_one:
                idx_var = off_by_one.group(1)
                bound_var = off_by_one.group(2)
                # Check if bound matches a declared buffer size
                matched_buf = [b for b, sz in declared_buffers.items() if str(sz) == bound_var or b.upper() + "_SIZE" == bound_var]
                findings.append({
                    "vulnerability_type": "Potential Off-by-One Loop Boundary (<=)",
                    "severity": "Medium",
                    "confidence": "Potential",
                    "line_number": line_idx,
                    "code_snippet": line.strip(),
                    "description": f"Loop uses '<= {bound_var}' instead of '< {bound_var}'. In 0-indexed C arrays of size N, valid indices are 0 to N-1.",
                    "possible_consequences": "Single-byte out-of-bounds write or read (poisoning frame pointer, adjacent byte, or ASan guard zone).",
                    "recommendation": f"Change loop condition from '{idx_var} <= {bound_var}' to '{idx_var} < {bound_var}'.",
                    "safer_code": f"for (int {idx_var} = 0; {idx_var} < {bound_var}; {idx_var}++)",
                    "cwe_id": cls.CWE_193
                })

            # 8. Fixed array out-of-bounds constant indexing
            idx_match = re.search(r'([a-zA-Z_][a-zA-Z0-9_]*)\[\s*([0-9]+)\s*\]', line)
            if idx_match and not re.search(r'\b(char|int|float|double|uint8_t)\s+', line): # not a declaration
                arr_name = idx_match.group(1)
                used_idx = int(idx_match.group(2))
                if arr_name in declared_buffers:
                    cap = declared_buffers[arr_name]
                    if used_idx >= cap:
                        findings.append({
                            "vulnerability_type": "Direct Out-of-Bounds Array Indexing",
                            "severity": "Critical",
                            "confidence": "Confirmed",
                            "line_number": line_idx,
                            "code_snippet": line.strip(),
                            "description": f"Index [{used_idx}] exceeds declared capacity of '{arr_name}' ({cap} elements). Valid indices: 0 to {cap-1}.",
                            "possible_consequences": "Memory corruption of adjacent variables or crash via SIGSEGV.",
                            "recommendation": f"Ensure index is strictly within range [0, {cap-1}].",
                            "safer_code": f"if (index < {cap}) {{ {arr_name}[index] = ...; }}",
                            "cwe_id": cls.CWE_787
                        })

        # Calculate Security Score
        # Start at 100
        # Critical: -25 each
        # High: -15 each
        # Medium: -8 each
        # Low: -3 each
        # Informational: 0
        penalties = {
            "Critical": 25.0,
            "High": 15.0,
            "Medium": 8.0,
            "Low": 3.0,
            "Informational": 0.0
        }

        total_penalty = 0.0
        for f in findings:
            if f["confidence"] != "Safe operation":
                total_penalty += penalties.get(f["severity"], 5.0)

        security_score = max(0.0, round(100.0 - total_penalty, 1))

        return findings, security_score
