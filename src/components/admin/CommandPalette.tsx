'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Boxes,
  Tag,
  BarChart3,
  Settings,
  Plus,
  ExternalLink,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions';
  shortcut?: string;
  icon: React.ComponentType<{ className?: string }>;
  perform: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const items: CommandItem[] = [
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      category: 'Navigation',
      shortcut: 'G D',
      icon: LayoutDashboard,
      perform: () => router.push('/admin'),
    },
    {
      id: 'nav-products',
      title: 'Go to Products',
      category: 'Navigation',
      shortcut: 'G P',
      icon: Package,
      perform: () => router.push('/admin/products'),
    },
    {
      id: 'nav-orders',
      title: 'Go to Orders',
      category: 'Navigation',
      shortcut: 'G O',
      icon: ShoppingBag,
      perform: () => router.push('/admin/orders'),
    },
    {
      id: 'nav-customers',
      title: 'Go to Customers',
      category: 'Navigation',
      shortcut: 'G C',
      icon: Users,
      perform: () => router.push('/admin/customers'),
    },
    {
      id: 'nav-inventory',
      title: 'Go to Inventory Tracker',
      category: 'Navigation',
      icon: Boxes,
      perform: () => router.push('/admin/inventory'),
    },
    {
      id: 'nav-discounts',
      title: 'Go to Discount Codes',
      category: 'Navigation',
      icon: Tag,
      perform: () => router.push('/admin/discounts'),
    },
    {
      id: 'nav-analytics',
      title: 'Go to Sales Analytics',
      category: 'Navigation',
      icon: BarChart3,
      perform: () => router.push('/admin/analytics'),
    },
    {
      id: 'nav-settings',
      title: 'Go to Store Settings',
      category: 'Navigation',
      icon: Settings,
      perform: () => router.push('/admin/settings'),
    },
    {
      id: 'act-new-product',
      title: 'Create New Product',
      category: 'Actions',
      shortcut: 'N',
      icon: Plus,
      perform: () => router.push('/admin/products/new'),
    },
    {
      id: 'act-view-store',
      title: 'Open Live Storefront',
      category: 'Actions',
      icon: ExternalLink,
      perform: () => window.open('/', '_blank'),
    },
  ];

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  // Keyboard shortcut listener for Cmd+K and G+key sequences
  useEffect(() => {
    let lastKey = '';
    let keyTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger G shortcuts if actively typing in an input
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Cmd+K or Ctrl+K opens palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        return;
      }

      if (isInput) return;

      // Sequence tracking: G then P, O, D, C
      if (e.key.toLowerCase() === 'g') {
        lastKey = 'g';
        clearTimeout(keyTimeout);
        keyTimeout = setTimeout(() => {
          lastKey = '';
        }, 1000);
        return;
      }

      if (lastKey === 'g') {
        const key = e.key.toLowerCase();
        if (key === 'p') {
          e.preventDefault();
          router.push('/admin/products');
        } else if (key === 'o') {
          e.preventDefault();
          router.push('/admin/orders');
        } else if (key === 'd') {
          e.preventDefault();
          router.push('/admin/');
        } else if (key === 'c') {
          e.preventDefault();
          router.push('/admin/customers');
        }
        lastKey = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(keyTimeout);
    };
  }, [isOpen, router]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = (item: CommandItem) => {
    setIsOpen(false);
    item.perform();
  };

  const handleArrowNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-xs transition-opacity duration-150">
      <div
        className="w-full max-w-lg bg-[#0F0F0F] border border-[#262626] rounded-lg shadow-2xl overflow-hidden text-[#F5F1E8]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#222]">
          <Search className="w-4 h-4 text-[#8A8A8A] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or jump to page... (Cmd+K)"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleArrowNav}
            className="w-full bg-transparent text-[13px] text-[#F5F1E8] placeholder-[#555] focus:outline-none"
          />
          <kbd className="text-[10px] font-mono text-[#666] bg-[#1A1A1A] px-1.5 py-0.5 rounded border border-[#2E2E2E]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-[#8A8A8A]">
              No commands found. Try &quot;products&quot; or &quot;orders&quot;.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2 rounded text-[13px] cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#1C1C1C] text-[#C6FF00]' : 'text-[#8A8A8A] hover:bg-[#141414] hover:text-[#F5F1E8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#C6FF00]' : 'text-[#8A8A8A]'}`} />
                    <span className="font-medium text-[#F5F1E8]">{item.title}</span>
                  </div>
                  {item.shortcut && (
                    <span className="text-[10px] font-mono text-[#666] bg-[#141414] px-1.5 py-0.5 rounded border border-[#262626]">
                      {item.shortcut}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-[#0A0A0A] border-t border-[#1C1C1C] flex items-center justify-between text-[11px] font-mono text-[#666]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>G+P Products • G+O Orders</span>
        </div>
      </div>
    </div>
  );
}
