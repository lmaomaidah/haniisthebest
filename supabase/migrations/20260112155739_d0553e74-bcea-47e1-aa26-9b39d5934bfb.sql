-- Add size constraints for JSONB columns
ALTER TABLE venn_diagrams ADD CONSTRAINT check_circles_size
CHECK (pg_column_size(circles) < 100000);

ALTER TABLE venn_diagrams ADD CONSTRAINT check_placements_size
CHECK (pg_column_size(placements) < 100000);

ALTER TABLE tier_lists ADD CONSTRAINT check_tiers_size
CHECK (pg_column_size(tiers) < 200000);

-- Add TEXT field length constraints
ALTER TABLE images ADD CONSTRAINT check_name_length
CHECK (char_length(name) <= 100);

ALTER TABLE forms ADD CONSTRAINT check_title_length
CHECK (char_length(title) <= 200);

ALTER TABLE forms ADD CONSTRAINT check_description_length
CHECK (description IS NULL OR char_length(description) <= 2000);

ALTER TABLE form_questions ADD CONSTRAINT check_question_title_length
CHECK (char_length(title) <= 500);

ALTER TABLE form_options ADD CONSTRAINT check_option_text_length
CHECK (char_length(option_text) <= 200);

ALTER TABLE profiles ADD CONSTRAINT check_username_length
CHECK (char_length(username) <= 50);

ALTER TABLE tier_lists ADD CONSTRAINT check_tier_name_length
CHECK (char_length(name) <= 100);

ALTER TABLE venn_diagrams ADD CONSTRAINT check_venn_name_length
CHECK (char_length(name) <= 100);