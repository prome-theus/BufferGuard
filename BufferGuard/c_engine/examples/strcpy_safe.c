#include <stdio.h>
#include <string.h>

/**
 * BufferGuard Demonstration: Safe Bounded String Copy (Remediation for CWE-120)
 * Using snprintf() - Enforces destination capacity and guaranteed null termination.
 */

void copy_message_safe(const char *user_payload) {
    char fixed_buffer[10];

    printf("[*] Destination buffer capacity: %zu bytes\n", sizeof(fixed_buffer));
    printf("[*] Source payload length:       %zu bytes (including '\\0')\n", strlen(user_payload) + 1);

    /* SAFE: snprintf writes at most sizeof(fixed_buffer) bytes including '\\0' */
    int needed = snprintf(fixed_buffer, sizeof(fixed_buffer), "%s", user_payload);

    if (needed < 0 || (size_t)needed >= sizeof(fixed_buffer)) {
        printf("[!] WARNING: Input truncated! (Payload required %d bytes, buffer holds %zu)\n",
               needed + 1, sizeof(fixed_buffer));
    } else {
        printf("[+] String copied completely without truncation.\n");
    }

    printf("[+] Safe buffer content: '%s' (Length: %zu)\n", fixed_buffer, strlen(fixed_buffer));
}

int main(void) {
    const char *exploit = "OVERSIZED_INPUT_STRING_EXCEEDING_LIMIT";
    printf("=== BufferGuard Secure snprintf Copy Demo ===\n");
    copy_message_safe(exploit);
    return 0;
}
