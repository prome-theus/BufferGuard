#include <stdio.h>
#include <string.h>

/**
 * BufferGuard Demonstration: Safe Bounded Input (Remediation for CWE-121)
 * Using fgets() - Demonstrates bounds enforcement and prevention of stack corruption.
 */

#define BUF_SIZE 8

void secure_login(void) {
    volatile int is_admin = 0;
    char password_buffer[BUF_SIZE];

    printf("[*] &password_buffer = %p\n", (void *)password_buffer);
    printf("[*] &is_admin        = %p (offset: %ld bytes)\n",
           (void *)&is_admin, (long)((char *)&is_admin - password_buffer));
    printf("[*] Initial is_admin = %d\n", is_admin);

    printf("[*] Enter password (safe read, max %d chars): ", BUF_SIZE - 1);
    
    /* SAFE: fgets guarantees reading at most sizeof(password_buffer) - 1 characters */
    if (fgets(password_buffer, sizeof(password_buffer), stdin) != NULL) {
        /* Strip trailing newline character */
        password_buffer[strcspn(password_buffer, "\r\n")] = '\0';
    }

    printf("[*] Entered: %s (Length: %zu)\n", password_buffer, strlen(password_buffer));
    printf("[*] Value of is_admin after input: %d\n", is_admin);

    if (strcmp(password_buffer, "ADMIN") == 0) {
        is_admin = 1;
        printf("[+] Authenticated legitimately as Admin.\n");
    } else {
        printf("[-] Access restricted. Memory boundary preserved.\n");
    }
}

int main(void) {
    printf("=== BufferGuard Secure Stack Defense Demo ===\n");
    secure_login();
    return 0;
}
