-- Fix function search path security issue
CREATE OR REPLACE FUNCTION calculate_total_score(
  p_sex_appeal INTEGER,
  p_character_design INTEGER,
  p_iq INTEGER,
  p_eq INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE(p_sex_appeal, 0) + 
         COALESCE(p_character_design, 0) + 
         COALESCE(p_iq, 0) + 
         COALESCE(p_eq, 0);
END;
$$;