// ProfilePhotoUpload.tsx - Modern version with content moderation
// Replaces your existing ProfilePhotoUpload component

import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, AlertTriangle, CheckCircle, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageCropper } from './ImageCropper';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  userId: string;
  onPhotoUpdate: (url: string) => void;
  userName?: string;
}

type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhotoUrl,
  userId,
  onPhotoUpdate,
  userName
}) => {
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Moderation states
  const [isModerating, setIsModerating] = useState(false);
  const [moderationStatus, setModerationStatus] = useState<ModerationStatus | null>(null);
  const [moderationMessage, setModerationMessage] = useState('');
  
  // UI states
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file type and size
  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)';
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }
    
    return null;
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file);
  };

  // Process file (validation + preview)
  const processFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle crop completion and upload
  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      // Step 1: Upload to Supabase Storage
      const fileName = `${userId}-${Date.now()}.jpg`;
      const filePath = `avatars/${fileName}`;
      
      setUploadProgress(30);
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob, { 
          contentType: 'image/jpeg', 
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Step 2: Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('✅ Image uploaded:', publicUrl);
      setUploadProgress(60);

      // Step 3: Moderate the image
      setIsModerating(true);
      setUploadProgress(70);
      
      console.log('🔍 Starting content moderation...');

      // Call moderation Edge Function
      // Use 'moderate-profile-image' for PAID version or 'validate-profile-image' for FREE version
      const { data: moderationResult, error: moderationError } = await supabase.functions.invoke('moderate-profile-image', {
        body: {
          image_url: publicUrl,
          user_id: userId
        }
      });

      setUploadProgress(90);
      setIsModerating(false);

      // Handle moderation error (non-blocking)
      if (moderationError) {
        console.error('⚠️ Moderation error:', moderationError);
        // Still update profile but flag for manual review
        await updateProfile(publicUrl, 'pending');
        setModerationStatus('pending');
        setModerationMessage('Image uploaded - pending manual review');
        toast.warning('Photo uploaded but pending review');
        setUploadProgress(100);
        return;
      }

      console.log('📊 Moderation result:', moderationResult);

      // Handle moderation result
      if (moderationResult.status === 'rejected') {
        // Delete the uploaded image
        await supabase.storage.from('avatars').remove([filePath]);
        
        setModerationStatus('rejected');
        setModerationMessage(moderationResult.reason || 'Image rejected due to inappropriate content');
        toast.error(`Image rejected: ${moderationResult.reason}`);
        setUploadProgress(0);
        return;
      }

      if (moderationResult.status === 'flagged') {
        await updateProfile(publicUrl, 'flagged');
        setModerationStatus('flagged');
        setModerationMessage('Image uploaded but flagged for review');
        toast.warning('Photo uploaded - under review');
      } else {
        // Approved!
        await updateProfile(publicUrl, 'approved');
        setModerationStatus('approved');
        setModerationMessage('Image approved and updated');
        toast.success('Profile photo updated successfully!');
      }

      setUploadProgress(100);
      onPhotoUpdate(publicUrl);
      
      // Close cropper after short delay
      setTimeout(() => {
        setShowCropper(false);
        setSelectedImage(null);
        setUploadProgress(0);
        setModerationStatus(null);
      }, 2000);

    } catch (error: any) {
      console.error('❌ Upload error:', error);
      toast.error('Failed to upload photo: ' + error.message);
      setModerationStatus('rejected');
      setModerationMessage(error.message);
    } finally {
      setIsUploading(false);
      setIsModerating(false);
    }
  };

  // Update profile with moderation status
  const updateProfile = async (avatarUrl: string, moderationStatus: ModerationStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        avatar: avatarUrl,
        avatar_moderation_status: moderationStatus,
        avatar_moderated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Delete current photo
  const handleDeletePhoto = async () => {
    try {
      // Update profile to remove avatar
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar: null,
          avatar_moderation_status: null,
          avatar_moderated_at: null
        })
        .eq('id', userId);

      if (error) throw error;

      // Optional: Delete from storage (uncomment if you want to delete old files)
      // if (currentPhotoUrl) {
      //   const fileName = currentPhotoUrl.split('/').pop();
      //   if (fileName) {
      //     await supabase.storage.from('avatars').remove([`avatars/${fileName}`]);
      //   }
      // }

      onPhotoUpdate('');
      toast.success('Profile photo removed');
      setShowDeleteConfirm(false);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to remove photo');
    }
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  // Paste from clipboard
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            processFile(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        {/* Avatar with drag & drop */}
        <div 
          className={`relative ${dragActive ? 'ring-4 ring-blue-400 ring-offset-2' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Avatar className="w-32 h-32">
            <AvatarImage src={currentPhotoUrl} />
            <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {userName?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          {/* Upload button */}
          <Button
            size="icon"
            className="absolute bottom-0 right-0 rounded-full shadow-lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isModerating}
          >
            {isUploading || isModerating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </Button>

          {/* Delete button (only if photo exists) */}
          {currentPhotoUrl && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 rounded-full shadow-lg h-8 w-8"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isUploading || isModerating}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Upload instructions */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">
            Click camera icon, drag & drop, or paste to upload
          </p>
          <p className="text-xs text-gray-500">
            Max 5MB • JPG, PNG, WebP, GIF
          </p>
        </div>

        {/* Content policy notice */}
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Content Policy:</strong> All photos are screened for inappropriate content. 
            Images with nudity, offensive content, or violations will be automatically rejected.
          </AlertDescription>
        </Alert>
      </div>

      {/* Crop Dialog */}
      <Dialog open={showCropper} onOpenChange={setShowCropper}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crop & Upload Profile Photo</DialogTitle>
          </DialogHeader>
          
          {selectedImage && (
            <div className="space-y-4">
              <ImageCropper
                image={selectedImage}
                onCropComplete={handleCropComplete}
                onCancel={() => {
                  setShowCropper(false);
                  setSelectedImage(null);
                  setUploadProgress(0);
                }}
              />

              {/* Upload progress */}
              {(isUploading || isModerating) && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-center text-gray-600">
                    {isModerating ? '🔍 Checking content...' : `📤 Uploading... ${uploadProgress}%`}
                  </p>
                </div>
              )}

              {/* Moderation status */}
              {moderationStatus && (
                <Alert className={
                  moderationStatus === 'approved' ? 'border-green-500 bg-green-50' :
                  moderationStatus === 'rejected' ? 'border-red-500 bg-red-50' :
                  moderationStatus === 'flagged' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }>
                  {moderationStatus === 'approved' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {moderationStatus === 'rejected' && <X className="h-4 w-4 text-red-600" />}
                  {moderationStatus === 'flagged' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                  <AlertDescription className="text-sm">
                    {moderationMessage}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Profile Photo?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to remove your profile photo? You can always upload a new one later.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeletePhoto}
              >
                Remove Photo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
