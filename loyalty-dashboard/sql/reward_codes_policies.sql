-- RLS Policies for reward_codes table
-- These policies allow authenticated users to manage reward codes for their own businesses

-- Enable RLS on reward_codes table
ALTER TABLE reward_codes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to insert reward codes for their own business
CREATE POLICY "Users can insert codes for their business rewards" ON reward_codes
  FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT b.user_id 
      FROM businesses b 
      WHERE b.id = business_id
    )
  );

-- Policy 2: Allow authenticated users to view reward codes for their own business
CREATE POLICY "Users can view codes for their business rewards" ON reward_codes
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT b.user_id 
      FROM businesses b 
      WHERE b.id = business_id
    )
  );

-- Policy 3: Allow authenticated users to update reward codes for their own business
CREATE POLICY "Users can update codes for their business rewards" ON reward_codes
  FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT b.user_id 
      FROM businesses b 
      WHERE b.id = business_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT b.user_id 
      FROM businesses b 
      WHERE b.id = business_id
    )
  );

-- Policy 4: Allow authenticated users to delete reward codes for their own business
CREATE POLICY "Users can delete codes for their business rewards" ON reward_codes
  FOR DELETE 
  USING (
    auth.uid() IN (
      SELECT b.user_id 
      FROM businesses b 
      WHERE b.id = business_id
    )
  );

-- Optional: Allow customers to view their own redeemed codes
CREATE POLICY "Customers can view their own codes" ON reward_codes
  FOR SELECT 
  USING (customer_id = auth.uid()); 