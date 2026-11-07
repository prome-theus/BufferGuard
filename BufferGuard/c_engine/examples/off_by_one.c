#include <stdio.h>

/**
 * BufferGuard Demonstration: Off-by-One Loop Boundary (CWE-193)
 * Demonstrates subtle out-of-bounds array write by 1 element.
 */

#define CAPACITY 8

int main(void) {
    char data_array[CAPACITY];
    volatile int adjacent_canary = 0x11223344;

    printf("=== BufferGuard Off-by-One Demo (CWE-193) ===\n");
    printf("[*] Array capacity: %d elements (valid indices: 0 to %d)\n", CAPACITY, CAPACITY - 1);
    printf("[*] Canary before loop: 0x%08X\n", adjacent_canary);

    /* VULNERABILITY: i <= CAPACITY iterates CAPACITY + 1 times (0 to 8) */
    printf("[!] Running loop with 'i <= %d' condition...\n", CAPACITY);
    for (int i = 0; i <= CAPACITY; i++) {
        if (i == CAPACITY) {
            printf("[!] ALERT: Writing to index %d (out of bounds!)\n", i);
        }
        data_array[i] = 'A';
    }

    printf("[*] Loop finished.\n");
    printf("[*] Canary after loop:  0x%08X\n", adjacent_canary);
    return 0;
}
