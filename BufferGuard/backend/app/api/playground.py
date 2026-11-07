from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.app.security.sandbox import SandboxManager, APPROVED_EXAMPLES

router = APIRouter(prefix="/api/playground", tags=["Playground"])

class CompileRequest(BaseModel):
    code: str = Field(..., max_length=100000)

class RunApprovedRequest(BaseModel):
    example_id: str

@router.get("/examples")
def list_playground_examples():
    return [
        {
            "id": k,
            "title": v["title"],
            "filename": v["filename"],
            "description": v["description"],
            "is_safe": v["is_safe"],
            "code": v["code"],
            "input_payload": v.get("input_payload", ""),
            "expected_result": v.get("expected_result", "")
        }
        for k, v in APPROVED_EXAMPLES.items()
    ]

@router.post("/compile")
def compile_code_syntax(payload: CompileRequest):
    return SandboxManager.compile_code(payload.code)

@router.post("/run-approved")
def run_approved_example(payload: RunApprovedRequest):
    result = SandboxManager.run_approved_example(payload.example_id)
    return result

@router.post("/run")
def run_arbitrary_code(payload: CompileRequest):
    # Enforces the security sandbox policy: arbitrary code execution on backend host is restricted
    return {
        "success": False,
        "is_sandboxed": True,
        "error": "Arbitrary C code execution is disabled on host for security.",
        "security_policy": (
            "BufferGuard enforces strict host isolation. Only pre-approved educational examples "
            "can be executed in the playground runner. Arbitrary source code can be checked for syntax "
            "and statically audited using the C Code Vulnerability Scanner."
        )
    }
