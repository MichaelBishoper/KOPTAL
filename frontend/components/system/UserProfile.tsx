"use client";

import { useState } from "react";
import Image from "next/image";
import { readImageFileAsDataUrl, saveUserProfileDraft } from "@/lib";
import { AdminRow, CustomerRow, TenantRow } from "@/structure/db";

type UserType = "customer" | "tenant" | "admin" | "guest";

interface UserProfileProps {
  user: AdminRow | CustomerRow | TenantRow | null;
  userType: UserType;
  onLogout?: () => void;
  loggingOut?: boolean;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
      <p className="text-lg font-semibold text-gray-800 mt-1 break-all">{value || "—"}</p>
    </div>
  );
}

function EditField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 uppercase font-semibold">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
      />
    </div>
  );
}

export function UserProfile({ user, userType, onLogout, loggingOut }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No user data available</p>
      </div>
    );
  }

  const joinDate = user.created_at ? new Date(user.created_at) : null;
  const joinYear = joinDate && !isNaN(joinDate.getTime()) ? joinDate.getFullYear() : null;
  const joinMonth = joinDate && !isNaN(joinDate.getTime()) ? joinDate.toLocaleString("en-US", { month: "short" }) : null;

  const get = (key: string) =>
    isEditing ? (draft[key] ?? String((user as Record<string, unknown>)[key] ?? "")) : String((user as Record<string, unknown>)[key] ?? "");

  const handleEdit = () => {
    setDraft({});
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveUserProfileDraft(user, draft);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    void readImageFileAsDataUrl(file)
      .then((imageDataUrl) => {
        setDraft((prev) => ({ ...prev, image: imageDataUrl }));
      })
      .catch(() => {
        // Keep current image if the upload cannot be read.
      });

    // Allow selecting the same file again.
    event.currentTarget.value = "";
  };

  const handleCancel = () => {
    setDraft({});
    setIsEditing(false);
  };

  const storedProfileImage = "image" in user && typeof user.image === "string" ? user.image : undefined;
  const profileImageSrc = (isEditing ? draft.image : undefined) || storedProfileImage || "/product-placeholder.jpg";

  return (
    <div className="bg-white rounded-lg p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side - Image */}
        <div className="flex flex-col items-center">
          <div className="relative w-60 h-60 mb-4">
            <Image
              src={profileImageSrc}
              alt={user.name}
              fill
              className="object-cover rounded-full border-4 border-[#01A49E]"
            />
          </div>
          {isEditing && (
            <label className="mb-3 inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
              Change Image
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                className="hidden"
              />
            </label>
          )}
          <h2 className="text-xl font-bold text-gray-800 text-center">{get("name")}</h2>
          <p className="text-sm text-gray-500 capitalize mt-1">
            {userType === "admin" ? "Manager" : userType}
          </p>
        </div>

        {/* Middle & Right - Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit / Save / Cancel */}
          <div className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-[#01A49E] px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  className="rounded-lg border border-teal-600 px-4 py-2 text-sm font-semibold text-teal-600 hover:bg-teal-50 transition-colors"
                >
                  Edit Profile
                </button>
                {onLogout ? (
                  <button
                    onClick={onLogout}
                    disabled={loggingOut}
                    className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {loggingOut ? "Signing out..." : "Sign Out"}
                  </button>
                ) : null}
              </>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <Field label="Join Date" value={joinMonth && joinYear ? `${joinMonth} ${joinYear}` : "—"} />

            {isEditing ? (
              <EditField label="Email" name="email" value={get("email")} onChange={handleChange} />
            ) : (
              <Field label="Email" value={get("email")} />
            )}

            {isEditing ? (
              <EditField label="Name" name="name" value={get("name")} onChange={handleChange} />
            ) : (
              <Field label="Name" value={get("name")} />
            )}

            {isEditing ? (
              <EditField label="Phone" name="phone" value={get("phone")} onChange={handleChange} />
            ) : (
              <Field label="Phone" value={get("phone")} />
            )}

            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Account Type</p>
              <p className="text-lg font-semibold text-[#01A49E] capitalize mt-1">
                {userType === "admin" ? "Manager" : userType}
              </p>
            </div>
          </div>

          {/* Role-Specific Details */}
          {userType === "customer" && (
            <CustomerDetails customer={user as CustomerRow} isEditing={isEditing} get={get} onChange={handleChange} />
          )}
          {userType === "tenant" && (
            <TenantDetails tenant={user as TenantRow} isEditing={isEditing} get={get} onChange={handleChange} />
          )}
        </div>
      </div>
    </div>
  );
}

/* Customer Details */
function CustomerDetails({
  customer,
  isEditing,
  get,
  onChange,
}: {
  customer: CustomerRow;
  isEditing: boolean;
  get: (key: string) => string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="border-t pt-6">
      <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Business Information</h3>
      <div className="grid grid-cols-1 gap-4">
        {isEditing ? (
          <EditField label="Company" name="company" value={get("company")} onChange={onChange} />
        ) : (
          <Field label="Company" value={customer.company || "Not provided"} />
        )}
        <Field label="Tax ID" value={customer.tax_id || "Not provided"} />
      </div>

      <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 mt-6">Addresses</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isEditing ? (
          <EditField label="Billing Address" name="billing_address" value={get("billing_address")} onChange={onChange} />
        ) : (
          <Field label="Billing Address" value={customer.billing_address} />
        )}
        {isEditing ? (
          <EditField label="Shipping Address" name="shipping_address" value={get("shipping_address")} onChange={onChange} />
        ) : (
          <Field label="Shipping Address" value={customer.shipping_address} />
        )}
      </div>
    </div>
  );
}

/* Tenant Details */
function TenantDetails({
  tenant,
  isEditing,
  get,
  onChange,
}: {
  tenant: TenantRow;
  isEditing: boolean;
  get: (key: string) => string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const verificationBadge = tenant.verified ? (
    <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
      ✓ Verified
    </span>
  ) : (
    <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
      ⏱ Pending Verification
    </span>
  );

  return (
    <div className="border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-700 uppercase">Shop Status</h3>
        {verificationBadge}
      </div>

      <div className="space-y-4">
        <div className="flex-1">
          {isEditing ? (
            <EditField label="Location" name="location" value={get("location")} onChange={onChange} />
          ) : (
            <Field label="Location" value={tenant.location || "Not specified"} />
          )}
        </div>
      </div>
    </div>
  );
}

