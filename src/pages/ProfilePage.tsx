/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import {
  Sparkles,
  MapPin,
  Ruler,
  Palette,
  Save,
  User as UserIcon,
} from "lucide-react";

export function ProfilePage() {
  const { user, updateUser, showToast } = useApp();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [location, setLocation] = useState(user.location);
  const [bio, setBio] = useState(user.bio);
  const [topSize, setTopSize] = useState("IT 40 / FR 36");
  const [bottomSize, setBottomSize] = useState('IT 38 / 26"');
  const [shoeSize, setShoeSize] = useState("EU 38.5");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updateUser({
        name,
        email,
        location,
        bio,
      });
      showToast({
        title: "Profile Updated",
        description:
          "Your sartorial profile and sizing calibrations have been saved.",
        type: "success",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header */}
      <div className="pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase font-semibold tracking-wider text-emerald-500">
            Client Profile
          </span>
          <span className="text-gray-400">·</span>
          <span className="text-xs text-gray-600 font-mono">
            Role: {user.role}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 font-editorial">
          Sartorial Identity & Calibration
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Manage your personal style archetype, sizing metrics, and concierge
          styling preferences.
        </p>
      </div>

      {/* 2. Profile Card */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-gray-200">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500 bg-white">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <UserIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-gray-50">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {user.name}
                </h3>
                <Badge variant="gold" size="sm">
                  VIP Atelier Member
                </Badge>
              </div>
              <p className="text-xs text-gray-600 font-mono">{user.email}</p>
              <p className="text-xs text-gray-500">
                Member since {new Date(user.joinedDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Core Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Input
              label="Primary Styling Base / City"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
            />
            <Input
              label="Personal Sartorial Philosophy / Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </Card>

        {/* Sizing Calibration Card */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
            <Ruler className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-gray-900">
              Sizing Calibration & Fit
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Tops / Outerwear Size"
              value={topSize}
              onChange={(e) => setTopSize(e.target.value)}
            />
            <Input
              label="Trousers / Bottoms Size"
              value={bottomSize}
              onChange={(e) => setBottomSize(e.target.value)}
            />
            <Input
              label="Footwear (EU / US)"
              value={shoeSize}
              onChange={(e) => setShoeSize(e.target.value)}
            />
          </div>
        </Card>

        {/* Style Preferences Display */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
            <Palette className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-gray-900">
              Aesthetic Palette & Signature Fits
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-gray-500 block mb-1.5 font-medium">
                Dominant Color Palette
              </span>
              <div className="flex flex-wrap gap-2">
                {user.preferences.favoriteColors.map((c) => (
                  <Badge key={c} variant="subtle" size="sm">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <span className="text-gray-500 block mb-1.5 font-medium">
                Preferred Silhouettes
              </span>
              <div className="flex flex-wrap gap-2">
                {user.preferences.preferredFits.map((f) => (
                  <Badge key={f} variant="gold" size="sm">
                    {`${f} Fit`}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Sartorial Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
