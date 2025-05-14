import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

interface BrandIdentityProps {
  profile: {
    logo?: string
    coverImage?: string
    socialMedia: {
      instagram?: string
      facebook?: string
      twitter?: string
      tiktok?: string
    }
    carouselImages?: string[]
  }
  onSave: (changes: any) => void
}

export function BrandIdentity({ profile, onSave }: BrandIdentityProps) {
  const [formData, setFormData] = useState({
    logo: profile.logo || "",
    coverImage: profile.coverImage || "",
    socialMedia: {
      instagram: profile.socialMedia.instagram || "",
      facebook: profile.socialMedia.facebook || "",
      twitter: profile.socialMedia.twitter || "",
      tiktok: profile.socialMedia.tiktok || "",
    },
    carouselImages: profile.carouselImages || [],
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    socialMedia?: boolean
  ) => {
    const { name, value } = e.target
    if (socialMedia) {
      setFormData((prev) => ({
        ...prev,
        socialMedia: { ...prev.socialMedia, [name]: value },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const onLogoDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logo: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const onCoverDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, coverImage: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const onCarouselDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      return new Promise<string>((resolve) => {
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
      })
    })

    Promise.all(newImages).then(images => {
      setFormData(prev => ({
        ...prev,
        carouselImages: [...prev.carouselImages, ...images]
      }))
    })
  }, [])

  const removeCarouselImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      carouselImages: prev.carouselImages.filter((_, i) => i !== index)
    }))
  }

  const {
    getRootProps: getLogoRootProps,
    getInputProps: getLogoInputProps,
    isDragActive: isLogoDragActive,
  } = useDropzone({
    onDrop: onLogoDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxFiles: 1,
  })

  const {
    getRootProps: getCoverRootProps,
    getInputProps: getCoverInputProps,
    isDragActive: isCoverDragActive,
  } = useDropzone({
    onDrop: onCoverDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxFiles: 1,
  })

  const {
    getRootProps: getCarouselRootProps,
    getInputProps: getCarouselInputProps,
    isDragActive: isCarouselDragActive,
  } = useDropzone({
    onDrop: onCarouselDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    multiple: true,
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label>Business Logo</Label>
          <div
            {...getLogoRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
              ${
                isLogoDragActive
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-300 hover:border-orange-500"
              }
              ${formData.logo ? "h-[200px]" : "h-[120px]"}`}
          >
            <input {...getLogoInputProps()} />
            {formData.logo ? (
              <div className="relative h-full">
                <img
                  src={formData.logo}
                  alt="Business logo"
                  className="h-full mx-auto object-contain"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 text-gray-500 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFormData((prev) => ({ ...prev, logo: "" }))
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  {isLogoDragActive
                    ? "Drop the logo here"
                    : "Drag and drop logo here, or click to select"}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Label>Cover Image</Label>
          <div
            {...getCoverRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
              ${
                isCoverDragActive
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-300 hover:border-orange-500"
              }
              ${formData.coverImage ? "h-[200px]" : "h-[120px]"}`}
          >
            <input {...getCoverInputProps()} />
            {formData.coverImage ? (
              <div className="relative h-full">
                <img
                  src={formData.coverImage}
                  alt="Cover image"
                  className="h-full w-full object-cover rounded"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 text-gray-500 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFormData((prev) => ({ ...prev, coverImage: "" }))
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  {isCoverDragActive
                    ? "Drop the cover image here"
                    : "Drag and drop cover image here, or click to select"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label>Customer App Carousel Images</Label>
        <div
          {...getCarouselRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
            ${
              isCarouselDragActive
                ? "border-orange-500 bg-orange-50"
                : "border-gray-300 hover:border-orange-500"
            }`}
        >
          <input {...getCarouselInputProps()} />
          <div className="flex flex-col items-center justify-center py-4">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              {isCarouselDragActive
                ? "Drop the images here"
                : "Drag and drop images here, or click to select"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              These images will be shown in the customer app carousel
            </p>
          </div>
        </div>

        {formData.carouselImages.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            {formData.carouselImages.map((image, index) => (
              <Card key={index} className="relative group">
                <img
                  src={image}
                  alt={`Carousel image ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeCarouselImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Label>Social Media Links</Label>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                name="instagram"
                value={formData.socialMedia.instagram}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="@username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                name="facebook"
                value={formData.socialMedia.facebook}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="username or page name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                name="twitter"
                value={formData.socialMedia.twitter}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="@username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok</Label>
              <Input
                id="tiktok"
                name="tiktok"
                value={formData.socialMedia.tiktok}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="@username"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  )
} 