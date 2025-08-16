// Image compression function
export async function compressImage(file: File, maxSizeKB: number = 500): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions to maintain aspect ratio
      let { width, height } = img
      const maxDimension = 1200 // Max width or height
      
      if (width > height) {
        if (width > maxDimension) {
          height = (height * maxDimension) / width
          width = maxDimension
        }
      } else {
        if (height > maxDimension) {
          width = (width * maxDimension) / height
          height = maxDimension
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Start with high quality and reduce until size is acceptable
      let quality = 0.9
      const tryCompress = () => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'))
            return
          }
          
          const sizeKB = blob.size / 1024
          
          if (sizeKB <= maxSizeKB || quality <= 0.1) {
            // Create new File object
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            quality -= 0.1
            tryCompress()
          }
        }, 'image/jpeg', quality)
      }
      
      tryCompress()
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

// Server-side image compression using sharp (for production)
export async function compressImageServer(file: File, maxSizeKB: number = 500): Promise<Buffer> {
  try {
    const sharp = require('sharp')
    const buffer = Buffer.from(await file.arrayBuffer())
    
    let quality = 90
    let compressedBuffer: Buffer
    
    do {
      compressedBuffer = await sharp(buffer)
        .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality })
        .toBuffer()
      
      quality -= 10
    } while (compressedBuffer.length > maxSizeKB * 1024 && quality > 10)
    
    return compressedBuffer
  } catch (error) {
    // Fallback: return original buffer if sharp is not available
    console.warn('Sharp not available, using original image:', error)
    return Buffer.from(await file.arrayBuffer())
  }
}

export async function uploadToCloudinary(file: File): Promise<string> {
  // Cloudinary functionality disabled for production build compatibility
  // This prevents build errors on Vercel when cloudinary module is not available
  throw new Error('Cloudinary functionality is disabled. Using local/database storage instead.')
}

// Fallback to local storage for development
export async function uploadToLocal(file: File): Promise<string> {
  const timestamp = Date.now()
  const fileExtension = file.name.split('.').pop() || 'jpg'
  const fileName = `villa-${timestamp}.${fileExtension}`
  
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  const fs = require('fs')
  const path = require('path')
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'villas')
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
  
  const filePath = path.join(uploadsDir, fileName)
  fs.writeFileSync(filePath, buffer)
  
  return `/uploads/villas/${fileName}`
}

// Store compressed image as Base64 in database (for production)
export async function uploadToDatabase(file: File, maxSizeKB: number = 500): Promise<{
  base64: string,
  fileName: string,
  fileType: string,
  fileSize: number
}> {
  try {
    // Server-side compression
    const compressedBuffer = await compressImageServer(file, maxSizeKB)
    const base64 = compressedBuffer.toString('base64')
    
    return {
      base64: `data:image/jpeg;base64,${base64}`,
      fileName: file.name,
      fileType: 'image/jpeg',
      fileSize: compressedBuffer.length
    }
  } catch (error) {
    console.error('Database upload error:', error)
    throw new Error(`Database upload failed: ${error}`)
  }
}

// Main upload function that chooses method based on environment
export async function uploadImage(file: File): Promise<string> {
  // Always compress images first
  const maxSizeKB = 500
  
  // Check if we're in production or have specific image storage config
  if (process.env.NODE_ENV === 'production' || process.env.IMAGE_STORAGE === 'postgresql') {
    // For production or when explicitly configured: store in PostgreSQL database as Base64
    try {
      const imageData = await uploadToDatabase(file, maxSizeKB)
      return imageData.base64
    } catch (error) {
      console.warn('Database storage failed, falling back to local storage:', error)
      return uploadToLocal(file)
    }
  } else if (process.env.CLOUDINARY_CLOUD_NAME) {
    // If Cloudinary is configured, use it
    try {
      return await uploadToCloudinary(file)
    } catch (error) {
      console.warn('Cloudinary upload failed, falling back to local storage:', error)
      return uploadToLocal(file)
    }
  } else {
    // For development: use local storage
    try {
      return uploadToLocal(file)
    } catch (error) {
      console.error('Local upload failed:', error)
      throw new Error(`Upload failed: ${error}`)
    }
  }
}
