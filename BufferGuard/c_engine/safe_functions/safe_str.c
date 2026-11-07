#include "safe_str.h"
#include <string.h>

SafeStrStatus safe_strcpy(char *dest, size_t dest_size, const char *src) {
    if (!dest || !src) {
        return SAFE_STR_NULL_PTR;
    }
    if (dest_size == 0) {
        return SAFE_STR_ZERO_SIZE;
    }

    size_t i = 0;
    while (i < dest_size - 1 && src[i] != '\0') {
        dest[i] = src[i];
        i++;
    }
    dest[i] = '\0';

    if (src[i] != '\0') {
        return SAFE_STR_TRUNCATED;
    }
    return SAFE_STR_OK;
}

SafeStrStatus safe_strcat(char *dest, size_t dest_size, const char *src) {
    if (!dest || !src) {
        return SAFE_STR_NULL_PTR;
    }
    if (dest_size == 0) {
        return SAFE_STR_ZERO_SIZE;
    }

    size_t dest_len = 0;
    while (dest_len < dest_size && dest[dest_len] != '\0') {
        dest_len++;
    }

    if (dest_len >= dest_size) {
        dest[dest_size - 1] = '\0';
        return SAFE_STR_BUFFER_OVERFLOW;
    }

    size_t remaining = dest_size - dest_len - 1;
    size_t i = 0;
    while (i < remaining && src[i] != '\0') {
        dest[dest_len + i] = src[i];
        i++;
    }
    dest[dest_len + i] = '\0';

    if (src[i] != '\0') {
        return SAFE_STR_TRUNCATED;
    }
    return SAFE_STR_OK;
}

SafeStrStatus safe_readline(char *dest, size_t dest_size, FILE *stream) {
    if (!dest || !stream) {
        return SAFE_STR_NULL_PTR;
    }
    if (dest_size <= 1) {
        if (dest_size == 1) dest[0] = '\0';
        return SAFE_STR_ZERO_SIZE;
    }

    if (fgets(dest, (int)dest_size, stream) == NULL) {
        dest[0] = '\0';
        return SAFE_STR_OK;
    }

    size_t len = strlen(dest);
    if (len > 0 && (dest[len - 1] == '\n' || dest[len - 1] == '\r')) {
        dest[len - 1] = '\0';
        if (len > 1 && dest[len - 2] == '\r') {
            dest[len - 2] = '\0';
        }
        return SAFE_STR_OK;
    }

    // If newline was not read, input was truncated by buffer limit
    int ch;
    bool had_extra = false;
    while ((ch = fgetc(stream)) != '\n' && ch != EOF) {
        had_extra = true;
    }

    return had_extra ? SAFE_STR_TRUNCATED : SAFE_STR_OK;
}

bool safe_check_bounds(size_t index, size_t capacity) {
    return index < capacity;
}
