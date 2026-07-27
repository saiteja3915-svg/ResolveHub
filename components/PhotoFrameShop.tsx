"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Clock3,
  Eye,
  FileImage,
  Heart,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  PlusCircle,
  RotateCcw,
  Ruler,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Trash2,
  Truck,
  Upload
} from "lucide-react";
import { FrameShowcase3D } from "./FrameShowcase3D";

type FrameProduct = {
  id: string;
  name: string;
  price: string;
  badge: string;
  copy: string;
  image: string;
  alt: string;
};

type ShopContent = {
  shopName: string;
  subtitle: string;
  heroBadge: string;
  heroCopy: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  deliveryNote: string;
  bulkNote: string;
  finishCount: string;
  rating: string;
  dispatchTime: string;
  finishes: string[];
  products: FrameProduct[];
  benefitBullets: string[];
  promiseLabels: string[];
};

type OwnerMessage = {
  text: string;
  tone: "success" | "error" | "info";
} | null;

const OWNER_PASSWORD = "2091892";
const SHOP_STORAGE_KEY = "framewala-shop-content-v1";
const OWNER_SESSION_KEY = "framewala-owner-unlocked-v1";
const CURRENT_PHONE_DISPLAY = "+91 6301361730";
const CURRENT_WHATSAPP_NUMBER = "916301361730";
const OLD_DEMO_PHONE_DIGITS = new Set(["9876543210", "919876543210"]);

const defaultProductImage =
  "https://images.pexels.com/photos/7956938/pexels-photo-7956938.jpeg?auto=compress&cs=tinysrgb&w=900";

const defaultShop: ShopContent = {
  shopName: "FrameWala Studio",
  subtitle: "Custom photo frames in India",
  heroBadge: "Premium handmade frames, photo printing, and pan-India delivery",
  heroCopy:
    "Turn family photos, wedding memories, certificates, and art prints into ready-to-hang frames with custom sizes, Indian wood finishes, premium mat boards, and careful courier packing.",
  phone: CURRENT_PHONE_DISPLAY,
  whatsappNumber: CURRENT_WHATSAPP_NUMBER,
  email: "orders@framewala.in",
  address: "Indiranagar, Bengaluru. Local pickup and same-city courier available.",
  deliveryNote: "Shipping to metro cities, tier-2 cities, and bulk business addresses.",
  bulkNote: "Ask for photographer packs, school certificates, corporate awards, or cafe wall sets.",
  finishCount: "240+",
  rating: "4.9",
  dispatchTime: "48h",
  finishes: ["Teak", "Walnut", "Matte Black", "White", "Gold", "Rosewood"],
  products: [
    {
      id: "classic-teak",
      name: "Classic Teak Finish",
      price: "From Rs. 399",
      badge: "Best seller",
      copy: "Warm wood finish for family portraits, certificates, and gifting.",
      image: defaultProductImage,
      alt: "A blank wooden picture frame displayed on a shelf"
    },
    {
      id: "gallery-wall-set",
      name: "Gallery Wall Set",
      price: "From Rs. 1,799",
      badge: "Set of 9",
      copy: "Matched frames for living rooms, stair walls, cafes, and offices.",
      image:
        "https://images.pexels.com/photos/8947627/pexels-photo-8947627.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "White wooden frame near a bright window"
    },
    {
      id: "modern-black",
      name: "Modern Black Frame",
      price: "From Rs. 499",
      badge: "A4 to 24x36",
      copy: "Slim black profile with clean mat boards for premium photo prints.",
      image:
        "https://images.pexels.com/photos/4065177/pexels-photo-4065177.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "A person holding a white and black photo frame"
    },
    {
      id: "wedding-memory",
      name: "Wedding Memory Frame",
      price: "From Rs. 1,299",
      badge: "Custom text",
      copy: "Photo collage layouts, names, dates, and careful gift packing.",
      image:
        "https://images.pexels.com/photos/7792557/pexels-photo-7792557.jpeg?auto=compress&cs=tinysrgb&w=900",
      alt: "A person holding a blank wooden frame outdoors"
    }
  ],
  benefitBullets: [
    "High-resolution photo printing with color correction before framing.",
    "Acid-free mat boards, sturdy backing, wall hooks, and table stands.",
    "UPI, cards, bank transfer, and cash-on-delivery options for select pincodes.",
    "Bulk rates for photographers, interior designers, cafes, schools, and corporate gifting."
  ],
  promiseLabels: ["Premium printing", "Breakage-safe packing", "Free design preview", "Fast local dispatch"]
};

const steps = [
  {
    icon: <Upload className="h-5 w-5" />,
    title: "Send Your Photo",
    copy: "Upload on WhatsApp or email. We check resolution and crop before printing."
  },
  {
    icon: <Ruler className="h-5 w-5" />,
    title: "Choose Size",
    copy: "Pick 4x6, A4, 12x18, 16x24, or a custom size for your wall."
  },
  {
    icon: <FileImage className="h-5 w-5" />,
    title: "Approve Preview",
    copy: "Get a digital preview with frame finish, mat board, and layout."
  },
  {
    icon: <Truck className="h-5 w-5" />,
    title: "Packed And Shipped",
    copy: "Bubble wrap, corner guards, and courier-ready carton packing."
  }
];

const promiseIcons = [
  <Sparkles className="h-5 w-5" key="sparkles" />,
  <ShieldCheck className="h-5 w-5" key="shield" />,
  <BadgeCheck className="h-5 w-5" key="badge" />,
  <Clock3 className="h-5 w-5" key="clock" />
];

const reviews = [
  {
    name: "Aarav, Pune",
    quote: "The walnut frame made our wedding photo look gallery-ready. Packaging was solid."
  },
  {
    name: "Nisha, Hyderabad",
    quote: "They helped with cropping and suggested the right mat board. Very neat finish."
  },
  {
    name: "Rahul, Jaipur",
    quote: "Ordered a wall set for our cafe. The frames arrived labeled and easy to hang."
  }
];

function mergeShopContent(content: unknown): ShopContent {
  if (!content || typeof content !== "object") {
    return defaultShop;
  }

  const partial = content as Partial<ShopContent>;
  const products =
    Array.isArray(partial.products) && partial.products.length > 0
      ? partial.products.map((product, index) => ({
          ...defaultShop.products[index % defaultShop.products.length],
          ...product,
          id: product.id || `frame-${index + 1}`
        }))
      : defaultShop.products;

  return {
    ...defaultShop,
    ...partial,
    phone: partial.phone && !OLD_DEMO_PHONE_DIGITS.has(getPhoneDigits(partial.phone)) ? partial.phone : defaultShop.phone,
    whatsappNumber: normalizeWhatsAppNumber(partial.whatsappNumber || partial.phone || defaultShop.whatsappNumber),
    finishes: Array.isArray(partial.finishes) && partial.finishes.length > 0 ? partial.finishes : defaultShop.finishes,
    products,
    benefitBullets:
      Array.isArray(partial.benefitBullets) && partial.benefitBullets.length > 0
        ? partial.benefitBullets
        : defaultShop.benefitBullets,
    promiseLabels:
      Array.isArray(partial.promiseLabels) && partial.promiseLabels.length > 0
        ? partial.promiseLabels
        : defaultShop.promiseLabels
  };
}

function getDisplayNameParts(shopName: string) {
  const words = shopName.trim().split(/\s+/).filter(Boolean);

  if (words.length <= 1) {
    return { first: words[0] || "FrameWala", second: "Studio" };
  }

  return {
    first: words.slice(0, -1).join(" "),
    second: words[words.length - 1]
  };
}

function getPhoneDigits(value: string) {
  return value.replace(/[^\d]/g, "");
}

function normalizeWhatsAppNumber(value: string) {
  const digits = getPhoneDigits(value);

  if (!digits || OLD_DEMO_PHONE_DIGITS.has(digits)) {
    return CURRENT_WHATSAPP_NUMBER;
  }

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return `91${digits.slice(1)}`;
  }

  return digits;
}

function getWhatsAppHref(shop: ShopContent, message: string) {
  const number = normalizeWhatsAppNumber(shop.whatsappNumber || shop.phone);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function WhatsAppButton({ className = "", shop }: { className?: string; shop: ShopContent }) {
  return (
    <a
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#b88a44] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#9a7135] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b46b] focus-visible:ring-offset-2 ${className}`}
      href={getWhatsAppHref(shop, `Hi ${shop.shopName}, I want to order a custom photo frame.`)}
      rel="noreferrer"
      target="_blank"
    >
      <MessageCircle className="h-5 w-5" />
      Order On WhatsApp
    </a>
  );
}

function TextField({
  label,
  onChange,
  placeholder,
  type = "text",
  value
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-normal text-[#7b5728]">{label}</span>
      <input
        className="mt-2 h-11 w-full rounded-lg border border-[#d8c5a5] bg-[#fffaf0] px-3 text-sm font-semibold text-[#17130f] outline-none transition placeholder:text-[#9a8a74] focus:border-[#9a7135] focus:ring-2 focus:ring-[#d8b46b]/25"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function TextAreaField({
  label,
  onChange,
  placeholder,
  rows = 4,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-normal text-[#7b5728]">{label}</span>
      <textarea
        className="mt-2 w-full resize-y rounded-lg border border-[#d8c5a5] bg-[#fffaf0] px-3 py-3 text-sm font-semibold leading-6 text-[#17130f] outline-none transition placeholder:text-[#9a8a74] focus:border-[#9a7135] focus:ring-2 focus:ring-[#d8b46b]/25"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
    </label>
  );
}

function OwnerLogin({
  message,
  onCustomerView,
  onSubmit,
  password,
  setPassword
}: {
  message: OwnerMessage;
  onCustomerView: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  password: string;
  setPassword: (value: string) => void;
}) {
  return (
    <main className="min-h-screen bg-[#17130f] px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-lg border border-[#d8b46b]/25 bg-[#fffaf0] text-[#17130f] shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative hidden min-h-[560px] overflow-hidden bg-[#100d0a] lg:block">
            <Image
              alt="Premium photo frame owner portal background"
              className="object-cover opacity-42"
              fill
              sizes="45vw"
              src="https://images.pexels.com/photos/8148683/pexels-photo-8148683.jpeg?auto=compress&cs=tinysrgb&w=1200"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#100d0a] via-[#100d0a]/72 to-transparent" />
            <div className="absolute inset-x-8 bottom-8">
              <p className="text-sm font-black uppercase tracking-normal text-[#d8b46b]">Owner slide</p>
              <h1 className="mt-3 text-4xl font-black leading-tight text-white">Edit the store before customers see it</h1>
              <p className="mt-4 text-base leading-7 text-[#efe6d5]">
                Update address, contact details, frame styles, image links, prices, finishes, and selling points.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#d8c5a5] px-3 text-sm font-bold text-[#4c4033] transition hover:border-[#9a7135] hover:text-[#9a7135]"
              onClick={onCustomerView}
              type="button"
            >
              <Eye className="h-4 w-4" />
              Customer View
            </button>

            <div className="mt-10 max-w-md">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-[#17130f] text-[#d8b46b]">
                <Lock className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-3xl font-black tracking-normal">Owner Password</h2>
              <p className="mt-3 text-base leading-7 text-[#66594b]">
                This slide is only for the shop owner. Enter the password to edit the live storefront content.
              </p>

              <form className="mt-7 space-y-4" onSubmit={onSubmit}>
                <TextField
                  label="Password"
                  onChange={setPassword}
                  placeholder="Enter owner password"
                  type="password"
                  value={password}
                />
                {message ? (
                  <p
                    className={`rounded-lg border px-3 py-2 text-sm font-bold ${
                      message.tone === "error"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-[#d8c5a5] bg-[#f7f3ea] text-[#7b5728]"
                    }`}
                  >
                    {message.text}
                  </p>
                ) : null}
                <button
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#b88a44] px-5 text-sm font-bold text-white transition hover:bg-[#9a7135]"
                  type="submit"
                >
                  Unlock Owner Slide
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function OwnerEditor({
  draft,
  message,
  onAddProduct,
  onChange,
  onCustomerView,
  onLogout,
  onRemoveProduct,
  onReset,
  onSave,
  onUpdateProduct
}: {
  draft: ShopContent;
  message: OwnerMessage;
  onAddProduct: () => void;
  onChange: (content: ShopContent) => void;
  onCustomerView: () => void;
  onLogout: () => void;
  onRemoveProduct: (id: string) => void;
  onReset: () => void;
  onSave: () => void;
  onUpdateProduct: (id: string, patch: Partial<FrameProduct>) => void;
}) {
  const finishesText = draft.finishes.join(", ");
  const benefitText = draft.benefitBullets.join("\n");
  const promiseText = draft.promiseLabels.join("\n");

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#17130f]">
      <header className="sticky top-0 z-40 border-b border-[#d8c5a5] bg-[#fffaf0]/95 backdrop-blur">
        <div className="container flex min-h-20 flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#17130f] text-[#d8b46b]">
              <Store className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-lg font-black tracking-normal">Owner Slide</p>
              <p className="truncate text-xs font-semibold text-[#7b5728]">Edit storefront content and prices</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#d8c5a5] bg-[#fffaf0] px-3 text-sm font-bold text-[#4c4033] transition hover:border-[#9a7135] hover:text-[#9a7135]"
              onClick={onCustomerView}
              type="button"
            >
              <Eye className="h-4 w-4" />
              Customer View
            </button>
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#d8c5a5] bg-[#fffaf0] px-3 text-sm font-bold text-[#4c4033] transition hover:border-[#9a7135] hover:text-[#9a7135]"
              onClick={onReset}
              type="button"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#17130f] px-3 text-sm font-bold text-[#d8b46b] transition hover:bg-[#2d241c]"
              onClick={onSave}
              type="button"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#d8c5a5] bg-[#fffaf0] px-3 text-sm font-bold text-[#4c4033] transition hover:border-red-300 hover:text-red-700"
              onClick={onLogout}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Lock
            </button>
          </div>
        </div>
      </header>

      <section className="container py-8">
        {message ? (
          <div
            className={`mb-5 rounded-lg border px-4 py-3 text-sm font-bold ${
              message.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : message.tone === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-[#d8c5a5] bg-[#fffaf0] text-[#7b5728]"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="h-fit rounded-lg border border-[#dac8a8] bg-[#fffaf0] p-5 shadow-sm">
            <p className="text-sm font-black uppercase tracking-normal text-[#9a7135]">Preview data</p>
            <h1 className="mt-3 text-3xl font-black tracking-normal">{draft.shopName}</h1>
            <p className="mt-3 text-sm leading-6 text-[#66594b]">{draft.heroCopy}</p>
            <div className="mt-5 grid grid-cols-3 gap-3 border-y border-[#dac8a8] py-4">
              <div>
                <p className="text-xl font-black text-[#9a7135]">{draft.finishCount}</p>
                <p className="text-xs font-bold text-[#66594b]">finishes</p>
              </div>
              <div>
                <p className="text-xl font-black text-[#9a7135]">{draft.rating}</p>
                <p className="text-xs font-bold text-[#66594b]">rating</p>
              </div>
              <div>
                <p className="text-xl font-black text-[#9a7135]">{draft.dispatchTime}</p>
                <p className="text-xs font-bold text-[#66594b]">dispatch</p>
              </div>
            </div>
            <p className="mt-5 text-sm font-bold text-[#17130f]">{draft.products.length} frame cards listed</p>
          </aside>

          <div className="space-y-6">
            <section className="rounded-lg border border-[#dac8a8] bg-[#fffaf0] p-5 shadow-sm">
              <h2 className="text-xl font-black tracking-normal">Shop Details</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <TextField label="Shop name" onChange={(shopName) => onChange({ ...draft, shopName })} value={draft.shopName} />
                <TextField label="Subtitle" onChange={(subtitle) => onChange({ ...draft, subtitle })} value={draft.subtitle} />
                <TextField label="Phone" onChange={(phone) => onChange({ ...draft, phone })} value={draft.phone} />
                <TextField
                  label="WhatsApp number"
                  onChange={(whatsappNumber) => onChange({ ...draft, whatsappNumber })}
                  value={draft.whatsappNumber}
                />
                <TextField label="Email" onChange={(email) => onChange({ ...draft, email })} type="email" value={draft.email} />
                <TextField
                  label="Hero badge"
                  onChange={(heroBadge) => onChange({ ...draft, heroBadge })}
                  value={draft.heroBadge}
                />
              </div>
              <div className="mt-4 grid gap-4">
                <TextAreaField label="Hero description" onChange={(heroCopy) => onChange({ ...draft, heroCopy })} value={draft.heroCopy} />
                <TextAreaField label="Shop address" onChange={(address) => onChange({ ...draft, address })} value={draft.address} />
                <TextAreaField
                  label="Delivery note"
                  onChange={(deliveryNote) => onChange({ ...draft, deliveryNote })}
                  value={draft.deliveryNote}
                />
                <TextAreaField label="Bulk order note" onChange={(bulkNote) => onChange({ ...draft, bulkNote })} value={draft.bulkNote} />
              </div>
            </section>

            <section className="rounded-lg border border-[#dac8a8] bg-[#fffaf0] p-5 shadow-sm">
              <h2 className="text-xl font-black tracking-normal">Metrics, Finishes, And Selling Points</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <TextField
                  label="Finish count"
                  onChange={(finishCount) => onChange({ ...draft, finishCount })}
                  value={draft.finishCount}
                />
                <TextField label="Rating" onChange={(rating) => onChange({ ...draft, rating })} value={draft.rating} />
                <TextField
                  label="Dispatch time"
                  onChange={(dispatchTime) => onChange({ ...draft, dispatchTime })}
                  value={draft.dispatchTime}
                />
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <TextAreaField
                  label="Frame finishes"
                  onChange={(value) =>
                    onChange({
                      ...draft,
                      finishes: value
                        .split(",")
                        .map((finish) => finish.trim())
                        .filter(Boolean)
                    })
                  }
                  placeholder="Teak, Walnut, Matte Black"
                  value={finishesText}
                />
                <TextAreaField
                  label="Promise labels"
                  onChange={(value) =>
                    onChange({
                      ...draft,
                      promiseLabels: value
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean)
                    })
                  }
                  placeholder="One promise per line"
                  value={promiseText}
                />
                <TextAreaField
                  label="Benefit bullets"
                  onChange={(value) =>
                    onChange({
                      ...draft,
                      benefitBullets: value
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean)
                    })
                  }
                  placeholder="One bullet per line"
                  value={benefitText}
                />
              </div>
            </section>

            <section className="rounded-lg border border-[#dac8a8] bg-[#fffaf0] p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black tracking-normal">Frame Cards And Prices</h2>
                  <p className="mt-1 text-sm leading-6 text-[#66594b]">
                    Edit the frame name, price, badge, description, and image URL shown to customers.
                  </p>
                </div>
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#b88a44] px-4 text-sm font-bold text-white transition hover:bg-[#9a7135]"
                  onClick={onAddProduct}
                  type="button"
                >
                  <PlusCircle className="h-5 w-5" />
                  Add More Frames
                </button>
              </div>

              <div className="mt-5 space-y-5">
                {draft.products.map((product, index) => (
                  <article className="rounded-lg border border-[#dac8a8] bg-[#f7f3ea] p-4" key={product.id}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-black uppercase tracking-normal text-[#9a7135]">Frame {index + 1}</p>
                      <button
                        className="inline-flex min-h-10 w-fit items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-45"
                        disabled={draft.products.length <= 1}
                        onClick={() => onRemoveProduct(product.id)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <TextField
                        label="Frame name"
                        onChange={(name) => onUpdateProduct(product.id, { name })}
                        value={product.name}
                      />
                      <TextField label="Price" onChange={(price) => onUpdateProduct(product.id, { price })} value={product.price} />
                      <TextField label="Badge" onChange={(badge) => onUpdateProduct(product.id, { badge })} value={product.badge} />
                      <TextField
                        label="Image alt text"
                        onChange={(alt) => onUpdateProduct(product.id, { alt })}
                        value={product.alt}
                      />
                      <div className="lg:col-span-2">
                        <TextField
                          label="Image URL"
                          onChange={(image) => onUpdateProduct(product.id, { image })}
                          value={product.image}
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <TextAreaField
                          label="Description"
                          onChange={(copy) => onUpdateProduct(product.id, { copy })}
                          rows={3}
                          value={product.copy}
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function CustomerStore({ onOpenOwner, shop }: { onOpenOwner: () => void; shop: ShopContent }) {
  const displayName = getDisplayNameParts(shop.shopName);
  const phoneHref = `tel:${shop.phone.replace(/\s/g, "")}`;

  const promises = shop.promiseLabels.map((label, index) => ({
    icon: promiseIcons[index % promiseIcons.length],
    label
  }));

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f3ea] text-[#17130f]">
      <header className="sticky top-0 z-40 border-b border-[#d8c5a5] bg-[#fffaf0]/95 backdrop-blur">
        <div className="container flex min-h-20 items-center justify-between gap-4">
          <a className="flex min-w-0 items-center gap-3" href="#top" aria-label={`${shop.shopName} home`}>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#17130f] text-[#d8b46b]">
              <Camera className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-lg font-black tracking-normal">{shop.shopName}</span>
              <span className="block truncate text-xs font-semibold tracking-normal text-[#7b5728]">{shop.subtitle}</span>
            </span>
          </a>

          <nav className="hidden items-center gap-6 text-sm font-bold text-[#4c4033] md:flex">
            <a className="transition hover:text-[#9a7135]" href="#shop">
              Shop
            </a>
            <a className="transition hover:text-[#9a7135]" href="#custom">
              Custom Frames
            </a>
            <a className="transition hover:text-[#9a7135]" href="#reviews">
              Reviews
            </a>
            <a className="transition hover:text-[#9a7135]" href="#contact">
              Contact
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              className="hidden min-h-11 items-center justify-center gap-2 rounded-lg border border-[#bfa06e] bg-[#fffaf0] px-4 py-2 text-sm font-bold text-[#17130f] transition hover:border-[#9a7135] hover:text-[#9a7135] sm:inline-flex"
              onClick={onOpenOwner}
              type="button"
            >
              <Lock className="h-4 w-4" />
              Owner
            </button>
            <a
              className="hidden min-h-11 items-center justify-center gap-2 rounded-lg border border-[#bfa06e] bg-[#fffaf0] px-4 py-2 text-sm font-bold text-[#17130f] transition hover:border-[#9a7135] hover:text-[#9a7135] sm:inline-flex"
              href={phoneHref}
            >
              <Phone className="h-4 w-4" />
              Call Shop
            </a>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-[#100d0a] text-white" id="top">
        <Image
          alt="Person holding a brown wooden frame for a photo frame shop hero"
          className="object-cover opacity-30"
          fill
          priority
          sizes="100vw"
          src="https://images.pexels.com/photos/8148683/pexels-photo-8148683.jpeg?auto=compress&cs=tinysrgb&w=1800"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_38%,rgba(216,180,107,0.28),transparent_32%),linear-gradient(90deg,#100d0a_0%,rgba(16,13,10,0.9)_45%,rgba(16,13,10,0.38)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#100d0a]/70 to-transparent" />

        <div className="container relative grid min-h-[78vh] items-center gap-8 overflow-hidden py-12 sm:py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.95fr)]">
          <div className="max-w-3xl lg:col-start-1 lg:row-start-1">
            <p className="mb-4 inline-flex max-w-full whitespace-normal break-words rounded-lg border border-[#d8b46b]/45 bg-[#d8b46b]/12 px-3 py-2 text-sm font-bold leading-6 tracking-normal text-[#f4deb0] backdrop-blur">
              {shop.heroBadge}
            </p>
            <h1 className="max-w-3xl text-[2.85rem] font-black leading-[0.98] tracking-normal sm:text-6xl lg:text-7xl">
              <span className="block">{displayName.first}</span>
              <span className="block text-[#d8b46b]">{displayName.second}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#efe6d5] sm:text-xl">{shop.heroCopy}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <WhatsAppButton className="w-full focus-visible:ring-offset-[#100d0a] sm:w-auto" shop={shop} />
              <a
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#d8b46b]/50 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#100d0a] sm:w-auto"
                href="#shop"
              >
                Browse Frames
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="relative -mx-4 sm:mx-0 lg:col-start-2 lg:row-span-2 lg:row-start-1" aria-hidden="true">
            <FrameShowcase3D />
          </div>

          <div className="grid max-w-xl grid-cols-3 gap-3 border-y border-white/12 py-5 lg:col-start-1 lg:row-start-2">
            <div>
              <p className="text-2xl font-black tracking-normal text-[#d8b46b]">{shop.finishCount}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-[#d8cec0]">finish and size options</p>
            </div>
            <div>
              <p className="text-2xl font-black tracking-normal text-[#d8b46b]">{shop.rating}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-[#d8cec0]">rated frame quality</p>
            </div>
            <div>
              <p className="text-2xl font-black tracking-normal text-[#d8b46b]">{shop.dispatchTime}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-[#d8cec0]">local dispatch window</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#decdaa] bg-[#fffaf0] py-4">
        <div className="container grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map((promise) => (
            <div className="flex items-center gap-3 text-sm font-bold text-[#3b3128]" key={promise.label}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#17130f] text-[#d8b46b]">
                {promise.icon}
              </span>
              <span>{promise.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-20" id="shop">
        <div className="container">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-black uppercase tracking-normal text-[#9a7135]">Quick shop</p>
              <h2 className="mt-3 text-3xl font-black tracking-normal text-[#17130f] sm:text-4xl">
                Popular photo frame collections
              </h2>
              <p className="mt-4 text-base leading-7 text-[#66594b]">
                Choose a ready style or send your photo for a custom preview before we print and frame it.
              </p>
            </div>
            <a
              className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg border border-[#bfa06e] bg-[#fffaf0] px-4 py-2 text-sm font-bold text-[#17130f] transition hover:border-[#9a7135] hover:text-[#9a7135]"
              href="#custom"
            >
              See Custom Flow
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {shop.products.map((product) => (
              <article
                className="group overflow-hidden rounded-lg border border-[#dac8a8] bg-[#fffaf0] shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                key={product.id}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#efe4d2]">
                  <Image
                    alt={product.alt}
                    className="object-cover transition duration-500 group-hover:scale-105"
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    src={product.image || defaultProductImage}
                  />
                  <span className="absolute left-3 top-3 rounded-md bg-[#fffaf0] px-2.5 py-1 text-xs font-black text-[#17130f] shadow-sm">
                    {product.badge}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-black tracking-normal text-[#17130f]">{product.name}</h3>
                    <Heart className="h-5 w-5 shrink-0 text-rose-500" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#66594b]">{product.copy}</p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="text-base font-black text-[#8a612b]">{product.price}</p>
                    <a
                      aria-label={`Ask about ${product.name}`}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#17130f] text-[#d8b46b] transition hover:bg-[#8a612b] hover:text-white"
                      href={getWhatsAppHref(shop, `Hi ${shop.shopName}, I want details for ${product.name}.`)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Send className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#17130f] py-16 text-white sm:py-20" id="custom">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-[#d8b46b]">Custom frames</p>
              <h2 className="mt-3 text-3xl font-black tracking-normal sm:text-4xl">
                Built around your photo, not a fixed template
              </h2>
              <p className="mt-4 text-base leading-7 text-[#d8cec0]">
                From passport-size memories to large living-room statement frames, we help pick the size, finish,
                mat board, and print paper that suits the photo.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {shop.finishes.map((finish) => (
                  <span
                    className="rounded-md border border-[#d8b46b]/25 bg-[#d8b46b]/10 px-3 py-2 text-sm font-bold text-[#efe6d5]"
                    key={finish}
                  >
                    {finish}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {steps.map((step, index) => (
                <article className="rounded-lg border border-[#d8b46b]/18 bg-white/8 p-5" key={step.title}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#d8b46b] text-[#17130f]">
                      {step.icon}
                    </span>
                    <span className="text-sm font-black text-[#a99983]">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-black tracking-normal">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#d8cec0]">{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="relative min-h-[420px] overflow-hidden rounded-lg bg-[#efe4d2]">
            <Image
              alt="Wooden frame mockup with blank space for artwork"
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              src={shop.products[0]?.image || defaultProductImage}
            />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-normal text-[#9a7135]">Why customers choose us</p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-[#17130f] sm:text-4xl">
              Finishing details that make framed photos feel gift-ready
            </h2>
            <div className="mt-6 space-y-4">
              {shop.benefitBullets.map((item) => (
                <div className="flex gap-3" key={item}>
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#9a7135]" />
                  <p className="text-base leading-7 text-[#66594b]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#dac8a8] bg-[#fffaf0] py-16 sm:py-20" id="reviews">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-normal text-[#9a7135]">Customer notes</p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-[#17130f] sm:text-4xl">
              Loved by homes, studios, and small businesses
            </h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {reviews.map((review) => (
              <article className="rounded-lg border border-[#dac8a8] bg-[#f7f3ea] p-6" key={review.name}>
                <div className="flex gap-1 text-[#b88a44]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star className="h-4 w-4 fill-current" key={index} />
                  ))}
                </div>
                <p className="mt-4 text-base leading-7 text-[#66594b]">&quot;{review.quote}&quot;</p>
                <p className="mt-5 text-sm font-black text-[#17130f]">{review.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20" id="contact">
        <div className="container grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-normal text-[#9a7135]">Order desk</p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-[#17130f] sm:text-4xl">
              Send a photo. Get a frame preview.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#66594b]">
              Share your photo, preferred size, delivery city, and occasion. The shop team will reply with preview
              options, price, and delivery estimate.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <WhatsAppButton shop={shop} />
              <a
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#bfa06e] bg-[#fffaf0] px-5 py-3 text-sm font-bold text-[#17130f] transition hover:border-[#9a7135] hover:text-[#9a7135]"
                href={`mailto:${shop.email}`}
              >
                <Mail className="h-5 w-5" />
                Email Photos
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-lg border border-[#dac8a8] bg-[#fffaf0] p-5 shadow-sm">
              <MapPin className="h-6 w-6 text-[#9a7135]" />
              <h3 className="mt-4 text-lg font-black tracking-normal">Studio Pickup</h3>
              <p className="mt-2 text-sm leading-6 text-[#66594b]">{shop.address}</p>
            </article>
            <article className="rounded-lg border border-[#dac8a8] bg-[#fffaf0] p-5 shadow-sm">
              <Truck className="h-6 w-6 text-[#9a7135]" />
              <h3 className="mt-4 text-lg font-black tracking-normal">India Delivery</h3>
              <p className="mt-2 text-sm leading-6 text-[#66594b]">{shop.deliveryNote}</p>
            </article>
            <article className="rounded-lg border border-[#dac8a8] bg-[#fffaf0] p-5 shadow-sm sm:col-span-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-black tracking-normal">Need a bulk quote?</h3>
                  <p className="mt-2 text-sm leading-6 text-[#66594b]">{shop.bulkNote}</p>
                </div>
                <a
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#17130f] px-4 py-2 text-sm font-bold text-[#d8b46b] transition hover:bg-[#8a612b] hover:text-white"
                  href={getWhatsAppHref(shop, `Hi ${shop.shopName}, I need a bulk quote for photo frames.`)}
                  rel="noreferrer"
                  target="_blank"
                >
                  Get Quote
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#dac8a8] bg-[#fffaf0] py-8">
        <div className="container flex flex-col gap-4 text-sm text-[#66594b] md:flex-row md:items-center md:justify-between">
          <p className="font-semibold">{shop.shopName} - Custom photo frames, printing, and gifting.</p>
          <div className="flex flex-wrap gap-4">
            <a className="font-bold text-[#17130f] hover:text-[#9a7135]" href={phoneHref}>
              {shop.phone}
            </a>
            <a className="font-bold text-[#17130f] hover:text-[#9a7135]" href={`mailto:${shop.email}`}>
              {shop.email}
            </a>
            <button className="font-bold text-[#17130f] hover:text-[#9a7135]" onClick={onOpenOwner} type="button">
              Owner Login
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}

export function PhotoFrameShop() {
  const [shop, setShop] = useState<ShopContent>(defaultShop);
  const [draft, setDraft] = useState<ShopContent>(defaultShop);
  const [mode, setMode] = useState<"customer" | "owner">("customer");
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<OwnerMessage>(null);

  useEffect(() => {
    const loadSavedShop = window.setTimeout(() => {
      try {
        const savedShop = window.localStorage.getItem(SHOP_STORAGE_KEY);
        const nextShop = savedShop ? mergeShopContent(JSON.parse(savedShop)) : defaultShop;

        if (savedShop) {
          window.localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(nextShop));
        }

        setShop(nextShop);
        setDraft(nextShop);
        setIsOwnerUnlocked(window.sessionStorage.getItem(OWNER_SESSION_KEY) === "true");
      } catch {
        window.localStorage.removeItem(SHOP_STORAGE_KEY);
        setShop(defaultShop);
        setDraft(defaultShop);
      }
    }, 0);

    return () => window.clearTimeout(loadSavedShop);
  }, []);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => setMessage(null), 3200);

    return () => window.clearTimeout(timer);
  }, [message]);

  const ownerView = useMemo(() => mode === "owner", [mode]);

  function openOwner() {
    setMode("owner");
    setDraft(shop);
    setMessage(null);
  }

  function handleOwnerLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.trim() !== OWNER_PASSWORD) {
      setMessage({ text: "Wrong password. Please try again.", tone: "error" });
      return;
    }

    window.sessionStorage.setItem(OWNER_SESSION_KEY, "true");
    setIsOwnerUnlocked(true);
    setPassword("");
    setMessage({ text: "Owner slide unlocked. You can edit the shop now.", tone: "success" });
  }

  function handleSave() {
    const nextShop = mergeShopContent(draft);

    window.localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(nextShop));
    setShop(nextShop);
    setDraft(nextShop);
    setMessage({ text: "Saved. Customer view now uses these owner updates.", tone: "success" });
  }

  function handleReset() {
    window.localStorage.removeItem(SHOP_STORAGE_KEY);
    setShop(defaultShop);
    setDraft(defaultShop);
    setMessage({ text: "Owner content reset to the premium demo defaults.", tone: "info" });
  }

  function handleLogout() {
    window.sessionStorage.removeItem(OWNER_SESSION_KEY);
    setIsOwnerUnlocked(false);
    setPassword("");
    setMessage({ text: "Owner slide locked.", tone: "info" });
  }

  function updateProduct(id: string, patch: Partial<FrameProduct>) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      products: currentDraft.products.map((product) => (product.id === id ? { ...product, ...patch } : product))
    }));
  }

  function addProduct() {
    setDraft((currentDraft) => ({
      ...currentDraft,
      products: [
        ...currentDraft.products,
        {
          id: `frame-${Date.now()}`,
          name: "New Premium Frame",
          price: "From Rs. 599",
          badge: "New",
          copy: "Describe the frame material, size, finish, and ideal use.",
          image: defaultProductImage,
          alt: "Premium custom photo frame"
        }
      ]
    }));
    setMessage({ text: "New frame card added. Edit its name, price, image, and description, then save.", tone: "info" });
  }

  function removeProduct(id: string) {
    setDraft((currentDraft) => {
      if (currentDraft.products.length <= 1) {
        return currentDraft;
      }

      return {
        ...currentDraft,
        products: currentDraft.products.filter((product) => product.id !== id)
      };
    });
  }

  if (ownerView && !isOwnerUnlocked) {
    return (
      <OwnerLogin
        message={message}
        onCustomerView={() => setMode("customer")}
        onSubmit={handleOwnerLogin}
        password={password}
        setPassword={setPassword}
      />
    );
  }

  if (ownerView) {
    return (
      <OwnerEditor
        draft={draft}
        message={message}
        onAddProduct={addProduct}
        onChange={setDraft}
        onCustomerView={() => setMode("customer")}
        onLogout={handleLogout}
        onRemoveProduct={removeProduct}
        onReset={handleReset}
        onSave={handleSave}
        onUpdateProduct={updateProduct}
      />
    );
  }

  return <CustomerStore onOpenOwner={openOwner} shop={shop} />;
}
