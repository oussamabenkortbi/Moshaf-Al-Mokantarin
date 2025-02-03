import io
import re
import json

coranInJsonFormat = {}

filename = 'UthmanicWarsh1 Ver05'
surahSpliter = 'سُورَةُ'
VERSE_NUM_PATTERN = r'[\u0660-\u0669]+'

with io.open(f'./{filename}.txt', 'r', encoding='utf-16') as f:
    text = f.read().strip()
    surahs = text.split(surahSpliter)[1:]

for surah_idx, surah_content in enumerate(surahs):
    lines = [line.strip() for line in surah_content.split('\n') if line.strip()]
    
    if not lines:
        continue

    surah_name = lines[0]
    verses_list = []

    # Handle Basmala (opening phrase)
    verse_lines = lines[1:]
    if verse_lines and verse_lines[0].startswith('بِسْمِ'):
        verses_list.append({
            "chapter": surah_idx + 1,
            "verse": 0,
            "text": verse_lines[0].strip()
        })
        verse_lines = verse_lines[1:]

    # Process numbered verses
    full_text = ' '.join(verse_lines)
    verses_split = re.split(f'({VERSE_NUM_PATTERN})', full_text)
    
    current_verse = 1  # Start actual verse numbering after Basmala

    # Iterate through EASTERN ARABIC NUMERALS in the split list
    for i in range(1, len(verses_split), 2):
        if i >= len(verses_split):
            break

        # Get the verse number and preceding text
        verse_num_eastern = verses_split[i]
        verse_text = verses_split[i-1].strip()

        # Convert Eastern to Western numeral
        verse_num = int(verse_num_eastern.translate(
            str.maketrans('٠١٢٣٤٥٦٧٨٩', '0123456789')
        ))

        # Validate verse sequence
        if verse_num != current_verse:
            raise ValueError(
                f"Mismatch in chapter {surah_idx+1}: "
                f"Expected verse {current_verse}, found {verse_num}"
            )

        verses_list.append({
            "chapter": surah_idx + 1,
            "verse": verse_num,
            "text": verse_text
        })
        current_verse += 1

    coranInJsonFormat[str(surah_idx + 1)] = verses_list

with open(f'./{filename}.json', 'w', encoding='utf-8-sig') as f:
    json.dump(coranInJsonFormat, f, indent=4, ensure_ascii=False)