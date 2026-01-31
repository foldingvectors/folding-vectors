-- Create custom_perspectives table for user-created perspectives
CREATE TABLE IF NOT EXISTS custom_perspectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_custom_perspectives_user_id ON custom_perspectives(user_id);

-- Enable RLS
ALTER TABLE custom_perspectives ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own custom perspectives
CREATE POLICY "Users can view their own custom perspectives"
  ON custom_perspectives
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own custom perspectives
CREATE POLICY "Users can create their own custom perspectives"
  ON custom_perspectives
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own custom perspectives
CREATE POLICY "Users can update their own custom perspectives"
  ON custom_perspectives
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own custom perspectives
CREATE POLICY "Users can delete their own custom perspectives"
  ON custom_perspectives
  FOR DELETE
  USING (auth.uid() = user_id);
