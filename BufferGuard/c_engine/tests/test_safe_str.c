#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include "../safe_functions/safe_str.h"

static int g_tests_run = 0;
static int g_tests_passed = 0;

#define TEST_ASSERT(cond, msg) do { \
    g_tests_run++; \
    if (cond) { \
        g_tests_passed++; \
        printf("  [PASS] %s\n", msg); \
    } else { \
        printf("  [FAIL] %s (Line %d)\n", msg, __LINE__); \
    } \
} while(0)

void test_safe_strcpy(void) {
    printf("[*] Testing safe_strcpy()...\n");
    char dest[10];
    SafeStrStatus st;

    /* 1. NULL pointer check */
    st = safe_strcpy(NULL, 10, "Hello");
    TEST_ASSERT(st == SAFE_STR_NULL_PTR, "safe_strcpy handles NULL dest");

    st = safe_strcpy(dest, 10, NULL);
    TEST_ASSERT(st == SAFE_STR_NULL_PTR, "safe_strcpy handles NULL src");

    /* 2. Zero size check */
    st = safe_strcpy(dest, 0, "Hello");
    TEST_ASSERT(st == SAFE_STR_ZERO_SIZE, "safe_strcpy handles zero size");

    /* 3. Normal fitting copy */
    st = safe_strcpy(dest, sizeof(dest), "HELLO");
    TEST_ASSERT(st == SAFE_STR_OK, "safe_strcpy normal copy returns OK");
    TEST_ASSERT(strcmp(dest, "HELLO") == 0, "safe_strcpy copies correct string");
    TEST_ASSERT(dest[5] == '\0', "safe_strcpy guarantees null terminator");

    /* 4. Truncating oversized copy */
    st = safe_strcpy(dest, sizeof(dest), "VERY_LONG_STRING_OVERFLOW");
    TEST_ASSERT(st == SAFE_STR_TRUNCATED, "safe_strcpy detects overflow and truncates");
    TEST_ASSERT(strlen(dest) == sizeof(dest) - 1, "safe_strcpy limits to size - 1");
    TEST_ASSERT(dest[sizeof(dest) - 1] == '\0', "safe_strcpy null-terminates on truncation");
    TEST_ASSERT(strncmp(dest, "VERY_LONG", 9) == 0, "safe_strcpy preserves prefix");
}

void test_safe_strcat(void) {
    printf("[*] Testing safe_strcat()...\n");
    char dest[16];
    SafeStrStatus st;

    safe_strcpy(dest, sizeof(dest), "SECURE");
    st = safe_strcat(dest, sizeof(dest), "_APP");
    TEST_ASSERT(st == SAFE_STR_OK, "safe_strcat normal append returns OK");
    TEST_ASSERT(strcmp(dest, "SECURE_APP") == 0, "safe_strcat content matches");

    /* Truncation on cat */
    st = safe_strcat(dest, sizeof(dest), "_EXCEEDS_MAX_CAPACITY_LIMIT");
    TEST_ASSERT(st == SAFE_STR_TRUNCATED, "safe_strcat flags truncation on overflow");
    TEST_ASSERT(strlen(dest) == sizeof(dest) - 1, "safe_strcat prevents buffer overrun");
    TEST_ASSERT(dest[sizeof(dest) - 1] == '\0', "safe_strcat guarantees null termination");
}

void test_bounds_checker(void) {
    printf("[*] Testing safe_check_bounds()...\n");
    TEST_ASSERT(safe_check_bounds(0, 10) == true, "Index 0 within capacity 10 is safe");
    TEST_ASSERT(safe_check_bounds(9, 10) == true, "Index 9 within capacity 10 is safe");
    TEST_ASSERT(safe_check_bounds(10, 10) == false, "Index 10 within capacity 10 is rejected (Off-by-one prevention)");
    TEST_ASSERT(safe_check_bounds(15, 10) == false, "Index 15 within capacity 10 is rejected");
}

int main(void) {
    printf("=========================================\n");
    printf(" BufferGuard C Engine Unit Test Suite\n");
    printf("=========================================\n\n");

    test_safe_strcpy();
    printf("\n");
    test_safe_strcat();
    printf("\n");
    test_bounds_checker();
    printf("\n");

    printf("=========================================\n");
    printf(" Results: %d / %d tests passed (%.1f%%)\n",
           g_tests_passed, g_tests_run, (float)g_tests_passed * 100.0f / g_tests_run);
    printf("=========================================\n");

    return (g_tests_passed == g_tests_run) ? 0 : 1;
}
