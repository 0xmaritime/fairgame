import Image from 'next/image';
import React from 'react';

interface ReviewImageProps {
  src: string;
  alt: string;
  [key: string]: any; // Allow other props like className
}

export function ReviewImage({ src, alt, ...props }: ReviewImageProps) {
  return (
      <Image
        src={src.startsWith('http') || src.startsWith('/') ? src : `/uploads/${src}`}
        alt={alt}
        className="aspect-video object-cover"
        {...props}
      />
  );
}
