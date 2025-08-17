#!/bin/bash

# Project Structure Generator
# This script creates a clean folder structure output for your project

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    echo -e "${1}${2}${NC}"
}

# Default values
OUTPUT_FILE="project-structure.txt"
MAX_DEPTH=14
INCLUDE_HIDDEN=false
EXCLUDE_PATTERNS=("node_modules" ".git" ".next" "dist" "build" "coverage" ".DS_Store" "*.log")

# Help function
show_help() {
    echo "Project Structure Generator"
    echo ""
    echo "Usage: $0 [OPTIONS] [DIRECTORY]"
    echo ""
    echo "Options:"
    echo "  -o, --output FILE     Output file name (default: project-structure.txt)"
    echo "  -d, --depth NUM       Maximum depth to traverse (default: 5)"
    echo "  -a, --all             Include hidden files and folders"
    echo "  -e, --exclude PATTERN Add pattern to exclude list"
    echo "  -c, --console         Output to console only (no file)"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    Generate structure for current directory"
    echo "  $0 ./src              Generate structure for src directory"
    echo "  $0 -d 3 -o my-tree.txt Generate with max depth 3"
    echo "  $0 -a -c              Include hidden files, output to console"
}

# Parse command line arguments
CONSOLE_ONLY=false
TARGET_DIR="."

while [[ $# -gt 0 ]]; do
    case $1 in
        -o|--output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        -d|--depth)
            MAX_DEPTH="$2"
            shift 2
            ;;
        -a|--all)
            INCLUDE_HIDDEN=true
            shift
            ;;
        -e|--exclude)
            EXCLUDE_PATTERNS+=("$2")
            shift 2
            ;;
        -c|--console)
            CONSOLE_ONLY=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        -*)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
        *)
            TARGET_DIR="$1"
            shift
            ;;
    esac
done

# Check if target directory exists
if [[ ! -d "$TARGET_DIR" ]]; then
    print_color $RED "Error: Directory '$TARGET_DIR' does not exist"
    exit 1
fi

# Function to check if path should be excluded
should_exclude() {
    local path="$1"
    local basename=$(basename "$path")
    
    # Check against exclude patterns
    for pattern in "${EXCLUDE_PATTERNS[@]}"; do
        if [[ "$basename" == $pattern ]]; then
            return 0
        fi
    done
    
    # Check hidden files if not including them
    if [[ "$INCLUDE_HIDDEN" == false && "$basename" == .* ]]; then
        return 0
    fi
    
    return 1
}

# Function to generate tree structure
generate_tree() {
    local dir="$1"
    local prefix="$2"
    local depth="$3"
    local is_last="$4"
    
    # Stop if max depth reached
    if [[ $depth -gt $MAX_DEPTH ]]; then
        return
    fi
    
    # Get directory contents
    local items=()
    while IFS= read -r -d '' item; do
        if ! should_exclude "$item"; then
            items+=("$item")
        fi
    done < <(find "$dir" -maxdepth 1 -mindepth 1 -print0 2>/dev/null | sort -z)
    
    # Process each item
    local total=${#items[@]}
    for i in "${!items[@]}"; do
        local item="${items[$i]}"
        local basename=$(basename "$item")
        local is_last_item=$([[ $((i + 1)) -eq $total ]] && echo true || echo false)
        
        # Determine tree characters
        local tree_char="├── "
        local next_prefix="│   "
        
        if [[ "$is_last_item" == true ]]; then
            tree_char="└── "
            next_prefix="    "
        fi
        
        # Print current item
        if [[ -d "$item" ]]; then
            echo "${prefix}${tree_char}📁 ${basename}/"
            # Recursively process subdirectory
            generate_tree "$item" "${prefix}${next_prefix}" $((depth + 1)) "$is_last_item"
        else
            # Add file icon based on extension
            local icon="📄"
            case "${basename##*.}" in
                js|jsx|ts|tsx) icon="⚛️ " ;;
                css|scss|sass) icon="🎨" ;;
                json) icon="📋" ;;
                md) icon="📝" ;;
                png|jpg|jpeg|gif|svg) icon="🖼️ " ;;
                html) icon="🌐" ;;
                py) icon="🐍" ;;
                sh) icon="📜" ;;
                yml|yaml) icon="⚙️ " ;;
                lock) icon="🔒" ;;
                *) icon="📄" ;;
            esac
            echo "${prefix}${tree_char}${icon} ${basename}"
        fi
    done
}

# Generate the structure
generate_structure() {
    local abs_path=$(realpath "$TARGET_DIR")
    local dir_name=$(basename "$abs_path")
    
    echo "📁 ${dir_name}/"
    generate_tree "$TARGET_DIR" "" 1 false
    echo ""
    echo "Generated on: $(date)"
    echo "Directory: $abs_path"
    echo "Max depth: $MAX_DEPTH"
    echo "Include hidden: $INCLUDE_HIDDEN"
    echo "Excluded patterns: ${EXCLUDE_PATTERNS[*]}"
}

# Main execution
print_color $BLUE "🌳 Generating project structure..."

if [[ "$CONSOLE_ONLY" == true ]]; then
    print_color $GREEN "📊 Project Structure:"
    echo ""
    generate_structure
else
    generate_structure > "$OUTPUT_FILE"
    print_color $GREEN "✅ Structure saved to: $OUTPUT_FILE"
    
    # Show preview
    print_color $YELLOW "📋 Preview (first 20 lines):"
    head -20 "$OUTPUT_FILE"
    
    total_lines=$(wc -l < "$OUTPUT_FILE")
    if [[ $total_lines -gt 20 ]]; then
        print_color $YELLOW "... and $((total_lines - 20)) more lines"
    fi
fi