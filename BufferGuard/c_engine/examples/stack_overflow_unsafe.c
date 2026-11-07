#include <stdio.h>
#include <string.h>

/**
 * BufferGuard Demonstration: Stack-based Buffer Overflow (CWE-121)
 * Using gets() - Demonstrates how overwriting a buffer alters adjacent stack memory.
 */

void vulnerable_login(void) {
    volatile int is_admin = 0;
    char password_buffer[8];

    printf("[*] &password_buffer = %p\n", (void *)password_buffer);
    printf("[*] &is_admin        = %p (offset: %ld bytes)\n",
           (void *)&is_admin, (long)((char *)&is_admin - password_buffer));
    printf("[*] Initial is_admin = %d\n", is_admin);

    printf("[*] Enter password (unsafe read): ");
    /* DANGEROUS: gets() does no length check. Writing 9+ characters can overwrite is_admin */
    gets(password_buffer);

    printf("[*] Entered: %s\n", password_buffer);
    printf("[*] Value of is_admin after input: %d (0x%08X)\n", is_admin, is_admin);

    if (is_admin != 0) {
        printf("[!] SECURITY BREACH: Administrative privilege granted via stack overflow!\n");
    } else {
        printf("[-] Access restricted to standard user.\n");
    }
}

int main(void) {
    printf("=== BufferGuard Unsafe Stack Overflow Demo ===\n");
    vulnerable_login();
    return 0;
}
