import pytest
from backend.app.services.simulator import BufferSimulator

def test_safe_bounded_simulation_no_overflow():
    res = BufferSimulator.simulate(buffer_size=10, input_text="HELLO", mode="SAFE")
    assert res.buffer_size == 10
    assert res.input_length == 5
    assert res.required_bytes_with_null == 6
    assert not res.is_overflow
    assert res.excess_bytes == 0
    assert res.result == "SAFE_BOUNDED"
    assert len(res.cells) == 10
    assert res.cells[5].is_null_terminator

def test_unsafe_mode_overflow_detection():
    res = BufferSimulator.simulate(buffer_size=10, input_text="CYBERSECURITY", mode="UNSAFE_CONCEPTUAL")
    assert res.buffer_size == 10
    assert res.input_length == 13
    assert res.required_bytes_with_null == 14
    assert res.is_overflow
    assert res.excess_bytes == 4
    assert res.result == "OVERFLOW_DETECTED"
    # Verify that cells beyond index 9 have is_overflow_attempt == True
    violations = [c for c in res.cells if c.is_overflow_attempt]
    assert len(violations) >= 4

def test_safe_mode_truncates_oversized_input():
    res = BufferSimulator.simulate(buffer_size=8, input_text="VERY_LONG_STRING", mode="SAFE")
    assert res.is_overflow
    assert res.result == "SAFE_TRUNCATED"
    # Should safely contain 7 chars + 1 null terminator
    assert res.cells[7].is_null_terminator
    assert res.cells[7].char == "\\0"
