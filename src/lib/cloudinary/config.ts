// Cloudinary Configuration
export const cloudinaryConfig = {
  cloudName: "dcrj9tc4w",
  uploadPreset: "dreamland" 
};

/**
 * Uploads a file to Cloudinary using an unsigned upload preset.
 * @param file The file to upload (File or Blob)
 * @returns The secure URL of the uploaded file
 */
export const uploadToCloudinary = async (file: File | Blob): Promise<string> => {
  const resourceType = file.type.startsWith('audio/') || file.type.startsWith('video/') ? 'video' : 'image';
  const fileName = file.type.startsWith('audio/') ? "audio.webm" : "upload.jpg";

  console.log("Preparing to upload:", { 
    size: file.size, 
    type: file.type, 
    resourceType,
    preset: cloudinaryConfig.uploadPreset 
  });

  const formData = new FormData();
  formData.append("file", file, fileName);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    console.error(`Cloudinary Upload Error: ${response.status} ${response.statusText}`);
    const errorText = await response.text();
    console.error("Raw Error Response:", errorText);
    
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.error?.message || "Cloudinary upload failed");
    } catch (e) {
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }
  }

  const data = await response.json();
  return data.secure_url;
};