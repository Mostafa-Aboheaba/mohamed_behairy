-- نفّذ هذا الملف إذا كان الجدول مُنشأاً بحد 220 حرف
ALTER TABLE condolences DROP CONSTRAINT IF EXISTS condolences_message_check;
ALTER TABLE condolences ADD CONSTRAINT condolences_message_check
  CHECK (char_length(message) BETWEEN 1 AND 400);

DROP POLICY IF EXISTS "condolences_insert_public" ON condolences;
CREATE POLICY "condolences_insert_public"
  ON condolences FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    approved = true
    AND char_length(name) BETWEEN 1 AND 80
    AND char_length(message) BETWEEN 1 AND 400
  );
