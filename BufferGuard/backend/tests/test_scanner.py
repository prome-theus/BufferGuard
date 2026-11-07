import pytest
from backend.app.services.scanner import CCodeScanner

def test_detect_gets_critical():
    code = """
    #include <stdio.h>
    void test() {
        char buf[8];
        gets(buf);
    }
    """
    findings, score = CCodeScanner.analyze_source(code, "test_gets.c")
    assert len(findings) == 1
    assert findings[0]["severity"] == "Critical"
    assert "gets" in findings[0]["vulnerability_type"].lower()
    assert findings[0]["confidence"] == "Confirmed"
    assert score <= 75.0

def test_detect_strcpy_literal_overflow():
    code = """
    #include <stdio.h>
    #include <string.h>
    int main() {
        char target[5];
        strcpy(target, "1234567890");
        return 0;
    }
    """
    findings, score = CCodeScanner.analyze_source(code, "test_strcpy.c")
    assert len(findings) >= 1
    assert any("overflow" in f["vulnerability_type"].lower() for f in findings)
    assert any(f["severity"] == "Critical" for f in findings)

def test_safe_program_high_score():
    code = """
    #include <stdio.h>
    #include <string.h>
    int main() {
        char buf[32];
        if (fgets(buf, sizeof(buf), stdin)) {
            buf[strcspn(buf, "\\n")] = '\\0';
            printf("%s\\n", buf);
        }
        return 0;
    }
    """
    findings, score = CCodeScanner.analyze_source(code, "safe.c")
    assert len(findings) == 0
    assert score == 100.0

def test_off_by_one_detection():
    code = """
    int main() {
        char buf[10];
        for (int i = 0; i <= 10; i++) {
            buf[i] = 'A';
        }
    }
    """
    findings, score = CCodeScanner.analyze_source(code, "off_by_one.c")
    assert any("off-by-one" in f["vulnerability_type"].lower() for f in findings)
