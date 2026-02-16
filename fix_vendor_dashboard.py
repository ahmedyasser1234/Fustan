import sys

file_path = sys.argv[1]

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and update the import section (after line 39: import { toast } from "sonner";)
for i, line in enumerate(lines):
    if 'import { toast } from "sonner";' in line:
        # Check if CouponsTab import already exists
        if i + 1 < len(lines) and 'CouponsTab' not in lines[i + 1]:
            lines.insert(i + 1, 'import { CouponsTab } from "@/components/dashboard/CouponsTab";\n')
        break

# Find and update the activeTab type definition
for i, line in enumerate(lines):
    if '"overview" | "products" | "orders" | "settings" | "collections" | "categories"' in line and '"coupons"' not in line:
        lines[i] = line.replace(
            '"overview" | "products" | "orders" | "settings" | "collections" | "categories"',
            '"overview" | "products" | "orders" | "settings" | "collections" | "categories" | "coupons"'
        )
        break

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("File updated successfully")
