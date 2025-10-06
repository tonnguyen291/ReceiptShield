"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
}

export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  buttonText,
  buttonLink,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <Icon className="empty-state-icon" />
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {buttonText && buttonLink && (
        <Button asChild className="origin-button">
          <Link href={buttonLink}>{buttonText}</Link>
        </Button>
      )}
    </div>
  );
}
