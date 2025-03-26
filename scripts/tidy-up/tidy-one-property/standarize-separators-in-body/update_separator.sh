#!/bin/bash

# Script to replace the first occurrence of --- after the frontmatter with ***
# The frontmatter is identified by having --- at both the start and end

file_path="content/changelog--content/reports/2025-03-13_evaluation-output_08.md"

# Use awk to make the replacement
# This looks for the second occurrence of "---" and replaces it with "***"
awk '
    BEGIN {count=0}
    {
        if ($0 == "---") {
            count++
            if (count == 2) {
                print "***"
            } else {
                print
            }
        } else {
            print
        }
    }
' "$file_path" > "${file_path}.tmp" && mv "${file_path}.tmp" "$file_path"
