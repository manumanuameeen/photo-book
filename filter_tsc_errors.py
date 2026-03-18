import sys

def filter_errors(input_file, output_file):
    encodings = ['utf-16le', 'utf-8', 'ascii']
    for enc in encodings:
        try:
            with open(input_file, 'r', encoding=enc) as f:
                content = f.read()
                lines = content.splitlines()
                with open(output_file, 'w', encoding='utf-8') as out:
                    for line in lines:
                        if 'error TS' in line:
                            out.write(line + '\n')
            print(f"Successfully processed with {enc}")
            return
        except Exception as e:
            print(f"Failed with {enc}: {e}")

if __name__ == "__main__":
    filter_errors('backend/tsc_errors_latest.txt', 'backend/final_errors.txt')
