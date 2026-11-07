from typing import List, Dict, Any
from backend.app.schemas.simulation import MemoryCell, SimulationResponse

class BufferSimulator:
    """
    Interactive Educational Buffer Overflow Simulator.
    Accurately models memory cell allocations, string null-termination requirements,
    safe bounded execution, and conceptual unbounded overflow writes.
    """

    BASE_ADDRESS = 0x7FFE0010

    @classmethod
    def simulate(cls, buffer_size: int, input_text: str, mode: str = "SAFE") -> SimulationResponse:
        input_len = len(input_text)
        required_bytes = input_len + 1 # +1 byte for null terminator '\0'
        is_overflow = required_bytes > buffer_size
        excess_bytes = max(0, required_bytes - buffer_size)
        mode_upper = mode.upper()

        cells: List[MemoryCell] = []

        if mode_upper == "SAFE":
            # SAFE MODE: Enforce bounds checking like snprintf(buf, buffer_size, "%s", input)
            # Maximum characters copied is buffer_size - 1, leaving room for '\0'
            max_chars = max(0, buffer_size - 1)
            copied_chars = input_text[:max_chars]

            for i in range(buffer_size):
                offset_hex = f"0x{cls.BASE_ADDRESS + i:08X}"
                if i < len(copied_chars):
                    c = copied_chars[i]
                    cells.append(MemoryCell(
                        index=i,
                        char=c,
                        byte_hex=f"0x{ord(c):02X}",
                        is_in_bounds=True,
                        is_null_terminator=False,
                        is_overflow_attempt=False,
                        status="WRITTEN_SAFE",
                        address_offset=offset_hex
                    ))
                elif i == len(copied_chars):
                    # Null terminator placed safely at boundary
                    cells.append(MemoryCell(
                        index=i,
                        char="\\0",
                        byte_hex="0x00",
                        is_in_bounds=True,
                        is_null_terminator=True,
                        is_overflow_attempt=False,
                        status="NULL_TERMINATOR",
                        address_offset=offset_hex
                    ))
                else:
                    # Unused remainder of buffer
                    cells.append(MemoryCell(
                        index=i,
                        char=None,
                        byte_hex="0x00",
                        is_in_bounds=True,
                        is_null_terminator=False,
                        is_overflow_attempt=False,
                        status="EMPTY",
                        address_offset=offset_hex
                    ))

            if is_overflow:
                result = "SAFE_TRUNCATED"
                explanation = (
                    f"Safe bounded mode prevented buffer overflow! Input was {input_len} characters "
                    f"(requiring {required_bytes} bytes with '\\0'), but buffer capacity is {buffer_size} bytes. "
                    f"The write was bounded to {max_chars} characters plus a guaranteed null terminator at index {max_chars}."
                )
            else:
                result = "SAFE_BOUNDED"
                explanation = (
                    f"Safe write completed successfully. Input of {input_len} characters fits comfortably "
                    f"within {buffer_size}-byte buffer along with the mandatory '\\0' null terminator at index {input_len}."
                )

            educational_note = (
                "In C, secure APIs such as snprintf() or strlcpy() guarantee that target buffers are never "
                "overwritten beyond their capacity and always preserve the terminating null character."
            )

        else:
            # UNSAFE CONCEPTUAL MODE (like unchecked gets() or strcpy())
            # Models what an unchecked write would write into memory, including cells beyond buffer_size
            total_visual_cells = max(buffer_size + excess_bytes + 2, buffer_size + 4)

            for i in range(total_visual_cells):
                offset_hex = f"0x{cls.BASE_ADDRESS + i:08X}"
                in_bounds = i < buffer_size

                if i < input_len:
                    c = input_text[i]
                    is_violation = not in_bounds
                    cells.append(MemoryCell(
                        index=i,
                        char=c,
                        byte_hex=f"0x{ord(c):02X}",
                        is_in_bounds=in_bounds,
                        is_null_terminator=False,
                        is_overflow_attempt=is_violation,
                        status="OVERFLOW_VIOLATION" if is_violation else "WRITTEN_SAFE",
                        address_offset=offset_hex
                    ))
                elif i == input_len:
                    # The null terminator byte
                    is_violation = not in_bounds
                    cells.append(MemoryCell(
                        index=i,
                        char="\\0",
                        byte_hex="0x00",
                        is_in_bounds=in_bounds,
                        is_null_terminator=True,
                        is_overflow_attempt=is_violation,
                        status="OVERFLOW_VIOLATION" if is_violation else "NULL_TERMINATOR",
                        address_offset=offset_hex
                    ))
                else:
                    # Adjacent memory cells
                    cells.append(MemoryCell(
                        index=i,
                        char=None,
                        byte_hex="0x00",
                        is_in_bounds=in_bounds,
                        is_null_terminator=False,
                        is_overflow_attempt=False,
                        status="EMPTY" if in_bounds else "ADJACENT_MEMORY",
                        address_offset=offset_hex
                    ))

            if is_overflow:
                result = "OVERFLOW_DETECTED"
                explanation = (
                    f"CRITICAL OVERFLOW: Attempted to write {required_bytes} bytes (including null terminator) into a "
                    f"{buffer_size}-byte buffer! An unchecked function (like gets or strcpy) would smash {excess_bytes} "
                    f"byte(s) past the buffer boundary into adjacent stack frames, potentially corrupting local variables, "
                    f"the frame pointer, or the saved return instruction pointer (EIP/RIP)."
                )
            else:
                result = "SAFE_BOUNDED"
                explanation = (
                    f"Input length {input_len} + 1 null terminator = {required_bytes} bytes, which fits inside "
                    f"the allocated {buffer_size} bytes. No boundary overflow occurred."
                )

            educational_note = (
                "Unchecked writes in C cause Undefined Behavior. In real programs, overflowing adjacent stack memory "
                "allows attackers to hijack control flow via return-oriented programming (ROP) or arbitrary code execution."
            )

        return SimulationResponse(
            buffer_size=buffer_size,
            input_length=input_len,
            required_bytes_with_null=required_bytes,
            simulation_mode=mode_upper,
            result=result,
            is_overflow=is_overflow,
            excess_bytes=excess_bytes,
            cells=cells,
            explanation=explanation,
            educational_note=educational_note
        )
