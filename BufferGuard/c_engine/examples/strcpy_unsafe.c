#include <stdio.h>
#include <string.h>

/**
 * BufferGuard Demonstration: Unbounded String Copy (CWE-120)
 * Using strcpy() - Demonstrates copying unbounded source data into fixed-size buffer.
 */

void copy_message(const char *user_payload) {
    char fixed_buffer[10];

    printf("[*] Destination buffer size: %zu bytes\n", sizeof(fixed_buffer));
    printf("[*] Source payload length:   %zu bytes (including '\\0')\n", strlen(user_payload) + 1);

    /* VULNERABLE: strcpy performs no destination capacity check */
    printf("[!] Executing unsafe strcpy(fixed_buffer, user_payload)...\n");
    strcpy(fixed_buffer, user_payload);

    printf("[+] Buffer content: %s\n", fixed_buffer);
}

int main(void) {
    const char *exploit = "OVERSIZED_INPUT_STRING_EXCEEDING_LIMIT";
    printf("=== BufferGuard Unbounded strcpy Demo ===\n");
    copy_message(exploit);
    return 0;
}
