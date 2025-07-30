import { v2 as cloudinary } from 'cloudinary'

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

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function uploadToCloudinary(file: File): Promise<string> {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'villas',
          transformation: [
            { width: 1200, height: 800, crop: 'fill' },
            { quality: 'auto' },
            { format: 'auto' }
          ]
        },
        (error: any, result: any) => {
          if (error) {
            reject(error)
          } else {
            resolve(result!.secure_url)
          }
        }
      ).end(buffer)
    })
  } catch (error) {
    throw new Error(`Upload failed: ${error}`)
  }
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
  
  if (process.env.NODE_ENV === 'production' && process.env.IMAGE_STORAGE === 'postgresql') {
    // For production: store in PostgreSQL database as Base64
    const imageData = await uploadToDatabase(file, maxSizeKB)
    return imageData.base64
  } else if (process.env.NODE_ENV === 'production' && process.env.CLOUDINARY_CLOUD_NAME) {
    // For production with Cloudinary
    return uploadToCloudinary(file)
  } else {
    // For development: compress and store locally
    try {
      // Use client-side compression in development (if in browser)
      const compressedFile = typeof window !== 'undefined' 
        ? await compressImage(file, maxSizeKB)
        : file
      return uploadToLocal(compressedFile)
    } catch (error) {
      console.warn('Compression failed, using original file:', error)
      return uploadToLocal(file)
    }
  }
}
