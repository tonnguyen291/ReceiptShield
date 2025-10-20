#!/bin/bash

# PlantUML Diagram Generator Script
# Usage: ./generate-diagrams.sh [file.puml] or ./generate-diagrams.sh (for all .puml files)

PLANTUML_JAR="$(dirname "$0")/plantuml.jar"

# Check if PlantUML jar exists
if [ ! -f "$PLANTUML_JAR" ]; then
    echo "Error: plantuml.jar not found at $PLANTUML_JAR"
    exit 1
fi

# Check if Java is available
if ! command -v java &> /dev/null; then
    echo "Error: Java not found. Please install Java."
    echo "Run: brew install openjdk@17"
    exit 1
fi

# If specific file(s) provided, use them; otherwise generate all .puml files
if [ $# -gt 0 ]; then
    echo "Generating diagrams for: $@"
    java -jar "$PLANTUML_JAR" "$@"
else
    echo "Generating diagrams for all .puml files in docs/architecture/"
    java -jar "$PLANTUML_JAR" docs/architecture/*.puml
fi

echo ""
echo "✅ Diagram generation complete!"

