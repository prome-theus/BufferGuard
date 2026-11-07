# BufferGuard C Engine Makefile
# Standards: C11, strict warnings, modular targets

CC ?= gcc
CFLAGS ?= -std=c11 -Wall -Wextra -pedantic -g
BIN_DIR = bin

all: directories $(BIN_DIR)/test_safe_str.exe $(BIN_DIR)/memory_layout.exe $(BIN_DIR)/stack_overflow_unsafe.exe $(BIN_DIR)/stack_overflow_safe.exe $(BIN_DIR)/strcpy_unsafe.exe $(BIN_DIR)/strcpy_safe.exe $(BIN_DIR)/off_by_one.exe

directories:
	@mkdir -p $(BIN_DIR)

$(BIN_DIR)/test_safe_str.exe: tests/test_safe_str.c safe_functions/safe_str.c
	$(CC) $(CFLAGS) -I. $^ -o $@

$(BIN_DIR)/memory_layout.exe: memory_demo/memory_layout.c
	$(CC) $(CFLAGS) $^ -o $@

$(BIN_DIR)/stack_overflow_unsafe.exe: examples/stack_overflow_unsafe.c
	$(CC) $(CFLAGS) -fno-stack-protector $^ -o $@

$(BIN_DIR)/stack_overflow_safe.exe: examples/stack_overflow_safe.c
	$(CC) $(CFLAGS) -fstack-protector-all $^ -o $@

$(BIN_DIR)/strcpy_unsafe.exe: examples/strcpy_unsafe.c
	$(CC) $(CFLAGS) -fno-stack-protector $^ -o $@

$(BIN_DIR)/strcpy_safe.exe: examples/strcpy_safe.c
	$(CC) $(CFLAGS) $^ -o $@

$(BIN_DIR)/off_by_one.exe: examples/off_by_one.c
	$(CC) $(CFLAGS) $^ -o $@

test: $(BIN_DIR)/test_safe_str.exe
	./$(BIN_DIR)/test_safe_str.exe

clean:
	rm -rf $(BIN_DIR)

.PHONY: all directories test clean
