"use client";
import React from "react";
import { Calendar, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileSummaryCardProps } from "./types";

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  profile,
  status,
  session,
  onEditClick,
  onAvatarRefresh,
}) => {
  if (!profile) return null;

  const contactInfo = [
    { icon: Mail, text: profile.email },
    { icon: Phone, text: profile.phone },
    { icon: MapPin, text: profile.location },
    {
      icon: Calendar,
      text: `Joined ${
        status === "authenticated"
          ? new Date().toLocaleDateString()
          : profile.joinDate
      }`,
    },
  ];

  return (
    <div className="rounded-lg bg-card p-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={profile.image}
        alt=""
        width={80}
        height={80}
        className="h-20 w-20 rounded-full object-cover"
      />

      <h2 className="mt-6 font-display text-3xl tracking-display text-foreground">
        {profile.name}
      </h2>
      <p className="mt-2 text-sm leading-relaxed tracking-tightish text-muted-foreground">
        {profile.bio}
      </p>

      <dl className="mt-8 space-y-3 border-t border-border pt-8">
        {contactInfo.map(({ icon: Icon, text }, i) => (
          <div key={i} className="flex items-center gap-3">
            <Icon
              className="h-4 w-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
              aria-hidden
            />
            <dd className="truncate text-sm tracking-tightish text-muted-foreground">
              {text}
            </dd>
          </div>
        ))}
      </dl>

      <Button
        variant="outline"
        size="sm"
        className="mt-8 w-full"
        onClick={session ? onEditClick : onAvatarRefresh}
      >
        {session ? "Edit profile" : "New avatar"}
      </Button>
    </div>
  );
};
