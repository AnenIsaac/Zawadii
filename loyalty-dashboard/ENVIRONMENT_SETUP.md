# Environment Setup Guide

## Supabase Configuration

To get email verification working, you need to set up your Supabase project correctly:

### 1. Environment Variables
Create a `.env.local` file in your project root with:

```bash
# Your Supabase project URL (found in Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url

# Your Supabase anon/public key (found in Project Settings > API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Project Configuration

Go to your Supabase project dashboard and configure:

#### Authentication Settings
1. Navigate to **Authentication > Settings**
2. Set **Site URL** to: `http://localhost:3002` (for development)
3. Add these **Redirect URLs**:
   - `http://localhost:3002/auth/callback`
   - `http://localhost:3002/auth/login`
   - `http://localhost:3002/**` (wildcard for development)

#### Email Configuration
1. Go to **Authentication > Settings**
2. Enable **Email confirmations**
3. Set **Email confirmation** to "Required"
4. Configure **Email Templates** in **Authentication > Email Templates**:
   - Customize the "Confirm your signup" template if needed
   - Make sure the confirmation link points to your domain

#### Production URLs
For production, add your production domain:
- Site URL: `https://yourdomain.com`
- Redirect URLs: 
  - `https://yourdomain.com/auth/callback`
  - `https://yourdomain.com/auth/login`

### 3. Testing Email Verification

1. **Sign up** with a real email address
2. Check your email inbox (and spam folder)
3. Click the verification link
4. You should be redirected to `/auth/callback` then to `/auth/login?verified=true`
5. Sign in with your credentials

### 4. Troubleshooting

#### No verification email received:
- Check Supabase Authentication > Users to see if user was created
- Verify email templates are enabled
- Check spam/junk folder
- Ensure SMTP is configured (Supabase provides default SMTP)

#### Verification link not working:
- Check that redirect URLs are correctly configured
- Ensure the callback page exists at `/auth/callback`
- Check browser console for errors

#### "Email not confirmed" error:
- User needs to click the verification link first
- Check if user's `email_confirmed_at` field is populated in Supabase

### 5. Development vs Production

For development:
- Use `localhost:3002` URLs
- Email verification works with real email addresses
- Supabase provides built-in SMTP for testing

For production:
- Update all URLs to your production domain
- Consider setting up custom SMTP in Supabase settings
- Test the complete flow on your production environment 

# Loyalty Dashboard Environment Setup

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

## 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd loyalty-dashboard
npm install
```

## 2. Supabase Setup

### A. Create a New Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details and wait for setup to complete

### B. Database Schema Setup

Execute the following SQL in your Supabase SQL Editor:

```sql
-- Create businesses table
CREATE TABLE businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location_description TEXT,
  phone_number VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  logo_url TEXT,
  cover_image_url TEXT,
  carousel_images TEXT[],
  status VARCHAR(50) DEFAULT 'active',
  instagram VARCHAR(255),
  facebook VARCHAR(255),
  x VARCHAR(255),
  tiktok VARCHAR(255),
  points_conversion DECIMAL(10,2) DEFAULT 1.00,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own business
CREATE POLICY "Users can view own business" ON businesses FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own business
CREATE POLICY "Users can insert own business" ON businesses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own business
CREATE POLICY "Users can update own business" ON businesses FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own business
CREATE POLICY "Users can delete own business" ON businesses FOR DELETE USING (auth.uid() = user_id);
```

### C. Storage Setup for File Uploads

1. **Create Storage Bucket**:
   - Go to Storage > Buckets in your Supabase dashboard
   - Click "Create Bucket"
   - Name: `business-assets`
   - Set as Public bucket: **Yes**
   - Click "Create"

2. **Set Storage Policies**:
   Execute this SQL to set up storage policies:

```sql
-- Allow authenticated users to upload files to any business folder they have access to
INSERT INTO storage.policies (bucket_id, name, definition)
VALUES ('business-assets', 'Authenticated users can upload business files', 
        'bucket_id = ''business-assets'' AND auth.role() = ''authenticated''');

-- Allow public access to read files
INSERT INTO storage.policies (bucket_id, name, definition, check_expression)
VALUES ('business-assets', 'Public can view files', 
        'bucket_id = ''business-assets''', 'true');

-- Allow authenticated users to delete files (you might want to restrict this further)
INSERT INTO storage.policies (bucket_id, name, definition)
VALUES ('business-assets', 'Authenticated users can delete business files', 
        'bucket_id = ''business-assets'' AND auth.role() = ''authenticated''');
```

Alternatively, you can set these policies in the Supabase Dashboard:
- Go to Storage > Policies
- For the `business-assets` bucket, add these policies:
  - **Upload Policy**: `bucket_id = 'business-assets' AND auth.role() = 'authenticated'`
  - **Select Policy**: `bucket_id = 'business-assets'` (for public read access)
  - **Delete Policy**: `bucket_id = 'business-assets' AND auth.role() = 'authenticated'`

### D. Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**To find these values:**
1. Go to Project Settings > API in your Supabase dashboard
2. Copy the "Project URL" and "anon/public key"

## 3. Email Configuration (Optional but Recommended)

### Configure Email Templates
Go to Authentication > Email Templates in Supabase dashboard and customize:

1. **Confirm Signup Template**:
   - Subject: `Welcome to [Business Name] - Confirm Your Email`
   - Body: Include verification link and welcome message

2. **Reset Password Template**:
   - Subject: `Reset Your Password - [Business Name]`
   - Body: Include reset link and security notice

### Configure Email Settings
Go to Authentication > Settings:
- Set up custom SMTP (recommended for production)
- Configure redirect URLs for email verification

## 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 5. Initial User Setup Flow

1. **Signup**: New users create accounts with email verification
2. **Email Verification**: Users must verify email before proceeding
3. **Business Setup**: After verification, users complete business profile
4. **Dashboard Access**: Users can access the full dashboard and features

## 6. File Upload Features

The Brand Identity section supports:
- **Logo Upload**: Business logos (up to 5MB, PNG/JPG/WEBP)
- **Cover Image Upload**: Business cover images (up to 10MB, PNG/JPG/WEBP)
- **Carousel Images**: Multiple business gallery images (up to 8MB each, PNG/JPG/WEBP)
- **Automatic Organization**: Files are stored in user-specific folders
- **Public URLs**: Uploaded files get public URLs for easy access

Files are stored in the following structure:
```
business-assets/
  ├── {business_id}/
      ├── logos/
      │   └── {timestamp}.{ext}
      ├── covers/
      │   └── {timestamp}.{ext}
      └── carousel/
          └── {timestamp}.{ext}
```

## 7. Troubleshooting

### Common Issues:

1. **Email not sending**: Check Supabase email settings and rate limits
2. **Database connection errors**: Verify environment variables
3. **File upload fails**: Check storage bucket setup and policies
4. **Authentication errors**: Ensure JWT secret is properly configured

### Reset Environment:
If you need to reset everything:
1. Delete and recreate Supabase project
2. Clear browser storage/cookies
3. Delete `.next` folder and restart dev server

## 8. Production Deployment

Before deploying:
1. Set up custom domain in Supabase
2. Configure production environment variables
3. Set up proper SMTP for email delivery
4. Test file upload functionality
5. Verify all RLS policies are working correctly 