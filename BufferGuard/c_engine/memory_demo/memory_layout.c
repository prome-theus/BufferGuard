#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>

/* Global variables for segment mapping */
int initialized_global = 0x41424344;
int uninitialized_global;

void sample_function(void) {
    /* Marker function for text segment */
}

void inspect_stack_frame(const char *simulated_input) {
    char target_buffer[16];
    volatile int canary_sim = 0xDEADBEEF;
    volatile int is_admin_flag = 0;
    void *frame_address = __builtin_frame_address(0);
    void *return_address = __builtin_return_address(0);

    /* Fill buffer with sample input safely */
    strncpy(target_buffer, simulated_input ? simulated_input : "DEMO_PAYLOAD", sizeof(target_buffer) - 1);
    target_buffer[sizeof(target_buffer) - 1] = '\0';

    char *heap_alloc = (char *)malloc(32);
    if (heap_alloc) {
        strcpy(heap_alloc, "HEAP_ALLOCATED_CHUNK");
    }

    /* Print JSON to stdout */
    printf("{\n");
    printf("  \"architecture\": \"%zu-bit\",\n", sizeof(void *) * 8);
    printf("  \"segments\": {\n");
    printf("    \"text_segment\": \"0x%016llX\",\n", (unsigned long long)(uintptr_t)sample_function);
    printf("    \"data_segment\": \"0x%016llX\",\n", (unsigned long long)(uintptr_t)&initialized_global);
    printf("    \"bss_segment\": \"0x%016llX\",\n", (unsigned long long)(uintptr_t)&uninitialized_global);
    printf("    \"heap_segment\": \"0x%016llX\",\n", (unsigned long long)(uintptr_t)heap_alloc);
    printf("    \"stack_segment\": \"0x%016llX\"\n", (unsigned long long)(uintptr_t)frame_address);
    printf("  },\n");

    printf("  \"stack_frame\": {\n");
    printf("    \"frame_pointer\": \"0x%016llX\",\n", (unsigned long long)(uintptr_t)frame_address);
    printf("    \"return_address_value\": \"0x%016llX\",\n", (unsigned long long)(uintptr_t)return_address);
    printf("    \"return_address_offset\": %lld,\n", (long long)((uintptr_t)return_address - (uintptr_t)target_buffer));
    printf("    \"target_buffer\": {\n");
    printf("      \"address\": \"0x%016llX\",\n", (unsigned long long)(uintptr_t)target_buffer);
    printf("      \"capacity\": %zu,\n", sizeof(target_buffer));
    printf("      \"current_content\": \"%s\"\n", target_buffer);
    printf("    },\n");
    printf("    \"adjacent_variables\": [\n");
    printf("      {\n");
    printf("        \"name\": \"canary_sim\",\n");
    printf("        \"address\": \"0x%016llX\",\n", (unsigned long long)(uintptr_t)&canary_sim);
    printf("        \"value\": \"0x%08X\",\n", canary_sim);
    printf("        \"offset_from_buffer\": %lld\n", (long long)((uintptr_t)&canary_sim - (uintptr_t)target_buffer));
    printf("      },\n");
    printf("      {\n");
    printf("        \"name\": \"is_admin_flag\",\n");
    printf("        \"address\": \"0x%016llX\",\n", (unsigned long long)(uintptr_t)&is_admin_flag);
    printf("        \"value\": %d,\n", is_admin_flag);
    printf("        \"offset_from_buffer\": %lld\n", (long long)((uintptr_t)&is_admin_flag - (uintptr_t)target_buffer));
    printf("      }\n");
    printf("    ]\n");
    printf("  }\n");
    printf("}\n");

    if (heap_alloc) {
        free(heap_alloc);
    }
}

int main(int argc, char *argv[]) {
    const char *input = (argc > 1) ? argv[1] : "BUFFER_INPUT";
    inspect_stack_frame(input);
    return 0;
}
