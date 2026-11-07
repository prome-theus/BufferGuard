#ifndef SAFE_STR_H
#define SAFE_STR_H

#include <stddef.h>
#include <stdio.h>
#include <stdbool.h>

/**
 * BufferGuard Safe String Library (C11 Standard)
 * Provides boundary-checked, null-termination guaranteed string operations
 * to eliminate CWE-120, CWE-121, CWE-122, and CWE-193 vulnerabilities.
 */

typedef enum {
    SAFE_STR_OK = 0,
    SAFE_STR_TRUNCATED = 1,
    SAFE_STR_NULL_PTR = -1,
    SAFE_STR_ZERO_SIZE = -2,
    SAFE_STR_BUFFER_OVERFLOW = -3
} SafeStrStatus;

/**
 * Copies up to dest_size - 1 bytes from src to dest.
 * Guarantees null-termination unless dest_size is 0.
 * Returns SAFE_STR_TRUNCATED if source was longer than available space.
 */
SafeStrStatus safe_strcpy(char *dest, size_t dest_size, const char *src);

/**
 * Concatenates src to the existing string in dest.
 * Enforces that final total length does not exceed dest_size - 1.
 * Guarantees null-termination.
 */
SafeStrStatus safe_strcat(char *dest, size_t dest_size, const char *src);

/**
 * Safely reads a line from stream into dest.
 * Reads at most dest_size - 1 characters.
 * Removes trailing newline and ensures null-termination.
 */
SafeStrStatus safe_readline(char *dest, size_t dest_size, FILE *stream);

/**
 * Validates whether an index falls within [0, capacity - 1].
 */
bool safe_check_bounds(size_t index, size_t capacity);

#endif /* SAFE_STR_H */
