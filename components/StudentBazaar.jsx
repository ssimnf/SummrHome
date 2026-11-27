'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Search,
  X,
  Phone,
  Send,
  Copy,
  Check,
  Upload,
  PackageOpen,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { getTownColleges, getTownNeighborhoods } from '@/data/locations';
import SafePhoto from '@/components/SafePhoto';

const CATEGORIES = [
  'All',
  'Books & Notes',
  'Electronics',
  'Furniture',
  'Cycles & Commute',
  'Room Essentials',
];

const SAMPLE_BAZAAR_PHOTOS = [
  { label: 'Study Table & Books', src: '/images/bazaar-desk.jpg' },
  { label: 'Kettle & Wi-Fi Router', src: '/images/bazaar-kettle.jpg' },
  { label: 'GATE Books & Lab Coat', src: '/images/bazaar-books.jpg' },
  { label: 'Study Chair & Mattress', src: '/images/bazaar-chair.jpg' },
  { label: 'Geared Bicycle', src: '/images/bazaar-cycle.jpg' },
  { label: 'Guitar & Cooler', src: '/images/bazaar-guitar.jpg' },
];

function PostAdModal({ onClose }) {
  const { currentUser, location, addBazaarItem } = useAppState();
  const activeCity = location?.city || 'Sreerampore';
  const neighborhoods = getTownNeighborhoods(activeCity);
  const colleges = getTownColleges(activeCity);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Books & Notes');
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState('500');
  const [condition, setCondition] = useState('Used');
  const [neighborhood, setNeighborhood] = useState(
    location?.neighborhood || neighborhoods[0]
  );
  const [collegeArea, setCollegeArea] = useState(
    currentUser?.collegeOrOrg || colleges[0]
  );
  const [description, setDescription] = useState('');
  const [photoSrc, setPhotoSrc] = useState(SAMPLE_BAZAAR_PHOTOS[0].src);
  const [showPhone, setShowPhone] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    addBazaarItem({
      title: title.trim(),
      category,
      price: isFree ? 0 : Math.max(0, Number(price) || 0),
      isFree,
      condition,
      description: description.trim(),
      photos: [photoSrc],
      city: activeCity,
      district: location?.district || activeCity,
      neighborhood,
      collegeArea: collegeArea.trim() || `${activeCity} Campus`,
      showPhone,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Post a Student Bazaar Ad"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[94vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Post an Item on Student Bazaar
            </h2>
            <p className="text-xs text-slate-500">
              Listing locally in {activeCity} · {neighborhood}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Post Ad Modal"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="ad-title"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Ad Title
            </label>
            <input
              id="ad-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Engineering Drawing Kit & Drafter, Study Chair..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="ad-category"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Category
              </label>
              <select
                id="ad-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="ad-condition"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Condition
              </label>
              <select
                id="ad-condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Used">Used</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="ad-price"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Price (₹)
              </label>
              <input
                id="ad-price"
                type="number"
                min={0}
                disabled={isFree}
                value={isFree ? '0' : price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-mono tabular-nums border border-slate-300 rounded-lg disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="rounded accent-teal-700"
              />
              <span>Give away for free to a local student</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showPhone}
                onChange={(e) => setShowPhone(e.target.checked)}
                className="rounded accent-teal-700"
              />
              <span>
                Show my phone number on this ad (optional — buyers can always
                chat first)
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="ad-neighborhood"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Pickup Neighborhood ({activeCity})
              </label>
              <select
                id="ad-neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                {neighborhoods.map((nb) => (
                  <option key={nb} value={nb}>
                    {nb}
                  </option>
                ))}
                {!neighborhoods.includes(neighborhood) && (
                  <option value={neighborhood}>{neighborhood}</option>
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="ad-college"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Nearest College ({activeCity})
              </label>
              <select
                id="ad-college"
                value={collegeArea}
                onChange={(e) => setCollegeArea(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                {colleges.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
                {!colleges.includes(collegeArea) && (
                  <option value={collegeArea}>{collegeArea}</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="ad-desc"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Description & Pickup Timing
            </label>
            <textarea
              id="ad-desc"
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mention age of item, any defects, and convenient pickup time..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-medium text-slate-700 mb-2">
              Item Photo
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <SafePhoto src={photoSrc} alt="Item preview" />
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <Upload className="w-4 h-4 text-teal-700" />
                  <span>Upload Photo from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <div>
                  <p className="text-[11px] text-slate-500 mb-1.5">
                    Or pick a quick sample photo:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_BAZAAR_PHOTOS.map((sample) => (
                      <button
                        key={sample.src}
                        type="button"
                        onClick={() => setPhotoSrc(sample.src)}
                        className={`px-2.5 py-1 text-[11px] rounded border cursor-pointer ${
                          photoSrc === sample.src
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Publish Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BazaarDetailModal({ item, onClose }) {
  const { currentUser, chatMessages, sendChatMessage, toggleBazaarItemSold } =
    useAppState();
  const [messageInput, setMessageInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  const threadId = `bazaar-${item.id}`;
  const threadMessages = chatMessages.filter((m) => m.threadId === threadId);
  const isOwner = currentUser?.id === item.sellerId;

  const handleCopyPhone = async () => {
    if (!item.showPhone) return;
    try {
      await navigator.clipboard.writeText(item.sellerMobile);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendChatMessage(threadId, messageInput);
    setMessageInput('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[94vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white/95 backdrop-blur px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-slate-500">
              {item.category} · {item.condition} · {item.city} (
              {item.neighborhood})
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {item.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close item details"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 space-y-4">
            <div className="aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <SafePhoto
                src={item.photos[0]}
                alt={item.title}
                fallbackLabel={item.title}
              />
            </div>

            <div className="flex items-baseline justify-between pt-2">
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {item.isFree
                  ? 'FREE'
                  : `₹${item.price.toLocaleString('en-IN')}`}
              </div>
              <span className="text-xs font-medium text-slate-500">
                Posted {item.createdAt}
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {item.description}
            </p>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
              <div>
                Pickup Area:{' '}
                <span className="font-semibold text-slate-900">
                  {item.neighborhood}, {item.city}
                </span>
              </div>
              <div>Near: {item.collegeArea}</div>
            </div>

            {isOwner && (
              <button
                type="button"
                onClick={() => toggleBazaarItemSold(item.id)}
                className="w-full py-2 px-4 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 cursor-pointer"
              >
                {item.status === 'Available'
                  ? 'Mark Item as Sold / Picked Up'
                  : 'Re-list as Available'}
              </button>
            )}
          </div>

          <div className="md:col-span-6 flex flex-col justify-between bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="pb-3 border-b border-slate-200">
              <div className="text-xs text-slate-500">Seller Profile</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {item.sellerName}
              </div>

              {item.showPhone ? (
                phoneRevealed ? (
                  <div className="mt-2 flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-900">
                      <Phone className="w-3.5 h-3.5 text-teal-700" />
                      <span>{item.sellerMobile}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 hover:underline cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPhoneRevealed(true)}
                    className="mt-2 w-full inline-flex items-center justify-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-700" />
                    <span>Show Seller Phone Number</span>
                  </button>
                )
              ) : (
                <div className="mt-2 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] text-slate-600">
                  <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>
                    Phone hidden for privacy — use in-app chat below to
                    coordinate pickup.
                  </span>
                </div>
              )}
            </div>

            <div className="py-3 flex-1 flex flex-col min-h-[220px] max-h-[280px]">
              <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
                <span>Chat with {item.sellerName}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {threadMessages.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">
                    Ask {item.sellerName} about item condition or pickup time
                    near {item.neighborhood}.
                  </p>
                ) : (
                  threadMessages.map((msg) => {
                    const isSelf = msg.senderId === currentUser?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`p-2.5 rounded-lg text-xs ${
                          isSelf
                            ? 'bg-teal-700 text-white ml-6'
                            : 'bg-white border border-slate-200 text-slate-800 mr-6'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-0.5 opacity-80 text-[10px]">
                          <span className="font-semibold">
                            {msg.senderName}
                          </span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p>{msg.text}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <form
              onSubmit={handleSend}
              className="pt-2 border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Message seller for pickup..."
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentBazaar() {
  const { bazaarItems, location } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [areaScope, setAreaScope] = useState('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('All');
  const [priceFilter, setPriceFilter] = useState('all');
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const activeCity = location?.city || 'Sreerampore';
  const localNeighborhoods = getTownNeighborhoods(activeCity);

  const sortedItems = bazaarItems
    .filter((item) => {
      if (
        areaScope === 'local' &&
        item.city.toLowerCase() !== activeCity.toLowerCase()
      ) {
        return false;
      }

      if (
        selectedNeighborhood !== 'All' &&
        item.neighborhood.toLowerCase() !== selectedNeighborhood.toLowerCase()
      ) {
        return false;
      }

      if (category !== 'All' && item.category !== category) return false;

      if (priceFilter === 'free' && !item.isFree) return false;
      if (priceFilter === 'under1000' && item.price > 1000) return false;
      if (priceFilter === 'under5000' && item.price > 5000) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${item.title} ${item.description} ${item.category} ${item.city} ${item.neighborhood} ${item.collegeArea}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const aLocal = a.city.toLowerCase() === activeCity.toLowerCase() ? 0 : 1;
      const bLocal = b.city.toLowerCase() === activeCity.toLowerCase() ? 0 : 1;
      return aLocal - bLocal;
    });

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-teal-700 mb-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>
                Student Bazaar · {bazaarItems.length} college essentials near{' '}
                {activeCity}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
              Buy, Sell or Give Away Student Goods
            </h1>
            <p className="text-sm text-slate-600 mt-1.5">
              Used cycles, kettles, routers, study chairs, mattresses, lab
              coats, and semester books from students in your own para.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowPostModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post an Ad</span>
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                category === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          <div className="sm:col-span-2 lg:col-span-4 relative min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search kettle, chair, cycle, router, GATE books..."
              className="w-full h-11 pl-10 pr-3.5 text-sm leading-normal bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div className="lg:col-span-3 min-w-0">
            <select
              aria-label="Filter by neighborhood"
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="w-full h-11 px-3.5 text-sm leading-normal bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
            >
              <option value="All">All Neighborhoods in {activeCity}</option>
              {localNeighborhoods.map((nb) => (
                <option key={nb} value={nb}>
                  {nb}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2 min-w-0">
            <select
              aria-label="Filter by price"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full h-11 px-3.5 text-sm leading-normal bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
            >
              <option value="all">Any Price</option>
              <option value="free">Free Giveaways</option>
              <option value="under1000">Under ₹1,000</option>
              <option value="under5000">Under ₹5,000</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-1 p-1 bg-slate-100 rounded-lg h-11">
            <button
              type="button"
              onClick={() => {
                setAreaScope('local');
                setSelectedNeighborhood('All');
              }}
              className={`flex-1 h-full text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
                areaScope === 'local'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              Only {activeCity}
            </button>
            <button
              type="button"
              onClick={() => {
                setAreaScope('all');
                setSelectedNeighborhood('All');
              }}
              className={`flex-1 h-full text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
                areaScope === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              All Nearby
            </button>
          </div>
        </div>
      </div>

      {sortedItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <PackageOpen className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            No items listed with these filters yet
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Be the first student in {activeCity} to post an item, or view
            listings across nearby towns.
          </p>
          <button
            type="button"
            onClick={() => setShowPostModal(true)}
            className="mt-4 px-4 py-2 text-xs font-semibold bg-teal-700 text-white rounded-lg hover:bg-teal-800 cursor-pointer"
          >
            Post an Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedItems.map((item) => (
            <article
              key={item.id}
              className={`bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow ${
                item.status === 'Sold' ? 'opacity-70' : ''
              }`}
            >
              <div className="aspect-4/3 bg-slate-100 overflow-hidden">
                <SafePhoto
                  src={item.photos[0]}
                  alt={item.title}
                  fallbackLabel={item.title}
                  className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                    <span className="font-medium text-teal-700">
                      {item.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{item.condition}</span>
                    {item.status === 'Sold' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-red-700 font-semibold">Sold</span>
                      </>
                    )}
                  </div>

                  <h2 className="mt-1.5 text-base font-semibold text-slate-900 line-clamp-2">
                    {item.title}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 truncate">
                    {item.neighborhood}, {item.city} · Near {item.collegeArea}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                      {item.isFree
                        ? 'FREE'
                        : `₹${item.price.toLocaleString('en-IN')}`}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      By {item.sellerName} · {item.createdAt}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Chat / View
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showPostModal && (
        <PostAdModal onClose={() => setShowPostModal(false)} />
      )}

      {selectedItem && (
        <BazaarDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </section>
  );
}
