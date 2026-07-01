# Tuning knobs for production safety.

# Retrieval returns a similarity-ish score. We require a minimum to accept chunks.
# If below, endpoint must behave as "no context".
MIN_RETRIEVAL_SCORE_TFIDF = 0.15
MIN_RETRIEVAL_SCORE_FUZZY = 25.0

# How many top candidates to consider before applying the threshold.
CANDIDATES_TOP_K = 5

