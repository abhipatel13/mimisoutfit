import React, { useState } from 'react';
import { Share2, MessageCircle, Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  title: string;
  description?: string;
  price?: string;
  imageUrl?: string;
  url: string;
  type: 'product' | 'moodboard';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  className?: string;
}

export default function ShareButton({
  title,
  description,
  price,
  imageUrl,
  url,
  type,
  variant = 'outline',
  size = 'default',
  showLabel = true,
  className = '',
}: ShareButtonProps) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  // Format WhatsApp message with styled text
  const formatWhatsAppMessage = () => {
    let message = `*${title}*\n\n`;
    
    if (description) {
      message += `${description}\n\n`;
    }
    
    if (price) {
      message += `💰 *Price:* ${price}\n\n`;
    }
    
    message += `🔗 View here: ${url}`;
    
    return message;
  };

  // Share to WhatsApp with styled text formatting
  const handleWhatsAppShare = async () => {
    setIsSharing(true);
    const text = formatWhatsAppMessage();

    try {
      // Always use WhatsApp URL scheme to preserve text formatting (bold, etc.)
      // Web Share API doesn't support WhatsApp's markdown-style formatting
      const encodedText = encodeURIComponent(text);
      
      // Detect mobile vs desktop
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Mobile: Open WhatsApp app with formatted text
        window.location.href = `whatsapp://send?text=${encodedText}`;
      } else {
        // Desktop: Open WhatsApp Web
        window.open(`https://web.whatsapp.com/send?text=${encodedText}`, '_blank');
      }
      
      toast({
        title: 'Opening WhatsApp...',
        description: 'Share with styled formatting',
      });
    } catch (err) {
      console.error('Share failed:', err);
      
      // Fallback: Try standard WhatsApp URL
      const encodedText = encodeURIComponent(text);
      window.open(`https://wa.me/?text=${encodedText}`, '_blank');
      
      toast({
        title: 'Opening WhatsApp...',
        description: 'Sharing as text with link',
        variant: 'default',
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Generic share using Web Share API
  const handleNativeShare = async () => {
    setIsSharing(true);
    
    try {
      if (!navigator.share) {
        throw new Error('Web Share API not supported');
      }

      const shareData: ShareData = {
        title,
        text: description || title,
        url,
      };

      // Try to include image if supported
      if (imageUrl) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], `${type}-${Date.now()}.jpg`, { type: blob.type });
          
          if (navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          }
        } catch (err) {
          console.error('Failed to fetch image for sharing:', err);
        }
      }

      await navigator.share(shareData);
      
      toast({
        title: 'Shared successfully!',
        description: 'Your content has been shared',
      });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err);
        toast({
          title: 'Share failed',
          description: 'Unable to share at this time',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied!',
        description: 'The link has been copied to your clipboard',
      });
    } catch (err) {
      console.error('Copy failed:', err);
      toast({
        title: 'Copy failed',
        description: 'Unable to copy link',
        variant: 'destructive',
      });
    }
  };

  // Check if native share is available
  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          disabled={isSharing}
          className={className}
        >
          <Share2 className="h-4 w-4" />
          {showLabel && size !== 'icon' && (
            <span className="ml-2">Share</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Primary: Native Web Share API (shows system share sheet) */}
        {hasNativeShare && (
          <DropdownMenuItem
            onClick={handleNativeShare}
            disabled={isSharing}
            className="cursor-pointer"
          >
            <Share2 className="mr-2 h-4 w-4" />
            <span>Share...</span>
          </DropdownMenuItem>
        )}
        
        {/* WhatsApp-specific share with formatted message */}
        <DropdownMenuItem
          onClick={handleWhatsAppShare}
          disabled={isSharing}
          className="cursor-pointer"
        >
          <MessageCircle className="mr-2 h-4 w-4 text-green-600" />
          <span>Share to WhatsApp</span>
        </DropdownMenuItem>
        
        {/* Fallback: Copy link */}
        <DropdownMenuItem
          onClick={handleCopyLink}
          className="cursor-pointer"
        >
          <Link2 className="mr-2 h-4 w-4" />
          <span>Copy Link</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
