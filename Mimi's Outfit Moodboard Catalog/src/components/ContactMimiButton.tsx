/**
 * Contact Mimi Button
 * Provides multiple contact options for direct purchase inquiries
 * - Text Message (SMS with pre-filled message)
 * - WhatsApp (with styled formatted message)
 * - Email (mailto with product details)
 */

import React, { useState } from 'react';
import { MessageCircle, MessageSquare, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types';

interface ContactMimiButtonProps {
  product: Product;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export default function ContactMimiButton({
  product,
  variant = 'default',
  size = 'lg',
  className = '',
}: ContactMimiButtonProps) {
  const { toast } = useToast();
  const [isOpening, setIsOpening] = useState(false);

  // Format message for WhatsApp/SMS
  const formatPurchaseMessage = () => {
    let message = `Hi Mimi! 👋\n\n`;
    message += `I'm interested in purchasing from your collection:\n\n`;
    message += `*${product.brand ? `${product.brand} ` : ''}${product.name}*\n\n`;
    
    if (product.description) {
      message += `${product.description}\n\n`;
    }
    
    if (product.price) {
      message += `💰 *Price:* $${product.price}\n\n`;
    }
    
    message += `🔗 Product link: ${window.location.href}\n\n`;
    message += `Is this item currently available? 💼`;
    
    return message;
  };

  // Format email subject and body
  const formatEmailDetails = () => {
    const subject = `Inquiry: ${product.brand ? `${product.brand} ` : ''}${product.name}`;
    
    let body = `Hi Mimi,\n\n`;
    body += `I'm interested in purchasing the following item from your collection:\n\n`;
    body += `Product: ${product.brand ? `${product.brand} ` : ''}${product.name}\n`;
    
    if (product.price) {
      body += `Price: $${product.price}\n`;
    }
    
    if (product.description) {
      body += `Description: ${product.description}\n`;
    }
    
    body += `Product Link: ${window.location.href}\n\n`;
    body += `Is this item currently available? I'd love to know more about it.\n\n`;
    body += `Thank you!\n`;
    
    return { subject, body };
  };

  // Option 1: Text Message (SMS)
  const handleTextMessage = () => {
    setIsOpening(true);
    const text = formatPurchaseMessage();
    const encodedText = encodeURIComponent(text);
    
    // Get phone number from environment variable
    const phoneNumber = import.meta.env.VITE_MIMI_PHONE || '15551234567';
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Mobile: sms:NUMBER?&body=TEXT (iOS) or sms:NUMBER?body=TEXT (Android)
      const separator = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? '&' : '';
      window.location.href = `sms:${phoneNumber}?${separator}body=${encodedText}`;
      
      toast({
        title: 'Opening Messages...',
        description: 'Pre-filled with product details',
      });
    } else {
      // Desktop: Copy phone number to clipboard
      navigator.clipboard.writeText(phoneNumber);
      toast({
        title: 'Phone Number Copied!',
        description: `Text Mimi at: ${phoneNumber}`,
      });
    }
    
    setIsOpening(false);
  };

  // Option 2: WhatsApp (with styled formatting)
  const handleWhatsApp = () => {
    setIsOpening(true);
    const text = formatPurchaseMessage();
    const encodedText = encodeURIComponent(text);
    
    // Get WhatsApp number from environment variable
    const whatsappNumber = import.meta.env.VITE_MIMI_WHATSAPP || '15551234567';
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Mobile: Open WhatsApp app with pre-filled styled message
      window.location.href = `whatsapp://send?phone=${whatsappNumber}&text=${encodedText}`;
    } else {
      // Desktop: Open WhatsApp Web with styled message
      window.open(`https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedText}`, '_blank');
    }
    
    toast({
      title: 'Opening WhatsApp...',
      description: 'Contact Mimi about this product',
    });
    
    setIsOpening(false);
  };

  // Option 3: Email (mailto with product details)
  const handleEmail = () => {
    setIsOpening(true);
    const { subject, body } = formatEmailDetails();
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    
    // Get email from environment variable
    const email = import.meta.env.VITE_MIMI_EMAIL || 'hello@thelookbookbymimi.com';
    
    // Open default email client
    window.location.href = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
    
    toast({
      title: 'Opening Email...',
      description: 'Pre-filled with product details',
    });
    
    setIsOpening(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          disabled={isOpening}
          className={className}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Contact Mimi to Purchase
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        <DropdownMenuItem
          onClick={handleTextMessage}
          disabled={isOpening}
          className="cursor-pointer"
        >
          <MessageSquare className="mr-2 h-4 w-4 text-blue-600" />
          <span>Text Message (SMS)</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={handleWhatsApp}
          disabled={isOpening}
          className="cursor-pointer"
        >
          <MessageCircle className="mr-2 h-4 w-4 text-green-600" />
          <span>WhatsApp</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={handleEmail}
          disabled={isOpening}
          className="cursor-pointer"
        >
          <Mail className="mr-2 h-4 w-4 text-accent" />
          <span>Email</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
