import pytest
from backend.app.main import health_check
from backend.app.database.session import SessionLocal
from backend.app.api.dashboard import get_dashboard_summary, get_recent_activity
from backend.app.api.scanner import analyze_code, get_scan_result, get_scan_history, ScanRequest
from backend.app.api.simulator import run_simulation, get_simulation_presets, SimulationRequest
from backend.app.api.playground import list_playground_examples, compile_code_syntax, run_approved_example, CompileRequest, RunApprovedRequest
from backend.app.api.reports import generate_report, list_reports
from backend.app.schemas.report import ReportCreate
from backend.app.api.analytics import get_analytics_overview, get_analytics_trends
from backend.app.api.learning import get_all_topics, get_topic_detail, update_progress
from backend.app.schemas.learning import ProgressUpdate

@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_health_endpoint():
    res = health_check()
    assert res["status"] == "healthy"
    assert "BufferGuard" in res["system"]

def test_dashboard_endpoints(db):
    summary = get_dashboard_summary(db)
    assert "total_scans" in summary
    assert "overall_security_score" in summary
    assert summary["total_scans"] >= 1

    activity = get_recent_activity(db)
    assert "recent_scans" in activity
    assert "recent_simulations" in activity

def test_scanner_analyze_and_retrieve(db):
    code = """
    #include <stdio.h>
    int main() {
        char b[4];
        gets(b);
        return 0;
    }
    """
    req = ScanRequest(filename="api_test.c", code=code)
    res = analyze_code(req, db)
    scan_id = res.id
    assert res.total_findings >= 1
    assert res.security_score < 100

    detail = get_scan_result(scan_id, db)
    assert detail.id == scan_id
    assert len(detail.vulnerabilities) >= 1

    scans = get_scan_history(50, db)
    assert len(scans) >= 1

def test_simulator_endpoints(db):
    examples = get_simulation_presets()
    assert len(examples) >= 2

    req = SimulationRequest(buffer_size=12, input_text="SECURE", simulation_mode="SAFE")
    res = run_simulation(req, db)
    assert res.buffer_size == 12
    assert not res.is_overflow
    assert res.result == "SAFE_BOUNDED"

def test_playground_endpoints():
    examples = list_playground_examples()
    assert len(examples) >= 4

    # Syntax compile check
    compile_req = CompileRequest(code="int main() { return 0; }")
    comp_res = compile_code_syntax(compile_req)
    assert comp_res["is_syntax_valid"] is True

    # Run approved
    run_req = RunApprovedRequest(example_id="stack_overflow_safe")
    run_res = run_approved_example(run_req)
    assert run_res["success"] is True

def test_reports_and_analytics(db):
    overview = get_analytics_overview(db)
    assert "scans_comparison" in overview
    assert "severity_distribution" in overview

    trends = get_analytics_trends(db)
    assert isinstance(trends, list)
    assert len(trends) >= 1

    scans = get_scan_history(50, db)
    if scans:
        report_req = ReportCreate(scan_id=scans[0].id, report_type="JSON")
        rep_res = generate_report(report_req, db)
        assert rep_res.id is not None
        assert rep_res.report_type == "JSON"

def test_learning_endpoints(db):
    topics = get_all_topics(db)
    assert len(topics) >= 5

    topic_id = topics[0]["id"]
    detail = get_topic_detail(topic_id, db)
    assert detail["title"] is not None

    prog_update = ProgressUpdate(topic_id=topic_id, completion_status=True, quiz_score=100)
    res = update_progress(prog_update, db)
    assert res["success"] is True
    assert res["completed"] is True
