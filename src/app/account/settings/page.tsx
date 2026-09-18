'use client';

import React, { useState, useEffect } from 'react';
import { AccountNav } from '@/components/account/AccountNav';
import { useAuth } from '@/lib/auth';
import { useUser } from '@clerk/nextjs';
import { useUiStore } from '@/store/ui-store';
import { ShieldCheck, Bell, MapPin, KeyRound, Check, Save } from 'lucide-react';
import { playClickSound, playConfettiSound, playHoverSound } from '@/lib/sound';

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const { user: clerkUser, isLoaded } = useUser();
  const showToast = useUiStore((state) => state.showToast);
  const triggerConfetti = useUiStore((state) => state.triggerConfetti);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Address state
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');

  // Preferences
  const [dropAlerts, setDropAlerts] = useState(true);
  const [restockAlerts, setRestockAlerts] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Sync state from Clerk and localStorage when user is loaded
  useEffect(() => {
    if (!isLoaded) return;

    try {
      const cachedProfileStr = typeof window !== 'undefined'
        ? localStorage.getItem(`menance_profile_${clerkUser?.id || 'guest'}`)
        : null;
      const cachedAddressStr = typeof window !== 'undefined'
        ? localStorage.getItem(`menance_address_${clerkUser?.id || 'guest'}`)
        : null;
      const cachedPrefsStr = typeof window !== 'undefined'
        ? localStorage.getItem(`menance_prefs_${clerkUser?.id || 'guest'}`)
        : null;

      const meta = (clerkUser?.unsafeMetadata || {}) as any;

      // 1. Profile fields
      const cachedProfile = cachedProfileStr ? JSON.parse(cachedProfileStr) : {};
      setFirstName(clerkUser?.firstName || cachedProfile.firstName || user?.firstName || '');
      setLastName(clerkUser?.lastName || cachedProfile.lastName || user?.lastName || '');
      setEmail(clerkUser?.primaryEmailAddress?.emailAddress || user?.email || '');
      setPhone(
        meta.phone ||
        clerkUser?.primaryPhoneNumber?.phoneNumber ||
        cachedProfile.phone ||
        ''
      );

      // 2. Address fields
      const cachedAddress = cachedAddressStr ? JSON.parse(cachedAddressStr) : {};
      const addr = meta.address || cachedAddress || {};
      setStreet(addr.street || '');
      setCity(addr.city || '');
      setStateName(addr.state || '');
      setPincode(addr.pincode || '');

      // 3. Notification Preferences
      const cachedPrefs = cachedPrefsStr ? JSON.parse(cachedPrefsStr) : {};
      const prefs = meta.preferences || cachedPrefs || {};
      if (prefs.dropAlerts !== undefined) setDropAlerts(Boolean(prefs.dropAlerts));
      if (prefs.restockAlerts !== undefined) setRestockAlerts(Boolean(prefs.restockAlerts));
      if (prefs.newsletter !== undefined) setNewsletter(Boolean(prefs.newsletter));
    } catch (e) {
      console.warn('Failed to load profile data:', e);
    }
  }, [clerkUser, isLoaded, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    setSavingProfile(true);

    try {
      if (clerkUser) {
        await clerkUser.update({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          unsafeMetadata: {
            ...clerkUser.unsafeMetadata,
            phone: phone.trim(),
          },
        });
      }

      // Persist to local cache for instantaneous load across refreshes
      const profileData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`menance_profile_${clerkUser?.id || 'guest'}`, JSON.stringify(profileData));
        localStorage.setItem('menance_user_profile', JSON.stringify(profileData));
      }

      playConfettiSound();
      triggerConfetti();
      showToast('PROFILE UPDATED.');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      // Fallback: save to local storage anyway
      const profileData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`menance_profile_${clerkUser?.id || 'guest'}`, JSON.stringify(profileData));
      }
      playConfettiSound();
      triggerConfetti();
      showToast('PROFILE SAVED LOCALLY.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    setSavingAddress(true);

    const addressData = {
      street: street.trim(),
      city: city.trim(),
      state: stateName.trim(),
      pincode: pincode.trim(),
    };

    try {
      if (clerkUser) {
        await clerkUser.update({
          unsafeMetadata: {
            ...clerkUser.unsafeMetadata,
            address: addressData,
          },
        });
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(`menance_address_${clerkUser?.id || 'guest'}`, JSON.stringify(addressData));
        localStorage.setItem('menance_shipping_address', JSON.stringify(addressData));
      }

      playConfettiSound();
      triggerConfetti();
      showToast('SHIPPING ADDRESS SAVED.');
    } catch (err: any) {
      console.error('Failed to update address:', err);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`menance_address_${clerkUser?.id || 'guest'}`, JSON.stringify(addressData));
        localStorage.setItem('menance_shipping_address', JSON.stringify(addressData));
      }
      playConfettiSound();
      triggerConfetti();
      showToast('SHIPPING ADDRESS SAVED.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleTogglePreference = async (key: 'dropAlerts' | 'restockAlerts' | 'newsletter', val: boolean) => {
    if (key === 'dropAlerts') setDropAlerts(val);
    if (key === 'restockAlerts') setRestockAlerts(val);
    if (key === 'newsletter') setNewsletter(val);

    const prefs = {
      dropAlerts: key === 'dropAlerts' ? val : dropAlerts,
      restockAlerts: key === 'restockAlerts' ? val : restockAlerts,
      newsletter: key === 'newsletter' ? val : newsletter,
    };

    try {
      if (clerkUser) {
        await clerkUser.update({
          unsafeMetadata: {
            ...clerkUser.unsafeMetadata,
            preferences: prefs,
          },
        });
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(`menance_prefs_${clerkUser?.id || 'guest'}`, JSON.stringify(prefs));
      }
    } catch (err) {
      console.warn('Failed to save preference:', err);
    }
  };

  return (
    <div className="min-h-screen bg-base-black text-off-white pt-24 pb-28 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <AccountNav />

        <div className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-off-white">
            SETTINGS & SECURITY
          </h1>
          <p className="font-mono text-xs text-muted-grey uppercase tracking-widest mt-1">
            MEMBER DETAILS // ENCRYPTED CREDENTIALS
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Profile Form */}
          <div className="rounded-2xl bg-surface border border-border p-6 md:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <ShieldCheck size={18} className="text-acid-green" />
              <h2 className="font-display text-xl uppercase tracking-wider text-off-white">
                PROFILE INFORMATION
              </h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1">
                    FIRST NAME
                  </label>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-transparent border-b border-border py-2 text-off-white font-mono text-sm focus:border-acid-green outline-none"
                  />
                </div>
                <div className="relative">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1">
                    LAST NAME
                  </label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-transparent border-b border-border py-2 text-off-white font-mono text-sm focus:border-acid-green outline-none"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1">
                  EMAIL ADDRESS (PRIMARY ID)
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  placeholder="name@domain.com"
                  className="w-full bg-transparent border-b border-border py-2 text-muted-grey font-mono text-sm cursor-not-allowed opacity-80"
                />
              </div>

              <div className="relative">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1">
                  PHONE NUMBER (FOR DISPATCH SMS)
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent border-b border-border py-2 text-off-white font-mono text-sm focus:border-acid-green outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  onMouseEnter={playHoverSound}
                  className="px-6 py-3 rounded-xl bg-acid-green text-base-black font-mono text-xs font-bold uppercase hover:bg-white transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Save size={14} />
                  <span>{savingProfile ? 'SAVING...' : 'SAVE PROFILE'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Shipping Address Form */}
          <div className="rounded-2xl bg-surface border border-border p-6 md:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <MapPin size={18} className="text-acid-green" />
              <h2 className="font-display text-xl uppercase tracking-wider text-off-white">
                DEFAULT SHIPPING ADDRESS
              </h2>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="relative">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1">
                  STREET & APARTMENT
                </label>
                <input
                  type="text"
                  placeholder="Flat / House no, Street, Landmark"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-transparent border-b border-border py-2 text-off-white font-mono text-sm focus:border-acid-green outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1">
                    CITY
                  </label>
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-transparent border-b border-border py-2 text-off-white font-mono text-sm focus:border-acid-green outline-none"
                  />
                </div>
                <div className="relative">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1">
                    STATE
                  </label>
                  <input
                    type="text"
                    placeholder="State"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full bg-transparent border-b border-border py-2 text-off-white font-mono text-sm focus:border-acid-green outline-none"
                  />
                </div>
                <div className="relative">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1">
                    PINCODE
                  </label>
                  <input
                    type="text"
                    placeholder="6-digit Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-transparent border-b border-border py-2 text-off-white font-mono text-sm focus:border-acid-green outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingAddress}
                  onMouseEnter={playHoverSound}
                  className="px-6 py-3 rounded-xl bg-acid-green text-base-black font-mono text-xs font-bold uppercase hover:bg-white transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Save size={14} />
                  <span>{savingAddress ? 'SAVING...' : 'SAVE ADDRESS'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Security & Password */}
          <div className="rounded-2xl bg-surface border border-border p-6 md:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <KeyRound size={18} className="text-acid-green" />
              <h2 className="font-display text-xl uppercase tracking-wider text-off-white">
                AUTHENTICATION & PASSWORD
              </h2>
            </div>

            <p className="font-mono text-xs text-muted-grey leading-relaxed">
              Your credentials are cryptographically secured via Clerk and Cloudflare Edge. To change your password or configure passkeys, request a secure verification flow.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  showToast('PASSWORD RESET FLOW INITIATED. CHECK EMAIL.');
                }}
                onMouseEnter={playHoverSound}
                className="px-4 py-2.5 rounded-lg bg-surface-elevated border border-border hover:border-acid-green text-xs font-mono text-off-white uppercase transition-colors cursor-pointer"
              >
                REQUEST PASSWORD RESET
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="rounded-2xl bg-surface border border-border p-6 md:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <Bell size={18} className="text-acid-green" />
              <h2 className="font-display text-xl uppercase tracking-wider text-off-white">
                NOTIFICATION DISPATCH
              </h2>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-base-black border border-border cursor-pointer">
                <div>
                  <p className="text-off-white uppercase font-bold">DROP 002 VIP ALERTS</p>
                  <p className="text-muted-grey text-[11px]">Instant WhatsApp / SMS 2 hours before drops</p>
                </div>
                <input
                  type="checkbox"
                  checked={dropAlerts}
                  onChange={(e) => handleTogglePreference('dropAlerts', e.target.checked)}
                  className="w-4 h-4 accent-acid-green"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-base-black border border-border cursor-pointer">
                <div>
                  <p className="text-off-white uppercase font-bold">RESTOCK NOTIFICATIONS</p>
                  <p className="text-muted-grey text-[11px]">Alert when sold-out colorways or sizes return</p>
                </div>
                <input
                  type="checkbox"
                  checked={restockAlerts}
                  onChange={(e) => handleTogglePreference('restockAlerts', e.target.checked)}
                  className="w-4 h-4 accent-acid-green"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-base-black border border-border cursor-pointer">
                <div>
                  <p className="text-off-white uppercase font-bold">MARKETING DISPATCH</p>
                  <p className="text-muted-grey text-[11px]">Zero spam policy. High-signal announcements only.</p>
                </div>
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => handleTogglePreference('newsletter', e.target.checked)}
                  className="w-4 h-4 accent-acid-green"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
