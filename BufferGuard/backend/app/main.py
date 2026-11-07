import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database.session import engine, Base, SessionLocal
from backend.app.models.scan import Scan, Vulnerability
from backend.app.models.simulation import Simulation
from backend.app.services.scanner import CCodeScanner
from backend.app.services.simulator import BufferSimulator
from backend.app.api import (
    dashboard, scanner, simulator, playground, reports, analytics, learning
)

# Initialize Database Schema
Base.metadata.create_all(bind=engine)

def seed_initial_demo_data():
    db = SessionLocal()
    try:
        scan_count = db.query(Scan).count()
        if scan_count == 0:
            # Seed 1: classic vulnerable code
            vuln_sample = """#include <stdio.h>
#include <string.h>

void process_input(void) {
    char password[8];
    printf("Enter password: ");
    gets(password); /* CRITICAL VULNERABILITY */
}

int main(void) {
    process_input();
    return 0;
}
"""
            findings, score = CCodeScanner.analyze_source(vuln_sample, "auth_demo.c")
            s1 = Scan(
                filename="auth_demo.c",
                source_hash=CCodeScanner.calculate_hash(vuln_sample),
                status="COMPLETED",
                total_findings=len(findings),
                security_score=score,
                code_content=vuln_sample
            )
            db.add(s1)
            db.flush()

            for f in findings:
                v = Vulnerability(
                    scan_id=s1.id,
                    vulnerability_type=f["vulnerability_type"],
                    severity=f["severity"],
                    confidence=f["confidence"],
                    line_number=f["line_number"],
                    code_snippet=f["code_snippet"],
                    description=f["description"],
                    possible_consequences=f["possible_consequences"],
                    recommendation=f["recommendation"],
                    safer_code=f["safer_code"],
                    cwe_id=f["cwe_id"]
                )
                db.add(v)

            # Seed 2: safe bounded code
            safe_sample = """#include <stdio.h>
#include <string.h>

#define BUF_LEN 16

int main(void) {
    char buffer[BUF_LEN];
    printf("Enter string: ");
    if (fgets(buffer, sizeof(buffer), stdin) != NULL) {
        buffer[strcspn(buffer, "\\r\\n")] = '\\0';
        printf("Safe input: %s\\n", buffer);
    }
    return 0;
}
"""
            safe_findings, safe_score = CCodeScanner.analyze_source(safe_sample, "safe_input.c")
            s2 = Scan(
                filename="safe_input.c",
                source_hash=CCodeScanner.calculate_hash(safe_sample),
                status="COMPLETED",
                total_findings=len(safe_findings),
                security_score=safe_score,
                code_content=safe_sample
            )
            db.add(s2)

            # Seed a couple of simulation records
            sim1 = Simulation(
                buffer_size=10,
                input_length=5,
                input_text="HELLO",
                simulation_mode="SAFE",
                result="SAFE_BOUNDED",
                is_overflow=False,
                excess_bytes=0
            )
            sim2 = Simulation(
                buffer_size=10,
                input_length=13,
                input_text="CYBERSECURITY",
                simulation_mode="UNSAFE_CONCEPTUAL",
                result="OVERFLOW_DETECTED",
                is_overflow=True,
                excess_bytes=4
            )
            db.add(sim1)
            db.add(sim2)

            db.commit()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_initial_demo_data()
    yield

app = FastAPI(
    title="BufferGuard – Buffer Overflow Detection, Simulation & Prevention System",
    description="REST backend for C memory safety analysis, educational simulations, and defense mechanisms.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(dashboard.router)
app.include_router(scanner.router)
app.include_router(simulator.router)
app.include_router(playground.router)
app.include_router(reports.router)
app.include_router(analytics.router)
app.include_router(learning.router)

@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "system": "BufferGuard Core Engine",
        "version": "1.0.0",
        "database": "SQLite connected"
    }
