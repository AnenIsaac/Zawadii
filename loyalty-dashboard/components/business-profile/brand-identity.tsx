import { useState, useEffect, useCallback, useMemo } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { LoadingComponent } from "@/components/ui/loading-component"
import { ErrorComponent } from "@/components/ui/error-component"
import { Upload, X, Image as ImageIcon, Palette, Loader2, Instagram, Facebook, Twitter } from "lucide-react"
import { Card } from "@/components/ui/card"

// 2. TypeScript Interfaces
interface BrandFormData {
  logo_url?: string
  cover_image_url?: string
  instagram?: string
  facebook?: string
  x?: string
  tiktok?: string
  carousel_images?: string[]
}

interface BrandIdentityProps {
  userId: string
  businessId: string
  onUpdate?: () => void
}

interface ValidationErrors {
  [key: string]: string
}

interface LoadingState {
  isLoading: boolean
  isSaving: boolean
  isUploading: boolean
}

interface PendingFiles {
  logo?: File | null
  cover?: File | null
  carousel?: File[]
}

// 3. Main Component
export function BrandIdentity({ userId, businessId, onUpdate }: BrandIdentityProps) {
  // SECTION 1: State and Data Fetching
  const [formData, setFormData] = useState<BrandFormData>({
    logo_url: '',
    cover_image_url: '',
    instagram: '',
    facebook: '',
    x: '',
    tiktok: '',
    carousel_images: [],
  })
  
  const [originalData, setOriginalData] = useState<BrandFormData | null>(null)
  const [pendingFiles, setPendingFiles] = useState<PendingFiles>({
    logo: null,
    cover: null,
    carousel: []
  })
  const [previewUrls, setPreviewUrls] = useState<{
    logo?: string
    cover?: string
    carousel?: string[]
  }>({})
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    isSaving: false,
    isUploading: false
  })
  const [error, setError] = useState<string>('')
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const hasChanges = useMemo(() => {
    if (!originalData) return false
    
    // Check for pending files (new uploads)
    if (pendingFiles.logo || pendingFiles.cover || (pendingFiles.carousel && pendingFiles.carousel.length > 0)) {
      return true
    }
    
    // Special handling for arrays
    const formCarousel = Array.isArray(formData.carousel_images) ? formData.carousel_images : []
    const originalCarousel = Array.isArray(originalData.carousel_images) ? originalData.carousel_images : []
    
    // Check if carousel images have changed
    if (formCarousel.length !== originalCarousel.length || 
        !formCarousel.every((url, index) => url === originalCarousel[index])) {
      return true
    }
    
    // Check other fields
    return Object.keys(formData).some(key => {
      if (key === 'carousel_images') return false // Already checked above
      return formData[key as keyof BrandFormData] !== originalData[key as keyof BrandFormData]
    })
  }, [formData, originalData, pendingFiles])

  const fetchBrandData = useCallback(async () => {
    if (!userId) {
      setError('User ID is required')
      setLoadingState(prev => ({ ...prev, isLoading: false }))
      return
    }

    try {
      setLoadingState(prev => ({ ...prev, isLoading: true }))
      setError('')

      const { data: business, error: fetchError } = await supabase
        .from('businesses')
        .select('logo_url, cover_image_url, instagram, facebook, x, tiktok, carousel_images')
        .eq('user_id', userId)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No business found, set empty defaults
          const emptyData: BrandFormData = {
            logo_url: '',
            cover_image_url: '',
            instagram: '',
            facebook: '',
            x: '',
            tiktok: '',
            carousel_images: [],
          }
          setFormData(emptyData)
          setOriginalData(emptyData)
        } else {
          throw fetchError
        }
      } else {
        // Helper function to safely parse carousel images
        const parseCarouselImages = (carouselData: any): string[] => {
          if (!carouselData) return []
          
          // If it's already an array, return it
          if (Array.isArray(carouselData)) {
            return carouselData.filter(url => typeof url === 'string' && url.trim().length > 0)
          }
          
          // If it's a string, try to parse it as JSON
          if (typeof carouselData === 'string') {
            try {
              const parsed = JSON.parse(carouselData)
              if (Array.isArray(parsed)) {
                return parsed.filter(url => typeof url === 'string' && url.trim().length > 0)
              }
            } catch (e) {
              console.warn('Failed to parse carousel_images as JSON:', carouselData)
            }
          }
          
          return []
        }
        
        const brandData: BrandFormData = {
          logo_url: business.logo_url || '',
          cover_image_url: business.cover_image_url || '',
          instagram: business.instagram || '',
          facebook: business.facebook || '',
          x: business.x || '',
          tiktok: business.tiktok || '',
          carousel_images: parseCarouselImages(business.carousel_images),
        }
        
        console.log('Fetched business data:', business)
        console.log('Processed carousel images:', brandData.carousel_images)
        
        setFormData(brandData)
        setOriginalData(brandData)
      }
    } catch (err) {
      console.error('Error fetching brand data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load brand information')
    } finally {
      setLoadingState(prev => ({ ...prev, isLoading: false }))
    }
  }, [userId, supabase])

  const uploadFile = useCallback(async (file: File, folder: string): Promise<string> => {
    if (!file) {
      throw new Error('No file provided for upload')
    }
    
    if (!businessId) {
      throw new Error('Business ID is required for file upload')
    }
    
    if (!folder) {
      throw new Error('Folder name is required for file upload')
    }
    
    console.log(`Uploading file: ${file.name} (${file.size} bytes) to ${folder}`)
    
    const fileExt = file.name.split('.').pop()
    if (!fileExt) {
      throw new Error('File must have an extension')
    }
    
    const fileName = `${businessId}/${folder}/${Date.now()}.${fileExt}`
    console.log(`File path: ${fileName}`)
    
    try {
      const { data, error: uploadError } = await supabase.storage
        .from('business-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      if (!data) {
        throw new Error('Upload succeeded but no data returned')
      }

      console.log('Upload successful, getting public URL for:', data.path)

      const { data: urlData } = supabase.storage
        .from('business-assets')
        .getPublicUrl(data.path)

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file')
      }

      console.log('Public URL generated:', urlData.publicUrl)
      return urlData.publicUrl
    } catch (storageError) {
      console.error('Storage operation failed:', storageError)
      throw storageError
    }
  }, [businessId, supabase])

  const validateForm = useCallback((): ValidationErrors => {
    const errors: ValidationErrors = {}
    
    // Social media URL validation (optional fields)
    if (formData.instagram && !formData.instagram.match(/^@?[\w.]+$/)) {
      errors.instagram = 'Please enter a valid Instagram username'
    }
    
    if (formData.facebook && formData.facebook.trim().length < 2) {
      errors.facebook = 'Please enter a valid Facebook page name'
    }
    
    if (formData.x && !formData.x.match(/^@?[\w]+$/)) {
      errors.x = 'Please enter a valid X (Twitter) username'
    }
    
    if (formData.tiktok && !formData.tiktok.match(/^@?[\w.]+$/)) {
      errors.tiktok = 'Please enter a valid TikTok username'
    }

    return errors
  }, [formData])

  const handleSave = useCallback(async () => {
    const errors = validateForm()
    setValidationErrors(errors)
    
    if (Object.keys(errors).length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before saving.",
        variant: "destructive",
      })
      return
    }

    setLoadingState(prev => ({ ...prev, isSaving: true }))
    
    try {
      let updatedFormData = { ...formData }
      
      // Upload pending files with detailed error handling
      if (pendingFiles.logo) {
        console.log('Uploading logo...')
        try {
          const logoUrl = await uploadFile(pendingFiles.logo, 'logos')
          updatedFormData.logo_url = logoUrl
          console.log('Logo uploaded successfully:', logoUrl)
        } catch (logoError) {
          console.error('Logo upload failed:', logoError)
          throw new Error(`Logo upload failed: ${logoError.message || 'Unknown error'}`)
        }
      }
      
      if (pendingFiles.cover) {
        console.log('Uploading cover image...')
        try {
          const coverUrl = await uploadFile(pendingFiles.cover, 'covers')
          updatedFormData.cover_image_url = coverUrl
          console.log('Cover uploaded successfully:', coverUrl)
        } catch (coverError) {
          console.error('Cover upload failed:', coverError)
          throw new Error(`Cover upload failed: ${coverError.message || 'Unknown error'}`)
        }
      }
      
      if (pendingFiles.carousel && pendingFiles.carousel.length > 0) {
        console.log('Uploading carousel images...')
        try {
          const uploadPromises = pendingFiles.carousel.map((file, index) => {
            console.log(`Uploading carousel image ${index + 1}...`)
            return uploadFile(file, 'carousel')
          })
          const uploadedUrls = await Promise.all(uploadPromises)
          const existingCarousel = Array.isArray(updatedFormData.carousel_images) ? updatedFormData.carousel_images : []
          updatedFormData.carousel_images = [...existingCarousel, ...uploadedUrls]
          console.log('Carousel images uploaded successfully:', uploadedUrls)
        } catch (carouselError) {
          console.error('Carousel upload failed:', carouselError)
          throw new Error(`Carousel upload failed: ${carouselError.message || 'Unknown error'}`)
        }
      }
      
      console.log('Updating database with:', updatedFormData)
      
      const brandData = {
        logo_url: updatedFormData.logo_url || null,
        cover_image_url: updatedFormData.cover_image_url || null,
        instagram: updatedFormData.instagram?.trim() || null,
        facebook: updatedFormData.facebook?.trim() || null,
        x: updatedFormData.x?.trim() || null,
        tiktok: updatedFormData.tiktok?.trim() || null,
        carousel_images: Array.isArray(updatedFormData.carousel_images) ? updatedFormData.carousel_images : [],
      }

      const { error: updateError } = await supabase
        .from('businesses')
        .update(brandData)
        .eq('user_id', userId)

      if (updateError) {
        console.error('Database update failed:', updateError)
        throw new Error(`Database update failed: ${updateError.message}`)
      }
      
      console.log('Database updated successfully')
      
      // Update form data with new URLs and clear pending files
      setFormData(updatedFormData)
      setOriginalData({ ...updatedFormData })
      setPendingFiles({ logo: null, cover: null, carousel: [] })
      setPreviewUrls({})
      
      toast({
        title: "Success",
        description: "Brand identity updated successfully!",
      })
      
      if (onUpdate) {
        onUpdate()
      }
      
    } catch (err) {
      console.error('Error saving brand data:', err)
      
      // Better error message handling
      let errorMessage = "Failed to save brand identity"
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
      } else if (err && typeof err === 'object') {
        errorMessage = JSON.stringify(err)
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoadingState(prev => ({ ...prev, isSaving: false }))
    }
  }, [formData, pendingFiles, userId, validateForm, supabase, toast, onUpdate, uploadFile])

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }, [validationErrors])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    handleSave()
  }, [handleSave])

  const handleRetry = useCallback(() => {
    fetchBrandData()
  }, [fetchBrandData])

  const handleReset = useCallback(() => {
    if (originalData) {
      setFormData({ ...originalData })
      setValidationErrors({})
      setPendingFiles({ logo: null, cover: null, carousel: [] })
      setPreviewUrls({})
    }
  }, [originalData])

  // File upload handlers
  const onLogoDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    
    // Store file for later upload
    setPendingFiles(prev => ({ ...prev, logo: file }))
    setPreviewUrls(prev => ({ ...prev, logo: previewUrl }))
    
    toast({
      title: "Logo Ready",
      description: "Logo will be uploaded when you save.",
    })
  }, [toast])

  const onCoverDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    
    // Store file for later upload
    setPendingFiles(prev => ({ ...prev, cover: file }))
    setPreviewUrls(prev => ({ ...prev, cover: previewUrl }))
    
    toast({
      title: "Cover Image Ready",
      description: "Cover image will be uploaded when you save.",
    })
  }, [toast])

  const onCarouselDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    // Create preview URLs
    const newPreviewUrls = acceptedFiles.map(file => URL.createObjectURL(file))
    
    // Store files for later upload
    setPendingFiles(prev => ({
      ...prev,
      carousel: [...(prev.carousel || []), ...acceptedFiles]
    }))
    
    setPreviewUrls(prev => ({
      ...prev,
      carousel: [...(prev.carousel || []), ...newPreviewUrls]
    }))
    
    toast({
      title: "Images Ready",
      description: `${acceptedFiles.length} image(s) will be uploaded when you save.`,
    })
  }, [toast])

  const removeCarouselImage = useCallback((index: number) => {
    const existingImages = Array.isArray(formData.carousel_images) ? formData.carousel_images : []
    const pendingImages = Array.isArray(previewUrls.carousel) ? previewUrls.carousel : []
    const totalExisting = existingImages.length
    
    if (index < totalExisting) {
      // Remove from existing saved images
      setFormData(prev => ({
        ...prev,
        carousel_images: existingImages.filter((_, i) => i !== index)
      }))
    } else {
      // Remove from pending images
      const pendingIndex = index - totalExisting
      setPendingFiles(prev => ({
        ...prev,
        carousel: (prev.carousel || []).filter((_, i) => i !== pendingIndex)
      }))
      setPreviewUrls(prev => ({
      ...prev,
        carousel: pendingImages.filter((_, i) => i !== pendingIndex)
      }))
    }
  }, [formData.carousel_images, previewUrls.carousel])

  const removeLogo = useCallback(() => {
    if (pendingFiles.logo) {
      // Remove pending logo
      setPendingFiles(prev => ({ ...prev, logo: null }))
      setPreviewUrls(prev => ({ ...prev, logo: undefined }))
    } else {
      // Remove existing logo
      setFormData(prev => ({ ...prev, logo_url: '' }))
    }
  }, [pendingFiles.logo])

  const removeCover = useCallback(() => {
    if (pendingFiles.cover) {
      // Remove pending cover
      setPendingFiles(prev => ({ ...prev, cover: null }))
      setPreviewUrls(prev => ({ ...prev, cover: undefined }))
    } else {
      // Remove existing cover
      setFormData(prev => ({ ...prev, cover_image_url: '' }))
    }
  }, [pendingFiles.cover])

  const {
    getRootProps: getLogoRootProps,
    getInputProps: getLogoInputProps,
    isDragActive: isLogoDragActive,
  } = useDropzone({
    onDrop: onLogoDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB limit
    disabled: loadingState.isSaving
  })

  const {
    getRootProps: getCoverRootProps,
    getInputProps: getCoverInputProps,
    isDragActive: isCoverDragActive,
  } = useDropzone({
    onDrop: onCoverDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB limit for cover images
    disabled: loadingState.isSaving
  })

  const {
    getRootProps: getCarouselRootProps,
    getInputProps: getCarouselInputProps,
    isDragActive: isCarouselDragActive,
  } = useDropzone({
    onDrop: onCarouselDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true,
    maxSize: 8 * 1024 * 1024, // 8MB limit per carousel image
    disabled: loadingState.isSaving
  })

  useEffect(() => {
    console.log('BrandIdentity component mounted with:', { userId, businessId })
    
    if (!userId) {
      setError('User ID is required')
      setLoadingState(prev => ({ ...prev, isLoading: false }))
      return
    }
    
    if (!businessId) {
      setError('Business ID is required for file uploads. Please ensure your business is properly set up.')
      setLoadingState(prev => ({ ...prev, isLoading: false }))
      return
    }
    
    fetchBrandData()
  }, [fetchBrandData, userId, businessId])

  // SECTION 2: Loading and Error States
  if (loadingState.isLoading) {
    return <LoadingComponent message="Loading brand identity..." />
  }

  if (error) {
    return (
      <ErrorComponent 
        message={error}
        onRetry={handleRetry}
      />
    )
  }

  // SECTION 3: Main Render
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Palette className="h-6 w-6 text-[#F8843A]" />
          <h2 className="text-2xl font-bold text-gray-900">Brand Identity</h2>
        </div>
        <p className="text-gray-600">
          Upload your business logo, cover image, and add social media links
        </p>
      </div>
      
    <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Logo Upload */}
        <div className="space-y-4">
            <Label className="flex items-center space-x-1">
              <ImageIcon className="h-4 w-4" />
              <span>Business Logo</span>
            </Label>
          <div
            {...getLogoRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                ${isLogoDragActive ? "border-[#F8843A] bg-orange-50" : "border-gray-300 hover:border-[#F8843A]"}
                ${loadingState.isSaving ? "opacity-50 cursor-not-allowed" : ""}
                ${formData.logo_url ? "h-[200px]" : "h-[120px]"}`}
          >
            <input {...getLogoInputProps()} />
              {formData.logo_url || previewUrls.logo ? (
              <div className="relative h-full">
                <img
                    src={previewUrls.logo || formData.logo_url}
                  alt="Business logo"
                    className="h-full mx-auto object-contain rounded"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 text-gray-500 hover:text-red-500"
                    onClick={removeLogo}
                    disabled={loadingState.isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                  {loadingState.isSaving ? (
                    <>
                      <Loader2 className="h-8 w-8 text-[#F8843A] animate-spin mb-2" />
                      <p className="text-sm text-gray-500">Saving logo...</p>
                    </>
                  ) : (
                    <>
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  {isLogoDragActive
                    ? "Drop the logo here"
                    : "Drag and drop logo here, or click to select"}
                </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </>
                  )}
              </div>
            )}
          </div>
        </div>

          {/* Cover Image Upload */}
        <div className="space-y-4">
            <Label className="flex items-center space-x-1">
              <ImageIcon className="h-4 w-4" />
              <span>Cover Image</span>
            </Label>
          <div
            {...getCoverRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                ${isCoverDragActive ? "border-[#F8843A] bg-orange-50" : "border-gray-300 hover:border-[#F8843A]"}
                ${loadingState.isSaving ? "opacity-50 cursor-not-allowed" : ""}
                ${formData.cover_image_url ? "h-[200px]" : "h-[120px]"}`}
          >
            <input {...getCoverInputProps()} />
              {formData.cover_image_url || previewUrls.cover ? (
              <div className="relative h-full">
                <img
                    src={previewUrls.cover || formData.cover_image_url}
                  alt="Cover image"
                  className="h-full w-full object-cover rounded"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 text-gray-500 hover:text-red-500"
                    onClick={removeCover}
                    disabled={loadingState.isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                  {loadingState.isSaving ? (
                    <>
                      <Loader2 className="h-8 w-8 text-[#F8843A] animate-spin mb-2" />
                      <p className="text-sm text-gray-500">Saving cover...</p>
                    </>
                  ) : (
                    <>
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  {isCoverDragActive
                    ? "Drop the cover image here"
                    : "Drag and drop cover image here, or click to select"}
                </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG, WEBP up to 10MB
                      </p>
                    </>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Social Media Links */}
        <div className="space-y-4">
          <Label>Social Media Links (Optional)</Label>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center space-x-1">
                  <Instagram className="h-4 w-4" />
                  <span>Instagram</span>
                </Label>
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.instagram || ''}
                  onChange={handleInputChange}
                  placeholder="@username"
                  disabled={loadingState.isSaving}
                  className={validationErrors.instagram ? 'border-red-500' : ''}
                />
                {validationErrors.instagram && (
                  <p className="text-sm text-red-600">{validationErrors.instagram}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center space-x-1">
                  <Facebook className="h-4 w-4" />
                  <span>Facebook</span>
                </Label>
                <Input
                  id="facebook"
                  name="facebook"
                  value={formData.facebook || ''}
                  onChange={handleInputChange}
                  placeholder="page name or username"
                  disabled={loadingState.isSaving}
                  className={validationErrors.facebook ? 'border-red-500' : ''}
                />
                {validationErrors.facebook && (
                  <p className="text-sm text-red-600">{validationErrors.facebook}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="x" className="flex items-center space-x-1">
                  <Twitter className="h-4 w-4" />
                  <span>X (Twitter)</span>
                </Label>
                <Input
                  id="x"
                  name="x"
                  value={formData.x || ''}
                  onChange={handleInputChange}
                  placeholder="@username"
                  disabled={loadingState.isSaving}
                  className={validationErrors.x ? 'border-red-500' : ''}
                />
                {validationErrors.x && (
                  <p className="text-sm text-red-600">{validationErrors.x}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok" className="flex items-center space-x-1">
                  <ImageIcon className="h-4 w-4" />
                  <span>TikTok</span>
                </Label>
                <Input
                  id="tiktok"
                  name="tiktok"
                  value={formData.tiktok || ''}
                  onChange={handleInputChange}
                  placeholder="@username"
                  disabled={loadingState.isSaving}
                  className={validationErrors.tiktok ? 'border-red-500' : ''}
                />
                {validationErrors.tiktok && (
                  <p className="text-sm text-red-600">{validationErrors.tiktok}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Carousel Images Upload */}
      <div className="space-y-4">
          <Label>Business Image Gallery (Optional)</Label>
          <p className="text-sm text-gray-500 mb-4">
            Upload multiple images showcasing your business for customers to see in the app
          </p>
          
        <div
          {...getCarouselRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isCarouselDragActive ? "border-[#F8843A] bg-orange-50" : "border-gray-300 hover:border-[#F8843A]"}
              ${loadingState.isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getCarouselInputProps()} />
          <div className="flex flex-col items-center justify-center py-4">
              {loadingState.isSaving ? (
                <>
                  <Loader2 className="h-8 w-8 text-[#F8843A] animate-spin mb-2" />
                  <p className="text-sm text-gray-500">Saving images...</p>
                </>
              ) : (
                <>
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              {isCarouselDragActive
                ? "Drop the images here"
                : "Drag and drop images here, or click to select"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, WEBP up to 8MB each (multiple files)
            </p>
                </>
              )}
            </div>
          </div>

          {/* Display uploaded carousel images */}
          {(() => {
            const hasExisting = formData.carousel_images && Array.isArray(formData.carousel_images) && formData.carousel_images.length > 0
            const hasPending = previewUrls.carousel && previewUrls.carousel.length > 0
            
            return (hasExisting || hasPending)
          })() && (
            <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-3 lg:grid-cols-4">
              {/* Existing saved images */}
              {Array.isArray(formData.carousel_images) && formData.carousel_images.map((imageUrl, index) => (
                <Card key={`existing-${index}`} className="relative group overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={`Business image ${index + 1}`}
                    className="w-full h-32 object-cover"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                    className="absolute top-1 right-1 text-white bg-black bg-opacity-50 hover:bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeCarouselImage(index)}
                    disabled={loadingState.isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Card>
            ))}
              
              {/* Pending preview images */}
              {Array.isArray(previewUrls.carousel) && previewUrls.carousel.map((previewUrl, index) => {
                const actualIndex = (formData.carousel_images?.length || 0) + index
                return (
                  <Card key={`pending-${index}`} className="relative group overflow-hidden border-2 border-orange-200">
                    <img
                      src={previewUrl}
                      alt={`New business image ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 text-white bg-black bg-opacity-50 hover:bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeCarouselImage(actualIndex)}
                      disabled={loadingState.isSaving}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-1 left-1 bg-orange-500 text-white text-xs px-1 rounded">
                      New
                    </div>
                  </Card>
                )
              })}
          </div>
        )}
      </div>

        <div className="flex justify-between pt-4 border-t">
          <div>
            {hasChanges && originalData && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleReset}
                disabled={loadingState.isSaving}
              >
                Reset Changes
              </Button>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={loadingState.isSaving || !hasChanges}
            className="bg-[#F8843A] hover:bg-orange-500"
          >
            {loadingState.isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Brand Identity'
            )}
          </Button>
        </div>
      </form>
      </div>
  )
} 