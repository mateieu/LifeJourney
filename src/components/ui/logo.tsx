import React from 'react';
import { Heart } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  linkClassName?: string;
}

export function Logo({ className, linkClassName }: LogoProps) {
  return (
    <Link href="/" className={linkClassName || "flex items-center"}>
      <div className={`bg-green-100 p-2 rounded-full mr-2 ${className}`}>
        <Heart className="h-5 w-5 text-green-600" />
      </div>
      <span className="text-xl font-bold">HealthQuest</span>
    </Link>
  );
} 