import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.scan import Scan, Vulnerability
from backend.app.schemas.scan import ScanRequest, ScanResponse, ScanSummaryItem
from backend.app.services.scanner import CCodeScanner

router = APIRouter(prefix="/api/scanner", tags=["Scanner"])

SAMPLE_PROGRAMS = {
    "classic_overflow": {
        "title": "Classic Buffer Overflow (gets)",
        "filename": "classic_gets_overflow.c",
        "code": """#include <stdio.h>
#include <string.h>

void authenticate_user(void) {
    char password[8];
    int is_admin = 0;

    printf("Enter authorization code: ");
    /* DANGEROUS: gets() has no boundary checks */
    gets(password);

    if (strcmp(password, "SECRET") == 0) {
        is_admin = 1;
    }

    if (is_admin != 0) {
        printf("[+] ACCESS GRANTED: Administrative privileges unlocked.\\n");
    } else {
        printf("[-] ACCESS DENIED.\\n");
    }
}

int main(void) {
    authenticate_user();
    return 0;
}
"""
    },
    "strcpy_unbounded": {
        "title": "Unbounded String Copy (strcpy)",
        "filename": "strcpy_overflow.c",
        "code": """#include <stdio.h>
#include <string.h>

void process_message(const char *msg) {
    char local_buf[16];
    /* VULNERABLE: strcpy without destination bounds validation */
    strcpy(local_buf, msg);
    printf("Processed: %s\\n", local_buf);
}

int main(int argc, char *argv[]) {
    char input[128];
    /* Unbounded scanf */
    scanf("%s", input);
    process_message(input);
    return 0;
}
"""
    },
    "off_by_one": {
        "title": "Off-by-One Loop Boundary",
        "filename": "off_by_one_buffer.c",
        "code": """#include <stdio.h>

#define BUFFER_LEN 10

void populate_buffer(void) {
    char buffer[BUFFER_LEN];

    /* OFF-BY-ONE: i <= BUFFER_LEN writes at index 10, out of bounds */
    for (int i = 0; i <= BUFFER_LEN; i++) {
        buffer[i] = 'X';
    }
}

int main(void) {
    populate_buffer();
    return 0;
}
"""
    },
    "secure_bounded": {
        "title": "Defensive Secure C Implementation",
        "filename": "secure_implementation.c",
        "code": """#include <stdio.h>
#include <string.h>

#define MAX_NAME_LEN 32

void handle_safe_input(void) {
    char username[MAX_NAME_LEN];
    printf("Enter username: ");

    /* SAFE: fgets guarantees boundary limit and null termination */
    if (fgets(username, sizeof(username), stdin) != NULL) {
        /* Strip trailing newline character */
        username[strcspn(username, "\\r\\n")] = '\\0';
        printf("[+] Welcome, %s\\n", username);
    }
}

int main(void) {
    handle_safe_input();
    return 0;
}
"""
    }
}

@router.get("/samples")
def get_sample_programs():
    return SAMPLE_PROGRAMS

@router.post("/analyze", response_model=ScanResponse)
def analyze_code(payload: ScanRequest, db: Session = Depends(get_db)):
    code = payload.code
    filename = payload.filename or "code.c"
    source_hash = CCodeScanner.calculate_hash(code)

    findings, score = CCodeScanner.analyze_source(code, filename)

    scan = Scan(
        filename=filename,
        source_hash=source_hash,
        status="COMPLETED",
        total_findings=len(findings),
        security_score=score,
        code_content=code
    )
    db.add(scan)
    db.flush()

    for item in findings:
        vuln = Vulnerability(
            scan_id=scan.id,
            vulnerability_type=item["vulnerability_type"],
            severity=item["severity"],
            confidence=item["confidence"],
            line_number=item["line_number"],
            code_snippet=item.get("code_snippet"),
            description=item["description"],
            possible_consequences=item.get("possible_consequences"),
            recommendation=item["recommendation"],
            safer_code=item.get("safer_code"),
            cwe_id=item["cwe_id"]
        )
        db.add(vuln)

    db.commit()
    db.refresh(scan)
    return scan

@router.post("/upload", response_model=ScanResponse)
async def upload_code_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Validate extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".c", ".h", ".cpp", ".txt"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: .c, .h, .cpp")

    # Read contents with size limit (max 500KB)
    content_bytes = await file.read(500 * 1024)
    try:
        code_text = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Uploaded file is not valid UTF-8 text.")

    payload = ScanRequest(filename=file.filename, code=code_text)
    return analyze_code(payload, db)

@router.get("/history", response_model=List[ScanSummaryItem])
def get_scan_history(limit: int = 50, db: Session = Depends(get_db)):
    scans = db.query(Scan).order_by(Scan.scan_timestamp.desc()).limit(limit).all()
    return scans

@router.get("/results/{scan_id}", response_model=ScanResponse)
def get_scan_result(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan result not found.")
    return scan
