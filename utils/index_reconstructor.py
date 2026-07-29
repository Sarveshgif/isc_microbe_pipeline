def reconstruct_abstract(inverted_index: dict) -> str:
    if not inverted_index:
        return ""
    max_position = max(pos for positions in inverted_index.values() for pos in positions)
    slots = [""] * (max_position + 1)
    for word, positions in inverted_index.items():
        for pos in positions:
            slots[pos] = word
    return " ".join(slots).strip()
