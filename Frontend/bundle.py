import os

output_file = "codebase-pack.txt"
ignore_dirs = {".git", "node_modules", "venv", "__pycache__", ".lovable", "public"}

with open(output_file, "w", encoding="utf-8") as outfile:
    for root, dirs, files in os.walk("."):
        # Skip hidden/ignored folders
        dirs[:] = [d for d in dirs if d not in ignore_dirs and not d.startswith(".")]
        
        for file in files:
            # Skip the output file itself, configuration lockfiles, and images
            if file in [output_file, "bundle.py", "bun.lock", "package-lock.json"]:
                continue
            if file.endswith((".png", ".jpg", ".jpeg", ".ico", ".gif")):
                continue
                
            file_path = os.path.join(root, file)
            outfile.write(f"\n\n--- START OF FILE: {file_path} ---\n\n")
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as infile:
                    outfile.write(infile.read())
            except Exception as e:
                outfile.write(f"[Could not read file: {e}]")
            outfile.write(f"\n\n--- END OF FILE: {file_path} ---\n")

print(f"Success! Codebase combined into '{output_file}'")
