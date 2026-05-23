"use client";

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  BadgeCheck,
  Building2,
  CalendarClock,
  Camera,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  Database,
  Droplets,
  Download,
  FileImage,
  FileText,
  Filter,
  LayoutDashboard,
  ListChecks,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  PlusCircle,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Siren,
  Sparkles,
  Smartphone,
  TimerReset,
  UserCheck,
  UserRound,
  UsersRound,
  Wifi,
  Wrench,
  X,
  Zap
} from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";

type Priority = "High" | "Medium" | "Low";
type Status = "New" | "Assigned" | "In Progress" | "Resolved";
type View = "Dashboard" | "Complaints" | "Analytics" | "Staff" | "Settings";

type Complaint = {
  id: string;
  title: string;
  category: string;
  location: string;
  priority: Priority;
  status: Status;
  assignee: string;
  reporter: string;
  createdAt: string;
  sla: string;
  progress: number;
  description: string;
  photoName?: string;
  updatedAt: string;
};

type NewComplaintForm = {
  title: string;
  category: string;
  location: string;
  priority: Priority;
  reporter: string;
  description: string;
  photoName: string;
};

type FormMessage = {
  text: string;
  tone: "success" | "error";
} | null;

type AppSettings = {
  autoAssign: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
  highPrioritySlaHours: number;
  defaultCampus: string;
};

type ActionMessage = {
  text: string;
  tone: "success" | "info";
} | null;

const STORAGE_KEY = "resolvehub-complaints-v1";
const SETTINGS_STORAGE_KEY = "resolvehub-settings-v1";
const STAFF_AUTH_STORAGE_KEY = "resolvehub-staff-access-v1";
const STAFF_ACCESS_PASSWORD = "2091892";

const categories = ["All", "Electrical", "Plumbing", "Security", "Cleaning", "Wi-Fi"];
const priorities: Priority[] = ["High", "Medium", "Low"];
const statuses: Status[] = ["New", "Assigned", "In Progress", "Resolved"];

const initialComplaints: Complaint[] = [
  {
    id: "CMP-1048",
    title: "Water leakage near Room B-214",
    category: "Plumbing",
    location: "Hostel Block B, 2nd Floor",
    priority: "High",
    status: "In Progress",
    assignee: "Ravi Kumar",
    reporter: "Ananya R.",
    createdAt: "18 min ago",
    sla: "2h 12m left",
    progress: 66,
    description: "Water is leaking from the ceiling near the corridor and spreading toward two rooms.",
    photoName: "leakage-b214.jpg",
    updatedAt: "12 min ago"
  },
  {
    id: "CMP-1047",
    title: "Main gate light not working",
    category: "Electrical",
    location: "Apartment Tower A, Gate 1",
    priority: "High",
    status: "Assigned",
    assignee: "Meera Singh",
    reporter: "Security Desk",
    createdAt: "41 min ago",
    sla: "3h 05m left",
    progress: 38,
    description: "The entry light has been off since evening, causing visibility issues for residents.",
    photoName: "gate-light.png",
    updatedAt: "20 min ago"
  },
  {
    id: "CMP-1046",
    title: "Wi-Fi down in innovation lab",
    category: "Wi-Fi",
    location: "College Lab 3, East Wing",
    priority: "Medium",
    status: "New",
    assignee: "Unassigned",
    reporter: "Hackathon Team 7",
    createdAt: "1h ago",
    sla: "6h 40m left",
    progress: 12,
    description: "Students cannot connect to the lab router during project work.",
    photoName: "router-error.jpg",
    updatedAt: "1h ago"
  },
  {
    id: "CMP-1045",
    title: "Garbage overflow near cafeteria",
    category: "Cleaning",
    location: "Campus Cafeteria Exit",
    priority: "Medium",
    status: "Resolved",
    assignee: "Facility Crew",
    reporter: "Cafeteria Manager",
    createdAt: "3h ago",
    sla: "Closed in 1h 20m",
    progress: 100,
    description: "Dustbins near the cafeteria exit were overflowing during lunch rush.",
    photoName: "cafeteria-bin.jpg",
    updatedAt: "42 min ago"
  }
];

const staff = [
  { name: "Ravi Kumar", role: "Plumbing", status: "On site" },
  { name: "Meera Singh", role: "Electrical", status: "Assigned" },
  { name: "Asha Patel", role: "Cleaning", status: "Available" },
  { name: "Nikhil Rao", role: "Network", status: "Busy" },
  { name: "Security Desk", role: "Security", status: "Available" },
  { name: "Facility Crew", role: "Cleaning", status: "Available" }
];

const assigneeByCategory: Record<string, string> = {
  Cleaning: "Asha Patel",
  Electrical: "Meera Singh",
  Plumbing: "Ravi Kumar",
  Security: "Security Desk",
  "Wi-Fi": "Nikhil Rao"
};

const solutionCards = [
  {
    title: "Hostels and PGs",
    copy: "Let residents report maintenance issues with proof while wardens track every SLA."
  },
  {
    title: "Colleges",
    copy: "Route lab, hostel, classroom, and campus complaints to the right facility team."
  },
  {
    title: "Apartments",
    copy: "Give associations a transparent queue for plumbing, security, cleaning, and utilities."
  },
  {
    title: "Offices",
    copy: "Keep workplace operations accountable with assignment, status, and resolution history."
  }
];

const salesFeatures = [
  {
    icon: <Camera className="h-5 w-5" />,
    title: "Photo-first complaint intake",
    copy: "Users submit the issue, category, location, priority, and proof in one clean flow."
  },
  {
    icon: <UsersRound className="h-5 w-5" />,
    title: "Automatic staff routing",
    copy: "New tickets can be assigned by category so urgent work reaches the right person quickly."
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Management analytics",
    copy: "Owners can see SLA risk, category trends, staff load, and resolution performance."
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "INR 2,999/mo",
    copy: "For one hostel, office, or apartment block.",
    features: ["100 complaints/month", "Admin dashboard", "CSV export", "Email-ready alerts"]
  },
  {
    name: "Growth",
    price: "INR 7,999/mo",
    copy: "For campuses and multi-building communities.",
    features: ["Unlimited complaints", "Staff workload view", "SLA analytics", "Priority support"]
  },
  {
    name: "Enterprise",
    price: "Custom",
    copy: "For institutions that need branded workflows.",
    features: ["Multiple facilities", "Custom categories", "Role-based teams", "Integration planning"]
  }
];

const salesPhone = "6301361730";
const salesEmail = "saiteja3915@gmail.com";

const categoryIcons: Record<string, ReactNode> = {
  Electrical: <Zap className="h-4 w-4" />,
  Plumbing: <Droplets className="h-4 w-4" />,
  Security: <ShieldCheck className="h-4 w-4" />,
  Cleaning: <Sparkles className="h-4 w-4" />,
  "Wi-Fi": <Wifi className="h-4 w-4" />
};

const priorityStyles: Record<Priority, string> = {
  High: "border-red-200 bg-red-50 text-red-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700"
};

const statusStyles: Record<Status, string> = {
  New: "border-slate-200 bg-white text-slate-700",
  Assigned: "border-blue-200 bg-blue-50 text-blue-700",
  "In Progress": "border-teal-200 bg-teal-50 text-teal-700",
  Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700"
};

const defaultForm: NewComplaintForm = {
  title: "",
  category: "Electrical",
  location: "",
  priority: "Medium",
  reporter: "",
  description: "",
  photoName: ""
};

const defaultSettings: AppSettings = {
  autoAssign: true,
  emailAlerts: true,
  smsAlerts: false,
  highPrioritySlaHours: 4,
  defaultCampus: "Greenview Campus"
};

function getNextComplaintId(complaints: Complaint[]) {
  const highestId = complaints.reduce((highest, complaint) => {
    const numericId = Number(complaint.id.replace("CMP-", ""));
    return Number.isNaN(numericId) ? highest : Math.max(highest, numericId);
  }, 1044);

  return `CMP-${highestId + 1}`;
}

function getSlaForPriority(priority: Priority, highPrioritySlaHours = 4) {
  if (priority === "High") {
    return `${highPrioritySlaHours}h left`;
  }

  if (priority === "Medium") {
    return "8h left";
  }

  return "24h left";
}

function getProgressForStatus(status: Status) {
  const progressByStatus: Record<Status, number> = {
    New: 12,
    Assigned: 38,
    "In Progress": 66,
    Resolved: 100
  };

  return progressByStatus[status];
}

function getWorkloadByStaff(complaints: Complaint[]) {
  return staff.reduce<Record<string, number>>((workload, member) => {
    workload[member.name] = complaints.filter(
      (complaint) => complaint.assignee === member.name && complaint.status !== "Resolved"
    ).length;

    return workload;
  }, {});
}

function getCategoryCounts(complaints: Complaint[]) {
  return categories
    .filter((category) => category !== "All")
    .map((category) => ({
      category,
      count: complaints.filter((complaint) => complaint.category === category).length
    }));
}

function StatCard({
  label,
  value,
  detail,
  icon,
  tone
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-normal text-slate-950">{value}</p>
        </div>
        <div className={`hidden h-10 w-10 shrink-0 place-items-center rounded-lg sm:grid ${tone}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 break-words text-sm leading-5 text-slate-500">{detail}</p>
    </article>
  );
}

function Sidebar({
  activeView,
  highPriorityCount,
  onViewChange
}: {
  activeView: View;
  highPriorityCount: number;
  onViewChange: (view: View) => void;
}) {
  const navItems = [
    { label: "Dashboard" as const, icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: "Complaints" as const, icon: <ClipboardList className="h-5 w-5" /> },
    { label: "Analytics" as const, icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Staff" as const, icon: <UsersRound className="h-5 w-5" /> },
    { label: "Settings" as const, icon: <Settings className="h-5 w-5" /> }
  ] satisfies Array<{ label: View; icon: ReactNode }>;

  return (
    <aside className="hidden min-h-screen border-r border-slate-200 bg-white px-4 py-5 lg:flex lg:w-72 lg:flex-col">
      <div className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-teal-600 text-white shadow-sm">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-normal text-slate-950">ResolveHub</h1>
          <p className="text-xs font-medium text-slate-500">Smart Complaint Resolver</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
              activeView === item.label
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
            data-testid={`nav-${item.label.toLowerCase()}`}
            onClick={() => onViewChange(item.label)}
            type="button"
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-lg border border-teal-100 bg-teal-50 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-teal-900">
          <Siren className="h-4 w-4" />
          SLA Watch
        </div>
        <p className="mt-2 text-sm leading-5 text-teal-800">
          {highPriorityCount} high-priority ticket{highPriorityCount === 1 ? "" : "s"} need action before the next shift handoff.
        </p>
      </div>
    </aside>
  );
}

function TopBar({
  activeView,
  facilityName,
  onBackToSite,
  onSearchChange,
  onViewChange,
  query
}: {
  activeView: View;
  facilityName: string;
  onBackToSite: () => void;
  onSearchChange: (query: string) => void;
  onViewChange: (view: View) => void;
  query: string;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-teal-700">
            {(facilityName.trim() || "Facility")} operations desk
          </p>
          <h2 className="truncate text-xl font-bold tracking-normal text-slate-950 sm:text-2xl">
            {activeView === "Dashboard" ? "Smart Complaint Resolver" : activeView}
          </h2>
        </div>

        <div className="hidden h-11 min-w-0 flex-1 max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 md:flex">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            aria-label="Search dashboard"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Search complaint, room, staff..."
            onChange={(event) => onSearchChange(event.target.value)}
            type="search"
            value={query}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            className="hidden h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
            onClick={onBackToSite}
            type="button"
          >
            <Building2 className="h-4 w-4" />
            Website
          </button>
          <button
            aria-label="Notifications"
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            onClick={() => onViewChange("Complaints")}
            type="button"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            className="hidden h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex"
            onClick={() => onViewChange("Settings")}
            type="button"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-950 text-xs text-white">SA</span>
            <span className="hidden sm:inline">Admin</span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
}

function MobileNav({
  activeView,
  onViewChange
}: {
  activeView: View;
  onViewChange: (view: View) => void;
}) {
  const views: View[] = ["Dashboard", "Complaints", "Analytics", "Staff", "Settings"];

  return (
    <nav className="no-scrollbar flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      {views.map((view) => (
        <button
          className={`h-10 shrink-0 rounded-lg border px-3 text-sm font-bold transition ${
            activeView === view
              ? "border-slate-950 bg-slate-950 text-white"
              : "border-slate-200 bg-white text-slate-600"
          }`}
          data-testid={`mobile-nav-${view.toLowerCase()}`}
          key={view}
          onClick={() => onViewChange(view)}
          type="button"
        >
          {view}
        </button>
      ))}
    </nav>
  );
}

function ComplaintCard({
  complaint,
  onSelect,
  onStatusChange
}: {
  complaint: Complaint;
  onSelect: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
}) {
  return (
    <article
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      data-testid={`complaint-card-${complaint.id}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400">{complaint.id}</span>
            <span
              className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-bold ${priorityStyles[complaint.priority]}`}
            >
              {complaint.priority} Priority
            </span>
            <span
              className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-bold ${statusStyles[complaint.status]}`}
            >
              {complaint.status}
            </span>
          </div>
          <h3 className="mt-3 text-base font-bold leading-6 tracking-normal text-slate-950">{complaint.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{complaint.description}</p>
        </div>

        <button
          aria-label={`More actions for ${complaint.id}`}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          data-testid={`details-${complaint.id}`}
          onClick={() => onSelect(complaint.id)}
          type="button"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 md:grid-cols-3">
        <div className="flex min-w-0 items-start gap-2 text-sm text-slate-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span className="min-w-0 break-words">{complaint.location}</span>
        </div>
        <div className="flex min-w-0 items-start gap-2 text-sm text-slate-600">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span>{complaint.sla}</span>
        </div>
        <div className="flex min-w-0 items-start gap-2 text-sm text-slate-600">
          <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span className="min-w-0 break-words">{complaint.assignee}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">
            <span>Resolution progress</span>
            <span>{complaint.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${
                complaint.priority === "High"
                  ? "bg-red-500"
                  : complaint.status === "Resolved"
                    ? "bg-emerald-500"
                    : "bg-teal-500"
              }`}
              style={{ width: `${complaint.progress}%` }}
            />
          </div>
        </div>

        <select
          aria-label={`Update status for ${complaint.id}`}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          data-testid={`status-${complaint.id}`}
          onChange={(event) => onStatusChange(complaint.id, event.target.value as Status)}
          value={complaint.status}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}

function NewComplaintPanel({
  form,
  formMessage,
  onFormChange,
  onSubmit
}: {
  form: NewComplaintForm;
  formMessage: FormMessage;
  onFormChange: (nextForm: NewComplaintForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold tracking-normal text-slate-950">New Complaint</h3>
          <p className="mt-1 text-sm text-slate-500">Capture issue, location, priority, and proof.</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-700">
          <PlusCircle className="h-5 w-5" />
        </div>
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="text-xs font-bold uppercase tracking-normal text-slate-500" htmlFor="title">
            Issue Title
          </label>
          <input
            className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            data-testid="new-title"
            id="title"
            onChange={(event) => onFormChange({ ...form, title: event.target.value })}
            placeholder="e.g. Broken washroom tap"
            value={form.title}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-normal text-slate-500" htmlFor="category">
              Category
            </label>
            <select
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              data-testid="new-category"
              id="category"
              onChange={(event) => onFormChange({ ...form, category: event.target.value })}
              value={form.category}
            >
              {categories
                .filter((category) => category !== "All")
                .map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-normal text-slate-500" htmlFor="priority">
              Priority
            </label>
            <select
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              data-testid="new-priority"
              id="priority"
              onChange={(event) => onFormChange({ ...form, priority: event.target.value as Priority })}
              value={form.priority}
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-normal text-slate-500" htmlFor="location">
            Location
          </label>
          <input
            className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            data-testid="new-location"
            id="location"
            onChange={(event) => onFormChange({ ...form, location: event.target.value })}
            placeholder="Hostel B, Room 214"
            value={form.location}
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-normal text-slate-500" htmlFor="reporter">
            Reporter
          </label>
          <input
            className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            data-testid="new-reporter"
            id="reporter"
            onChange={(event) => onFormChange({ ...form, reporter: event.target.value })}
            placeholder="Name or room number"
            value={form.reporter}
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-normal text-slate-500" htmlFor="description">
            Description
          </label>
          <textarea
            className="mt-2 min-h-24 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            data-testid="new-description"
            id="description"
            onChange={(event) => onFormChange({ ...form, description: event.target.value })}
            placeholder="Explain what happened and how urgent it is."
            value={form.description}
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-normal text-slate-500" htmlFor="photo">
            Photo Proof
          </label>
          <label
            className="mt-2 flex min-h-20 cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-sm font-semibold text-slate-600 transition hover:border-teal-300 hover:bg-teal-50"
            htmlFor="photo"
          >
            <Camera className="h-5 w-5 text-teal-600" />
            <span className="min-w-0 break-words">
              {form.photoName || "Upload complaint photo"}
            </span>
          </label>
          <input
            className="sr-only"
            id="photo"
            onChange={(event) =>
              onFormChange({
                ...form,
                photoName: event.target.files?.[0]?.name ?? ""
              })
            }
            type="file"
          />
        </div>

        {formMessage ? (
          <div
            className={`flex items-start gap-2 rounded-lg border px-3 py-3 text-sm font-semibold ${
              formMessage.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {formMessage.tone === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{formMessage.text}</span>
          </div>
        ) : null}

        <button
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
          data-testid="submit-complaint"
          type="submit"
        >
          <Send className="h-4 w-4" />
          Submit Complaint
        </button>
      </form>
    </section>
  );
}

function StaffColumn({
  complaints,
  onOpenStaff
}: {
  complaints: Complaint[];
  onOpenStaff: () => void;
}) {
  const workloadByStaff = useMemo(() => getWorkloadByStaff(complaints), [complaints]);

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold tracking-normal text-slate-950">Assigned Staff</h3>
          <p className="mt-1 text-sm text-slate-500">Live workload by team member.</p>
        </div>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          data-testid="staff-column-manage"
          type="button"
          onClick={onOpenStaff}
        >
          <UsersRound className="h-4 w-4" />
          Manage
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {staff.map((member) => (
          <div key={member.name} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
              {member.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-950">{member.name}</p>
              <p className="text-xs font-medium text-slate-500">{member.role}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-950">{workloadByStaff[member.name] ?? 0}</p>
              <p className="text-xs font-medium text-slate-500">{member.status}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ComplaintDetailPanel({
  canManageStaff,
  complaint,
  onAssigneeChange,
  onClose,
  onRequestStaffAccess,
  onStatusChange
}: {
  canManageStaff: boolean;
  complaint: Complaint | undefined;
  onAssigneeChange: (id: string, assignee: string) => void;
  onClose: () => void;
  onRequestStaffAccess: () => void;
  onStatusChange: (id: string, status: Status) => void;
}) {
  if (!complaint) {
    return null;
  }

  return (
    <>
      <button
        aria-label="Close complaint details backdrop"
        className="fixed inset-0 z-30 bg-slate-950/20 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        type="button"
      />
      <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-normal text-slate-400">{complaint.id}</p>
            <h3 className="mt-1 text-xl font-bold leading-7 tracking-normal text-slate-950">
              Complaint Details
            </h3>
          </div>
          <button
            aria-label="Close complaint details"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-bold ${priorityStyles[complaint.priority]}`}
            >
              {complaint.priority} Priority
            </span>
            <span
              className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-bold ${statusStyles[complaint.status]}`}
            >
              {complaint.status}
            </span>
          </div>

          <h4 className="mt-4 text-lg font-bold leading-7 text-slate-950">{complaint.title}</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">{complaint.description}</p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-bold uppercase tracking-normal text-slate-400">Location</p>
              <p className="mt-1 text-sm font-semibold leading-5 text-slate-700">{complaint.location}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-bold uppercase tracking-normal text-slate-400">SLA</p>
              <p className="mt-1 text-sm font-semibold leading-5 text-slate-700">{complaint.sla}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-bold uppercase tracking-normal text-slate-400">Reporter</p>
              <p className="mt-1 text-sm font-semibold leading-5 text-slate-700">{complaint.reporter}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-bold uppercase tracking-normal text-slate-400">Updated</p>
              <p className="mt-1 text-sm font-semibold leading-5 text-slate-700">{complaint.updatedAt}</p>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 p-4">
            <label className="text-xs font-bold uppercase tracking-normal text-slate-500" htmlFor="detail-assignee">
              Assign Staff
            </label>
            {canManageStaff ? (
              <select
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                id="detail-assignee"
                onChange={(event) => onAssigneeChange(complaint.id, event.target.value)}
                value={complaint.assignee}
              >
                <option value="Unassigned">Unassigned</option>
                {staff.map((member) => (
                  <option key={member.name} value={member.name}>
                    {member.name} - {member.role}
                  </option>
                ))}
              </select>
            ) : (
              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-700">Current assignee: {complaint.assignee}</p>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Staff assignment is protected. Sign in to manage team workload.
                </p>
                <button
                  className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-bold text-white transition hover:bg-slate-800"
                  data-testid="unlock-staff-assignment"
                  onClick={onRequestStaffAccess}
                  type="button"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Unlock staff access
                </button>
              </div>
            )}

            <label
              className="mt-4 block text-xs font-bold uppercase tracking-normal text-slate-500"
              htmlFor="detail-status"
            >
              Status
            </label>
            <select
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              id="detail-status"
              onChange={(event) => onStatusChange(complaint.id, event.target.value as Status)}
              value={complaint.status}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 p-4">
            <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">
              <span>Resolution progress</span>
              <span>{complaint.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  complaint.priority === "High"
                    ? "bg-red-500"
                    : complaint.status === "Resolved"
                      ? "bg-emerald-500"
                      : "bg-teal-500"
                }`}
                style={{ width: `${complaint.progress}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {statuses.map((status) => (
                <button
                  className={`h-10 rounded-lg border px-3 text-sm font-bold transition ${
                    complaint.status === status
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                  key={status}
                  onClick={() => onStatusChange(complaint.id, status)}
                  type="button"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-teal-700">
                <FileImage className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-950">Photo Proof</p>
                <p className="mt-1 break-words text-sm text-slate-500">
                  {complaint.photoName || "No file attached yet"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-700">
            <Save className="h-4 w-4 shrink-0" />
            Changes are saved in this browser for this workspace.
          </div>
        </div>
      </aside>
    </>
  );
}

function SectionHeader({
  action,
  description,
  icon,
  title
}: {
  action?: ReactNode;
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-700">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold tracking-normal text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function DashboardCommandCenter({
  onViewChange,
  settings,
  stats
}: {
  onViewChange: (view: View) => void;
  settings: AppSettings;
  stats: { high: number; inProgress: number; open: number; resolved: number };
}) {
  const facilityName = settings.defaultCampus.trim() || "Facility";
  const channels = [
    settings.emailAlerts ? "Email" : null,
    settings.smsAlerts ? "SMS" : null
  ].filter(Boolean);

  return (
    <section
      className="mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      data-testid="view-dashboard"
    >
      <div className="grid gap-5 p-4 md:p-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
              <CheckCircle2 className="h-4 w-4" />
              Workspace ready
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
              SLA {settings.highPrioritySlaHours}h for high priority
            </span>
          </div>
          <h3 className="mt-4 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
            {facilityName} Complaint Command Center
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Capture issues, route staff, monitor SLA risk, and prove resolution from one unified operations desk.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-bold text-white transition hover:bg-slate-800"
              data-testid="command-complaints"
              onClick={() => onViewChange("Complaints")}
              type="button"
            >
              <ClipboardList className="h-4 w-4" />
              Review Complaints
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              data-testid="command-analytics"
              onClick={() => onViewChange("Analytics")}
              type="button"
            >
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              data-testid="command-staff"
              onClick={() => onViewChange("Staff")}
              type="button"
            >
              <UsersRound className="h-4 w-4" />
              Manage Staff
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-normal text-slate-500">Open Tickets</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{stats.open}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{stats.high} high priority</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-normal text-slate-500">Active Work</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{stats.inProgress}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">in progress now</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-normal text-slate-500">Alerts</p>
            <p className="mt-2 text-lg font-bold text-slate-950">
              {channels.length ? channels.join(" + ") : "Off"}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">configured in settings</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-normal text-slate-500">Closed</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{stats.resolved}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">with proof trail</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActionToast({
  message,
  onDismiss
}: {
  message: ActionMessage;
  onDismiss: () => void;
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-50 rounded-lg border border-slate-200 bg-white p-3 shadow-panel sm:left-auto sm:w-96"
      data-testid="action-toast"
    >
      <div className="flex items-start gap-3">
        <div
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
            message.tone === "success" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
          }`}
        >
          {message.tone === "success" ? <CheckCircle2 className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-950">Action completed</p>
          <p className="mt-1 break-words text-sm leading-5 text-slate-600">{message.text}</p>
        </div>
        <button
          aria-label="Dismiss notification"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
          onClick={onDismiss}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function HeroMotionScene({
  className,
  testId = "hero-3d-scene"
}: {
  className?: string;
  testId?: string;
}) {
  const sceneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = sceneRef.current;

    if (!mount) {
      return;
    }

    let isCancelled = false;
    let cleanupScene: (() => void) | null = null;
    let frameId: number | null = null;
    const frameState = window as Window & { __resolveHubHero3DFrames?: number };
    frameState.__resolveHubHero3DFrames = 0;

    async function buildScene() {
      const THREE = await import("three");

      if (isCancelled || !mount) {
        return;
      }

      const container = mount;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      camera.position.set(0, 0.2, 8);

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.className = "h-full w-full";
      renderer.domElement.setAttribute("aria-hidden", "true");
      container.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      scene.add(new THREE.AmbientLight(0xffffff, 1.35));

      const keyLight = new THREE.DirectionalLight(0x99f6e4, 2.2);
      keyLight.position.set(3, 4, 5);
      scene.add(keyLight);

      const fillLight = new THREE.PointLight(0x60a5fa, 1.4, 12);
      fillLight.position.set(-4, -2, 4);
      scene.add(fillLight);

      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.32, 2),
        new THREE.MeshPhysicalMaterial({
          color: 0x0f766e,
          emissive: 0x052e2b,
          emissiveIntensity: 0.24,
          metalness: 0.18,
          opacity: 0.92,
          roughness: 0.28,
          transparent: true
        })
      );
      group.add(core);

      const wireframe = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.54, 2),
        new THREE.MeshBasicMaterial({
          color: 0x14b8a6,
          opacity: 0.22,
          transparent: true,
          wireframe: true
        })
      );
      group.add(wireframe);

      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x2563eb,
        opacity: 0.36,
        transparent: true,
        wireframe: true
      });

      const firstRing = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.015, 12, 96), ringMaterial);
      firstRing.rotation.x = Math.PI / 2.7;
      group.add(firstRing);

      const secondRing = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.012, 12, 96), ringMaterial.clone());
      secondRing.rotation.y = Math.PI / 2.5;
      group.add(secondRing);

      const nodeGeometry = new THREE.BoxGeometry(0.58, 0.36, 0.1);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x94a3b8,
        opacity: 0.28,
        transparent: true
      });
      const nodeData = [
        { color: 0xef4444, position: new THREE.Vector3(-2.95, 1.32, 0.35) },
        { color: 0xf59e0b, position: new THREE.Vector3(2.72, 1.03, -0.15) },
        { color: 0x14b8a6, position: new THREE.Vector3(-2.38, -1.48, -0.25) },
        { color: 0x2563eb, position: new THREE.Vector3(2.42, -1.42, 0.28) },
        { color: 0x0f766e, position: new THREE.Vector3(0.08, 2.2, -0.38) }
      ];
      const nodeMeshes = nodeData.map((node) => {
        const card = new THREE.Mesh(
          nodeGeometry,
          new THREE.MeshStandardMaterial({
            color: node.color,
            emissive: node.color,
            emissiveIntensity: 0.08,
            metalness: 0.12,
            roughness: 0.34
          })
        );
        card.position.copy(node.position);
        card.lookAt(new THREE.Vector3(0, 0, 0));
        group.add(card);

        const edge = new THREE.LineSegments(
          new THREE.EdgesGeometry(nodeGeometry),
          new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true })
        );
        card.add(edge);

        const connector = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), node.position]),
          lineMaterial.clone()
        );
        group.add(connector);

        return card;
      });

      const pointer = { x: 0, y: 0 };
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      function resizeScene() {
        const width = Math.max(1, container.clientWidth);
        const height = Math.max(1, container.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        group.scale.setScalar(width < 520 ? (height < 210 ? 0.62 : 0.76) : 1);
      }

      function handlePointerMove(event: PointerEvent) {
        pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
        pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
      }

      const resizeObserver = new ResizeObserver(resizeScene);
      resizeObserver.observe(container);
      window.addEventListener("pointermove", handlePointerMove);
      resizeScene();

      const clock = new THREE.Clock();

      function renderFrame() {
        const elapsed = clock.getElapsedTime();
        group.rotation.y = elapsed * 0.2 + pointer.x * 0.12;
        group.rotation.x = Math.sin(elapsed * 0.38) * 0.07 - pointer.y * 0.1;
        core.rotation.x = elapsed * 0.18;
        core.rotation.y = elapsed * 0.28;
        wireframe.rotation.y = -elapsed * 0.16;
        firstRing.rotation.z = elapsed * 0.18;
        secondRing.rotation.x = elapsed * 0.14;

        nodeMeshes.forEach((node, index) => {
          const basePosition = nodeData[index].position;
          node.position.y = basePosition.y + Math.sin(elapsed * 1.1 + index) * 0.08;
          node.rotation.z = Math.sin(elapsed * 0.7 + index) * 0.04;
        });

        renderer.render(scene, camera);
        frameState.__resolveHubHero3DFrames = (frameState.__resolveHubHero3DFrames ?? 0) + 1;
        container.dataset.frames = String(frameState.__resolveHubHero3DFrames);
      }

      function animate() {
        renderFrame();
        frameId = window.requestAnimationFrame(animate);
      }

      if (prefersReducedMotion) {
        renderFrame();
      } else {
        animate();
      }

      cleanupScene = () => {
        if (frameId) {
          window.cancelAnimationFrame(frameId);
        }

        resizeObserver.disconnect();
        window.removeEventListener("pointermove", handlePointerMove);
        scene.traverse((object) => {
          const disposable = object as unknown as {
            geometry?: { dispose: () => void };
            material?: { dispose: () => void } | Array<{ dispose: () => void }>;
          };

          disposable.geometry?.dispose();

          if (Array.isArray(disposable.material)) {
            disposable.material.forEach((material) => material.dispose());
          } else {
            disposable.material?.dispose();
          }
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    }

    void buildScene();

    return () => {
      isCancelled = true;
      cleanupScene?.();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={
        className ??
        "hero-motion-scene pointer-events-none relative h-64 w-full opacity-95 sm:h-72"
      }
      data-testid={testId}
      ref={sceneRef}
    />
  );
}

function MarketingWebsite({ onOpenProduct }: { onOpenProduct: () => void }) {
  const [lead, setLead] = useState({
    email: "",
    message: "",
    name: "",
    organization: ""
  });
  const [leadMessage, setLeadMessage] = useState<FormMessage>(null);

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!lead.name.trim() || !lead.email.trim() || !lead.organization.trim()) {
      setLeadMessage({
        text: "Add your name, work email, and organization so the sales team can contact you.",
        tone: "error"
      });
      return;
    }

    setLead({
      email: "",
      message: "",
      name: "",
      organization: ""
    });
    setLeadMessage({
      text: "Thanks. Your sales request is ready to be followed up.",
      tone: "success"
    });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-950" data-testid="sales-page">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <button
            className="flex min-w-0 items-center gap-3 text-left"
            onClick={() => scrollToSection("home")}
            type="button"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-teal-600 text-white shadow-sm">
              <Building2 className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-bold tracking-normal text-slate-950">ResolveHub</span>
              <span className="hidden text-xs font-semibold text-slate-500 sm:block">Complaint management software</span>
            </span>
          </button>

          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 lg:flex">
            <button className="transition hover:text-slate-950" onClick={() => scrollToSection("solutions")} type="button">
              Solutions
            </button>
            <button className="transition hover:text-slate-950" onClick={() => scrollToSection("product")} type="button">
              Product
            </button>
            <button className="transition hover:text-slate-950" onClick={() => scrollToSection("pricing")} type="button">
              Pricing
            </button>
            <button className="transition hover:text-slate-950" onClick={() => scrollToSection("contact")} type="button">
              Contact
            </button>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              className="hidden h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
              onClick={onOpenProduct}
              type="button"
            >
              Product workspace
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
              onClick={() => scrollToSection("contact")}
              type="button"
            >
              Talk to sales
            </button>
          </div>
        </div>
      </header>

      <section
        className="relative mx-auto grid max-w-7xl gap-10 overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-8 lg:pb-20 lg:pt-16"
        id="home"
      >
        <div className="relative z-10 min-w-0">
          <div className="inline-flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-bold text-teal-800">
            <BadgeCheck className="h-4 w-4" />
            Built for real facility teams
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
            Facility complaint management <span className="block sm:inline">software</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            ResolveHub helps hostels, colleges, apartments, and offices collect complaints, assign staff, monitor SLA risk, and prove resolution from one clean workspace.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
              data-testid="sales-open-workspace"
              onClick={onOpenProduct}
              type="button"
            >
              View product workspace
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              onClick={() => scrollToSection("pricing")}
              type="button"
            >
              See pricing
            </button>
          </div>

          <div className="mt-8 lg:hidden">
            <HeroMotionScene
              className="hero-motion-scene pointer-events-none relative h-44 w-full opacity-95"
              testId="hero-3d-scene-mobile"
            />
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-4 border-y border-slate-200 py-5">
            <div>
              <p className="text-2xl font-bold text-slate-950">4x</p>
              <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">faster assignment</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-950">24/7</p>
              <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">issue intake</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-950">100%</p>
              <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">resolution trail</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 min-w-0">
          <HeroMotionScene className="hero-motion-scene pointer-events-none hidden h-64 w-full opacity-95 sm:h-72 lg:block" />

          <div className="motion-card-3d mt-4 min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-normal text-slate-500">Live operations</p>
                  <h2 className="mt-1 text-lg font-bold text-slate-950">Priority Queue</h2>
                </div>
                <span className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">2 SLA risks</span>
              </div>

              <div className="mt-4 space-y-3">
                {initialComplaints.slice(0, 3).map((complaint) => (
                  <div className="rounded-lg border border-slate-100 p-3" key={complaint.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-400">{complaint.id}</p>
                        <p className="mt-1 text-sm font-bold leading-5 text-slate-950">{complaint.title}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{complaint.assignee}</p>
                      </div>
                      <span className={`shrink-0 rounded-md border px-2 py-1 text-xs font-bold ${priorityStyles[complaint.priority]}`}>
                        {complaint.priority}
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-teal-500" style={{ width: `${complaint.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-500">Open</p>
                  <p className="mt-1 text-xl font-bold text-slate-950">3</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-500">Working</p>
                  <p className="mt-1 text-xl font-bold text-slate-950">1</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-500">Closed</p>
                  <p className="mt-1 text-xl font-bold text-slate-950">1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-16" id="solutions">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-normal text-slate-950">Built for places where people expect fast service</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Sell ResolveHub to any organization that receives repeated facility complaints and needs accountability.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {solutionCards.map((solution) => (
              <article className="motion-card-3d rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={solution.title}>
                <Building2 className="h-6 w-6 text-teal-700" />
                <h3 className="mt-4 text-lg font-bold text-slate-950">{solution.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{solution.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="product">
        <div className="grid gap-10 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start">
          <div>
            <h2 className="text-3xl font-bold tracking-normal text-slate-950">A complete resolver workspace, not just a form</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Customers can inspect the working product: complaint intake, priority queue, analytics, staff assignments, and configurable settings.
            </p>
            <button
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
              onClick={onOpenProduct}
              type="button"
            >
              Open live workspace
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {salesFeatures.map((feature) => (
              <article className="motion-card-3d rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={feature.title}>
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-teal-50 text-teal-700">{feature.icon}</div>
                <h3 className="mt-4 text-base font-bold text-slate-950">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-950 py-16 text-white" id="pricing">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-normal">Simple pricing for early customers</h2>
              <p className="mt-3 text-base leading-7 text-slate-300">
                Use these packages as your selling structure and adjust the final quote per customer size.
              </p>
            </div>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              onClick={() => scrollToSection("contact")}
              type="button"
            >
              Request a quote
            </button>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article className="motion-card-3d rounded-lg border border-white/10 bg-white/5 p-5" key={plan.name}>
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-3 text-3xl font-bold">{plan.price}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{plan.copy}</p>
                <div className="mt-5 space-y-3">
                  {plan.features.map((feature) => (
                    <div className="flex items-start gap-2 text-sm font-semibold text-slate-200" key={feature}>
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_460px] lg:px-8" id="contact">
        <div>
          <h2 className="text-3xl font-bold tracking-normal text-slate-950">Ready to sell ResolveHub to a customer?</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Use the contact form during your pitch to collect buyer interest, then open the live workspace and walk them through the product.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <Mail className="h-5 w-5 text-teal-700" />
              <p className="mt-3 text-sm font-bold text-slate-950">Sales follow-up</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">Collect lead details and next steps after the presentation.</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <ShieldCheck className="h-5 w-5 text-teal-700" />
              <p className="mt-3 text-sm font-bold text-slate-950">Buyer confidence</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">Show a product that already has real working flows.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <a
              className="rounded-lg border border-slate-200 p-4 transition hover:border-teal-200 hover:bg-teal-50"
              href={`tel:${salesPhone}`}
            >
              <Phone className="h-5 w-5 text-teal-700" />
              <p className="mt-3 text-sm font-bold text-slate-950">Call sales</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{salesPhone}</p>
            </a>
            <a
              className="rounded-lg border border-slate-200 p-4 transition hover:border-teal-200 hover:bg-teal-50"
              href={`mailto:${salesEmail}`}
            >
              <Mail className="h-5 w-5 text-teal-700" />
              <p className="mt-3 text-sm font-bold text-slate-950">Email sales</p>
              <p className="mt-1 break-words text-sm font-semibold leading-6 text-slate-600">{salesEmail}</p>
            </a>
          </div>
        </div>

        <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleLeadSubmit}>
          <h3 className="text-lg font-bold text-slate-950">Contact sales</h3>
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-normal text-slate-500" htmlFor="lead-name">
                Name
              </label>
              <input
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                id="lead-name"
                onChange={(event) => setLead({ ...lead, name: event.target.value })}
                placeholder="Customer name"
                value={lead.name}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-normal text-slate-500" htmlFor="lead-email">
                Work Email
              </label>
              <input
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                id="lead-email"
                onChange={(event) => setLead({ ...lead, email: event.target.value })}
                placeholder="name@organization.com"
                type="email"
                value={lead.email}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-normal text-slate-500" htmlFor="lead-organization">
                Organization
              </label>
              <input
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                id="lead-organization"
                onChange={(event) => setLead({ ...lead, organization: event.target.value })}
                placeholder="College, apartment, office..."
                value={lead.organization}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-normal text-slate-500" htmlFor="lead-message">
                Requirement
              </label>
              <textarea
                className="mt-2 min-h-24 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm leading-6 text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                id="lead-message"
                onChange={(event) => setLead({ ...lead, message: event.target.value })}
                placeholder="Number of buildings, users, or teams"
                value={lead.message}
              />
            </div>
          </div>

          {leadMessage ? (
            <div
              className={`mt-4 flex items-start gap-2 rounded-lg border px-3 py-3 text-sm font-semibold ${
                leadMessage.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {leadMessage.tone === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>{leadMessage.text}</span>
            </div>
          ) : null}

          <button
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
            type="submit"
          >
            Submit sales request
            <Send className="h-4 w-4" />
          </button>
        </form>
      </section>

      <footer className="border-t border-slate-200 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm font-semibold text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>ResolveHub. Facility complaint management software.</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <a className="text-slate-700 transition hover:text-teal-700" href={`tel:${salesPhone}`}>
              {salesPhone}
            </a>
            <a className="break-words text-slate-700 transition hover:text-teal-700" href={`mailto:${salesEmail}`}>
              {salesEmail}
            </a>
            <button className="text-slate-950 transition hover:text-teal-700" onClick={onOpenProduct} type="button">
              Open product workspace
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ComplaintFilters({
  activeCategory,
  activePriority,
  onCategoryChange,
  onPriorityChange,
  onQueryChange,
  query
}: {
  activeCategory: string;
  activePriority: Priority | "All";
  onCategoryChange: (category: string) => void;
  onPriorityChange: (priority: Priority | "All") => void;
  onQueryChange: (query: string) => void;
  query: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 lg:min-w-80">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            aria-label="Search complaints"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search tickets, locations, staff..."
            type="search"
            value={query}
          />
        </div>
        <select
          aria-label="Filter by priority"
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          onChange={(event) => onPriorityChange(event.target.value as Priority | "All")}
          value={activePriority}
        >
          <option value="All">All Priorities</option>
          {priorities.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition ${
              activeCategory === category
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
            key={category}
            onClick={() => onCategoryChange(category)}
            type="button"
          >
            {category === "All" ? <Filter className="h-4 w-4" /> : categoryIcons[category]}
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

function ComplaintList({
  complaints,
  emptyCopy,
  onSelect,
  onStatusChange
}: {
  complaints: Complaint[];
  emptyCopy: string;
  onSelect: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
}) {
  if (complaints.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <CalendarClock className="mx-auto h-8 w-8 text-slate-400" />
        <h3 className="mt-3 text-base font-bold text-slate-950">No matching complaints</h3>
        <p className="mt-2 text-sm text-slate-500">{emptyCopy}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <ComplaintCard
          complaint={complaint}
          key={complaint.id}
          onSelect={onSelect}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}

function ComplaintsView({
  activeCategory,
  activePriority,
  complaints,
  filteredComplaints,
  onCategoryChange,
  onExport,
  onPriorityChange,
  onQueryChange,
  onReset,
  onSelect,
  onStatusChange,
  query,
  stats
}: {
  activeCategory: string;
  activePriority: Priority | "All";
  complaints: Complaint[];
  filteredComplaints: Complaint[];
  onCategoryChange: (category: string) => void;
  onExport: () => void;
  onPriorityChange: (priority: Priority | "All") => void;
  onQueryChange: (query: string) => void;
  onReset: () => void;
  onSelect: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
  query: string;
  stats: { high: number; inProgress: number; open: number; resolved: number };
}) {
  return (
    <div className="space-y-5" data-testid="view-complaints">
      <SectionHeader
        action={
          <div className="flex gap-2">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              data-testid="export-csv"
              onClick={onExport}
              type="button"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              data-testid="reset-workspace-data"
              onClick={onReset}
              type="button"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        }
        description="Search, filter, export, update status, and open complaint details from one place."
        icon={<ClipboardList className="h-5 w-5" />}
        title="Complaints"
      />
      <section className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          detail={`${filteredComplaints.length} visible of ${complaints.length} total complaints.`}
          icon={<ListChecks className="h-5 w-5" />}
          label="Filtered"
          tone="bg-blue-50 text-blue-700"
          value={String(filteredComplaints.length)}
        />
        <StatCard
          detail="Open complaints still need attention."
          icon={<ClipboardList className="h-5 w-5" />}
          label="Open"
          tone="bg-teal-50 text-teal-700"
          value={String(stats.open)}
        />
        <StatCard
          detail="High priority tickets across the property."
          icon={<AlertTriangle className="h-5 w-5" />}
          label="High"
          tone="bg-red-50 text-red-700"
          value={String(stats.high)}
        />
        <StatCard
          detail="Closed complaints in this workspace."
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Resolved"
          tone="bg-emerald-50 text-emerald-700"
          value={String(stats.resolved)}
        />
      </section>
      <ComplaintFilters
        activeCategory={activeCategory}
        activePriority={activePriority}
        onCategoryChange={onCategoryChange}
        onPriorityChange={onPriorityChange}
        onQueryChange={onQueryChange}
        query={query}
      />
      <ComplaintList
        complaints={filteredComplaints}
        emptyCopy="Try a different category, priority, or search term."
        onSelect={onSelect}
        onStatusChange={onStatusChange}
      />
    </div>
  );
}

function AnalyticsView({ complaints }: { complaints: Complaint[] }) {
  const categoryCounts = useMemo(() => getCategoryCounts(complaints), [complaints]);
  const statusCounts = useMemo(
    () =>
      statuses.map((status) => ({
        count: complaints.filter((complaint) => complaint.status === status).length,
        status
      })),
    [complaints]
  );
  const maxCategoryCount = Math.max(1, ...categoryCounts.map((item) => item.count));
  const total = Math.max(1, complaints.length);
  const resolved = complaints.filter((complaint) => complaint.status === "Resolved").length;
  const highOpen = complaints.filter(
    (complaint) => complaint.priority === "High" && complaint.status !== "Resolved"
  ).length;
  const resolutionRate = Math.round((resolved / total) * 100);

  return (
    <div className="space-y-5" data-testid="view-analytics">
      <SectionHeader
        description="Live analytics update automatically as complaints are created, assigned, and resolved."
        icon={<BarChart3 className="h-5 w-5" />}
        title="Analytics"
      />
      <section className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          detail="Share of total complaints that are resolved."
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Resolution Rate"
          tone="bg-emerald-50 text-emerald-700"
          value={`${resolutionRate}%`}
        />
        <StatCard
          detail="High-priority tickets that still need follow-up."
          icon={<Siren className="h-5 w-5" />}
          label="SLA Risk"
          tone="bg-red-50 text-red-700"
          value={String(highOpen)}
        />
        <StatCard
          detail="Average progress across active tickets."
          icon={<TimerReset className="h-5 w-5" />}
          label="Active Progress"
          tone="bg-amber-50 text-amber-700"
          value={`${Math.round(
            complaints.reduce((sum, complaint) => sum + complaint.progress, 0) / total
          )}%`}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-950">Category Breakdown</h3>
          <div className="mt-5 space-y-4">
            {categoryCounts.map((item) => (
              <div key={item.category}>
                <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-600">
                  <span className="flex items-center gap-2">
                    {categoryIcons[item.category]}
                    {item.category}
                  </span>
                  <span>{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{ width: `${(item.count / maxCategoryCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-950">Status Mix</h3>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {statusCounts.map((item) => (
              <div className="rounded-lg border border-slate-100 p-4" key={item.status}>
                <p className="text-sm font-bold text-slate-950">{item.status}</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{item.count}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {Math.round((item.count / total) * 100)}% of total
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StaffAccessGate({
  hasSavedAccess,
  onUnlock
}: {
  hasSavedAccess: boolean;
  onUnlock: () => void;
}) {
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">(hasSavedAccess ? "signIn" : "signUp");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<FormMessage>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.trim() !== STAFF_ACCESS_PASSWORD) {
      setMessage({
        text: "Incorrect password. Please enter the staff access password.",
        tone: "error"
      });
      return;
    }

    setPassword("");
    setMessage({
      text: authMode === "signUp" ? "Staff access created for this browser." : "Staff access confirmed.",
      tone: "success"
    });
    onUnlock();
  }

  return (
    <div className="space-y-5" data-testid="staff-auth-gate">
      <SectionHeader
        description="Staff management is protected because it controls team workload and ticket reassignment."
        icon={<ShieldCheck className="h-5 w-5" />}
        title="Staff Access Required"
      />

      <section className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
          <button
            className={`h-10 rounded-lg text-sm font-bold transition ${
              authMode === "signIn" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
            }`}
            data-testid="staff-auth-sign-in-tab"
            onClick={() => {
              setAuthMode("signIn");
              setMessage(null);
            }}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`h-10 rounded-lg text-sm font-bold transition ${
              authMode === "signUp" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
            }`}
            data-testid="staff-auth-sign-up-tab"
            onClick={() => {
              setAuthMode("signUp");
              setMessage(null);
            }}
            type="button"
          >
            Sign Up
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-bold uppercase tracking-normal text-slate-500" htmlFor="staff-password">
              Staff Password
            </label>
            <input
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              data-testid="staff-auth-password"
              id="staff-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter staff access password"
              type="password"
              value={password}
            />
          </div>

          <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 text-sm font-semibold leading-5 text-blue-800">
            {authMode === "signUp"
              ? "Sign up once on this browser to remember staff access for future visits."
              : "Sign in with the saved staff access password to continue."}
          </p>

          {message ? (
            <div
              className={`flex items-start gap-2 rounded-lg border px-3 py-3 text-sm font-semibold ${
                message.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.tone === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          ) : null}

          <button
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
            data-testid="staff-auth-submit"
            type="submit"
          >
            <ShieldCheck className="h-4 w-4" />
            {authMode === "signUp" ? "Create Staff Access" : "Sign In"}
          </button>
        </form>
      </section>
    </div>
  );
}

function StaffView({
  complaints,
  hasSavedAccess,
  isAuthenticated,
  onAssigneeChange,
  onSelect,
  onSignOut,
  onUnlock
}: {
  complaints: Complaint[];
  hasSavedAccess: boolean;
  isAuthenticated: boolean;
  onAssigneeChange: (id: string, assignee: string) => void;
  onSelect: (id: string) => void;
  onSignOut: () => void;
  onUnlock: () => void;
}) {
  const [selectedStaff, setSelectedStaff] = useState(staff[0].name);
  const workloadByStaff = useMemo(() => getWorkloadByStaff(complaints), [complaints]);
  const selectedStaffComplaints = complaints.filter((complaint) => complaint.assignee === selectedStaff);

  if (!isAuthenticated) {
    return <StaffAccessGate hasSavedAccess={hasSavedAccess} onUnlock={onUnlock} />;
  }

  return (
    <div className="space-y-5" data-testid="view-staff">
      <SectionHeader
        action={
          <button
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            data-testid="staff-sign-out"
            onClick={onSignOut}
            type="button"
          >
            <ShieldCheck className="h-4 w-4" />
            Sign Out
          </button>
        }
        description="Monitor staff load, inspect assigned tickets, and reassign active complaints."
        icon={<UsersRound className="h-5 w-5" />}
        title="Staff"
      />
      <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-3">
          {staff.map((member) => (
            <button
              className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition ${
                selectedStaff === member.name
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              key={member.name}
              onClick={() => setSelectedStaff(member.name)}
              type="button"
            >
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg text-sm font-bold ${
                  selectedStaff === member.name ? "bg-white text-slate-950" : "bg-slate-100 text-slate-700"
                }`}
              >
                {member.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{member.name}</p>
                <p className={selectedStaff === member.name ? "text-xs text-slate-200" : "text-xs text-slate-500"}>
                  {member.role} - {member.status}
                </p>
              </div>
              <span className="rounded-lg bg-white/10 px-2 py-1 text-sm font-bold">
                {workloadByStaff[member.name] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-950">{selectedStaff}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {selectedStaffComplaints.length} assigned ticket{selectedStaffComplaints.length === 1 ? "" : "s"}.
              </p>
            </div>
            <UserCheck className="h-5 w-5 text-teal-700" />
          </div>
          <div className="mt-4 space-y-3">
            {selectedStaffComplaints.length ? (
              selectedStaffComplaints.map((complaint) => (
                <div className="rounded-lg border border-slate-100 p-3" key={complaint.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-400">{complaint.id}</p>
                      <p className="mt-1 text-sm font-bold text-slate-950">{complaint.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{complaint.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                        onClick={() => onSelect(complaint.id)}
                        type="button"
                      >
                        Details
                      </button>
                      <select
                        aria-label={`Reassign ${complaint.id}`}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none"
                        onChange={(event) => onAssigneeChange(complaint.id, event.target.value)}
                        value={complaint.assignee}
                      >
                        <option value="Unassigned">Unassigned</option>
                        {staff.map((member) => (
                          <option key={member.name} value={member.name}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
                <UserCheck className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-3 text-sm font-semibold text-slate-600">No complaints assigned to this staff member.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function SettingsView({
  onReset,
  onSettingsChange,
  settings
}: {
  onReset: () => void;
  onSettingsChange: (settings: AppSettings) => void;
  settings: AppSettings;
}) {
  return (
    <div className="space-y-5" data-testid="view-settings">
      <SectionHeader
        description="Tune workspace behavior for your facility workflow. These settings persist in this browser."
        icon={<SlidersHorizontal className="h-5 w-5" />}
        title="Settings"
      />
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-950">Automation</h3>
          <div className="mt-5 space-y-4">
            <label className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
              <input
                checked={settings.autoAssign}
                className="mt-1 h-4 w-4 accent-teal-700"
                data-testid="setting-auto-assign"
                onChange={(event) => onSettingsChange({ ...settings, autoAssign: event.target.checked })}
                type="checkbox"
              />
              <span>
                <span className="block text-sm font-bold text-slate-950">Auto-assign new complaints</span>
                <span className="mt-1 block text-sm text-slate-500">
                  Route complaints to the right staff member based on category.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
              <input
                checked={settings.emailAlerts}
                className="mt-1 h-4 w-4 accent-teal-700"
                data-testid="setting-email-alerts"
                onChange={(event) => onSettingsChange({ ...settings, emailAlerts: event.target.checked })}
                type="checkbox"
              />
              <span>
                <span className="block text-sm font-bold text-slate-950">Email alerts</span>
                <span className="mt-1 block text-sm text-slate-500">Show email notification readiness in the workspace.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
              <input
                checked={settings.smsAlerts}
                className="mt-1 h-4 w-4 accent-teal-700"
                data-testid="setting-sms-alerts"
                onChange={(event) => onSettingsChange({ ...settings, smsAlerts: event.target.checked })}
                type="checkbox"
              />
              <span>
                <span className="block text-sm font-bold text-slate-950">SMS alerts</span>
                <span className="mt-1 block text-sm text-slate-500">Mark urgent updates as SMS-ready.</span>
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <label className="text-xs font-bold uppercase tracking-normal text-slate-500" htmlFor="default-campus">
              Facility Name
            </label>
            <input
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              data-testid="setting-facility-name"
              id="default-campus"
              onChange={(event) => onSettingsChange({ ...settings, defaultCampus: event.target.value })}
              value={settings.defaultCampus}
            />
            <label
              className="mt-4 block text-xs font-bold uppercase tracking-normal text-slate-500"
              htmlFor="sla-hours"
            >
              High Priority SLA Hours
            </label>
            <input
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              data-testid="setting-sla-hours"
              id="sla-hours"
              max={24}
              min={1}
              onChange={(event) =>
                onSettingsChange({
                  ...settings,
                  highPrioritySlaHours: Number(event.target.value)
                })
              }
              type="number"
              value={settings.highPrioritySlaHours}
            />
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <div className="flex items-center gap-2 font-bold">
              <Database className="h-4 w-4" />
              Workspace Storage
            </div>
            <p className="mt-2 leading-6">
              Complaints and settings are saved locally so the workspace survives refreshes.
            </p>
            <button
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-bold text-emerald-800"
              data-testid="settings-reset-all"
              onClick={onReset}
              type="button"
            >
              <RotateCcw className="h-4 w-4" />
              Reset all workspace data
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          detail={settings.emailAlerts ? "Email-ready for new updates." : "Email alerts are turned off."}
          icon={<Mail className="h-5 w-5" />}
          label="Email"
          tone="bg-blue-50 text-blue-700"
          value={settings.emailAlerts ? "On" : "Off"}
        />
        <StatCard
          detail={settings.smsAlerts ? "SMS-ready for urgent tickets." : "SMS alerts are turned off."}
          icon={<Smartphone className="h-5 w-5" />}
          label="SMS"
          tone="bg-teal-50 text-teal-700"
          value={settings.smsAlerts ? "On" : "Off"}
        />
        <StatCard
          detail="Useful when presenting how the startup can scale."
          icon={<FileText className="h-5 w-5" />}
          label="Workspace"
          tone="bg-amber-50 text-amber-700"
          value="Ready"
        />
      </section>
    </div>
  );
}

function ProductWorkspace({ onBackToSite }: { onBackToSite: () => void }) {
  const [activeView, setActiveView] = useState<View>("Dashboard");
  const [complaints, setComplaints] = useState(initialComplaints);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activePriority, setActivePriority] = useState<Priority | "All">("All");
  const [hasLoadedSavedComplaints, setHasLoadedSavedComplaints] = useState(false);
  const [hasLoadedSavedSettings, setHasLoadedSavedSettings] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<NewComplaintForm>(defaultForm);
  const [formMessage, setFormMessage] = useState<FormMessage>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<ActionMessage>(null);
  const [staffAccess, setStaffAccess] = useState({
    hasSavedAccess: false,
    isAuthenticated: false
  });

  useEffect(() => {
    let isMounted = true;
    const loadSavedComplaints = window.setTimeout(() => {
      try {
        const savedComplaints = window.localStorage.getItem(STORAGE_KEY);

        if (savedComplaints) {
          const parsedComplaints = JSON.parse(savedComplaints) as Complaint[];

          if (Array.isArray(parsedComplaints) && parsedComplaints.length > 0 && isMounted) {
            setComplaints(
              parsedComplaints.map((complaint) => ({
                ...complaint,
                updatedAt: complaint.updatedAt ?? complaint.createdAt ?? "Just now"
              }))
            );
          }
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        if (isMounted) {
          setHasLoadedSavedComplaints(true);
        }
      }
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(loadSavedComplaints);
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedSavedComplaints) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  }, [complaints, hasLoadedSavedComplaints]);

  useEffect(() => {
    let isMounted = true;
    const loadSavedSettings = window.setTimeout(() => {
      try {
        const savedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);

        if (savedSettings && isMounted) {
          setSettings({
            ...defaultSettings,
            ...(JSON.parse(savedSettings) as Partial<AppSettings>)
          });
        }
      } catch {
        window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
      } finally {
        if (isMounted) {
          setHasLoadedSavedSettings(true);
        }
      }
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(loadSavedSettings);
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedSavedSettings) {
      return;
    }

    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [hasLoadedSavedSettings, settings]);

  useEffect(() => {
    let isMounted = true;
    const loadStaffAccess = window.setTimeout(() => {
      try {
        const savedStaffAccess = window.localStorage.getItem(STAFF_AUTH_STORAGE_KEY);

        if (!savedStaffAccess) {
          return;
        }

        const parsedStaffAccess = JSON.parse(savedStaffAccess) as Partial<typeof staffAccess>;

        if (parsedStaffAccess.hasSavedAccess && isMounted) {
          setStaffAccess({
            hasSavedAccess: true,
            isAuthenticated: true
          });
        }
      } catch {
        window.localStorage.removeItem(STAFF_AUTH_STORAGE_KEY);
      }
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(loadStaffAccess);
    };
  }, []);

  useEffect(() => {
    if (!actionMessage) {
      return;
    }

    const timer = window.setTimeout(() => setActionMessage(null), 2800);

    return () => window.clearTimeout(timer);
  }, [actionMessage]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const matchesCategory = activeCategory === "All" || complaint.category === activeCategory;
      const matchesPriority = activePriority === "All" || complaint.priority === activePriority;
      const searchable = `${complaint.id} ${complaint.title} ${complaint.location} ${complaint.assignee} ${complaint.reporter}`.toLowerCase();
      const matchesSearch = searchable.includes(query.trim().toLowerCase());

      return matchesCategory && matchesPriority && matchesSearch;
    });
  }, [activeCategory, activePriority, complaints, query]);

  const stats = useMemo(() => {
    const open = complaints.filter((complaint) => complaint.status !== "Resolved").length;
    const high = complaints.filter((complaint) => complaint.priority === "High" && complaint.status !== "Resolved").length;
    const inProgress = complaints.filter((complaint) => complaint.status === "In Progress").length;
    const resolved = complaints.filter((complaint) => complaint.status === "Resolved").length;

    return { open, high, inProgress, resolved };
  }, [complaints]);

  const selectedComplaint = useMemo(() => {
    return complaints.find((complaint) => complaint.id === selectedComplaintId);
  }, [complaints, selectedComplaintId]);

  function notify(text: string, tone: "success" | "info" = "success") {
    setActionMessage({ text, tone });
  }

  function handleViewChange(view: View) {
    setActiveView(view);

    if (view === "Staff" && !staffAccess.isAuthenticated) {
      notify("Staff management requires password access.", "info");
    }
  }

  function handleStaffUnlock() {
    const nextStaffAccess = {
      hasSavedAccess: true,
      isAuthenticated: true
    };

    setStaffAccess(nextStaffAccess);
    window.localStorage.setItem(STAFF_AUTH_STORAGE_KEY, JSON.stringify(nextStaffAccess));
    notify("Staff access unlocked and saved for this browser.");
  }

  function handleStaffSignOut() {
    window.localStorage.removeItem(STAFF_AUTH_STORAGE_KEY);
    setStaffAccess({
      hasSavedAccess: false,
      isAuthenticated: false
    });
    notify("Staff access has been signed out.", "info");
  }

  function handleStatusChange(id: string, status: Status) {
    setComplaints((currentComplaints) =>
      currentComplaints.map((complaint) => {
        if (complaint.id !== id) {
          return complaint;
        }

        return {
          ...complaint,
          status,
          progress: getProgressForStatus(status),
          sla: status === "Resolved" ? "Closed just now" : complaint.sla,
          updatedAt: "Just now"
        };
      })
    );
    notify(`${id} moved to ${status}.`);
  }

  function handleAssigneeChange(id: string, assignee: string) {
    setComplaints((currentComplaints) =>
      currentComplaints.map((complaint) => {
        if (complaint.id !== id) {
          return complaint;
        }

        const nextStatus = assignee === "Unassigned" ? "New" : "Assigned";

        return {
          ...complaint,
          assignee,
          status: complaint.status === "Resolved" ? complaint.status : nextStatus,
          progress: complaint.status === "Resolved" ? complaint.progress : getProgressForStatus(nextStatus),
          updatedAt: "Just now"
        };
      })
    );
    notify(`${id} assigned to ${assignee}.`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim() || !form.location.trim() || !form.description.trim()) {
      setFormMessage({
        text: "Add the issue title, location, and description before submitting.",
        tone: "error"
      });
      return;
    }

    const suggestedAssignee = settings.autoAssign ? (assigneeByCategory[form.category] ?? "Unassigned") : "Unassigned";
    const newComplaint: Complaint = {
      id: getNextComplaintId(complaints),
      title: form.title.trim(),
      category: form.category,
      location: form.location.trim(),
      priority: form.priority,
      status: suggestedAssignee === "Unassigned" ? "New" : "Assigned",
      assignee: suggestedAssignee,
      reporter: form.reporter.trim() || "Resident",
      createdAt: "Just now",
      sla: getSlaForPriority(form.priority, settings.highPrioritySlaHours),
      progress: getProgressForStatus(suggestedAssignee === "Unassigned" ? "New" : "Assigned"),
      description: form.description.trim(),
      photoName: form.photoName || "photo pending",
      updatedAt: "Just now"
    };

    setComplaints((currentComplaints) => [newComplaint, ...currentComplaints]);
    setActiveCategory("All");
    setActivePriority("All");
    setForm(defaultForm);
    setSelectedComplaintId(newComplaint.id);
    setFormMessage({
      text: `${newComplaint.id} created and routed to ${newComplaint.assignee}.`,
      tone: "success"
    });
    notify(`${newComplaint.id} created and routed to ${newComplaint.assignee}.`);
  }

  function handleResetWorkspaceData() {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
    setComplaints(initialComplaints);
    setSettings(defaultSettings);
    setSelectedComplaintId(null);
    setFormMessage({
      text: "Workspace data has been reset.",
      tone: "success"
    });
    notify("Workspace complaints and settings were reset.");
  }

  function handleExportCsv() {
    const headers = [
      "id",
      "title",
      "category",
      "location",
      "priority",
      "status",
      "assignee",
      "reporter",
      "sla",
      "updatedAt"
    ];
    const escapeCsv = (value: string | number) => `"${String(value).replaceAll("\"", "\"\"")}"`;
    const csv = [
      headers.join(","),
      ...complaints.map((complaint) =>
        headers
          .map((header) => escapeCsv(complaint[header as keyof Complaint] ?? ""))
          .join(",")
      )
    ].join("\n");
    const url = window.URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "resolvehub-complaints.csv";
    link.click();
    window.URL.revokeObjectURL(url);
    notify("Complaint CSV export started.", "info");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950">
      <div className="flex min-h-screen min-w-0">
        <Sidebar activeView={activeView} highPriorityCount={stats.high} onViewChange={handleViewChange} />

        <div className="min-w-0 flex-1 overflow-x-hidden">
          <TopBar
            activeView={activeView}
            facilityName={settings.defaultCampus}
            onBackToSite={onBackToSite}
            onSearchChange={setQuery}
            onViewChange={handleViewChange}
            query={query}
          />
          <MobileNav activeView={activeView} onViewChange={handleViewChange} />

          <div className="min-w-0 px-4 py-5 md:px-6 lg:px-8">
            {activeView === "Dashboard" ? (
              <>
            <DashboardCommandCenter
              onViewChange={handleViewChange}
              settings={settings}
              stats={stats}
            />

            <section className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                detail="Open tickets across hostels, college blocks, and apartments."
                icon={<ClipboardList className="h-5 w-5" />}
                label="Open Complaints"
                tone="bg-teal-50 text-teal-700"
                value={String(stats.open)}
              />
              <StatCard
                detail="Needs quick assignment before the SLA window gets tight."
                icon={<AlertTriangle className="h-5 w-5" />}
                label="High Priority"
                tone="bg-red-50 text-red-700"
                value={String(stats.high)}
              />
              <StatCard
                detail="Teams are actively working on these complaints."
                icon={<Wrench className="h-5 w-5" />}
                label="In Progress"
                tone="bg-amber-50 text-amber-700"
                value={String(stats.inProgress)}
              />
              <StatCard
                detail="Closed tickets today with proof and final status."
                icon={<CheckCircle2 className="h-5 w-5" />}
                label="Resolved Today"
                tone="bg-emerald-50 text-emerald-700"
                value={String(stats.resolved)}
              />
            </section>

            <section className="mt-6 grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
              <div className="min-w-0">
                <div className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="text-lg font-bold tracking-normal text-slate-950">Priority Queue</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Sort, assign, and close complaints from one live desk.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
                        <Search className="h-4 w-4 shrink-0 text-slate-400" />
                        <input
                          aria-label="Search complaints"
                          className="min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                          onChange={(event) => setQuery(event.target.value)}
                          placeholder="Search tickets"
                          type="search"
                          value={query}
                        />
                      </div>
                      <select
                        aria-label="Filter by priority"
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                        onChange={(event) => setActivePriority(event.target.value as Priority | "All")}
                        value={activePriority}
                      >
                        <option value="All">All Priorities</option>
                        {priorities.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </select>
                      <button
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                        onClick={handleResetWorkspaceData}
                        type="button"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
                    {categories.map((category) => (
                      <button
                        className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition ${
                          activeCategory === category
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        type="button"
                      >
                        {category === "All" ? <Filter className="h-4 w-4" /> : categoryIcons[category]}
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  {filteredComplaints.map((complaint) => (
                    <ComplaintCard
                      complaint={complaint}
                      key={complaint.id}
                      onSelect={setSelectedComplaintId}
                      onStatusChange={handleStatusChange}
                    />
                  ))}

                  {filteredComplaints.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
                      <CalendarClock className="mx-auto h-8 w-8 text-slate-400" />
                      <h3 className="mt-3 text-base font-bold text-slate-950">No matching complaints</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        Try a different category, priority, or search term.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="min-w-0 space-y-6">
                <NewComplaintPanel
                  form={form}
                  formMessage={formMessage}
                  onFormChange={setForm}
                  onSubmit={handleSubmit}
                />
                <StaffColumn complaints={complaints} onOpenStaff={() => handleViewChange("Staff")} />
              </div>
            </section>
              </>
            ) : null}

            {activeView === "Complaints" ? (
              <ComplaintsView
                activeCategory={activeCategory}
                activePriority={activePriority}
                complaints={complaints}
                filteredComplaints={filteredComplaints}
                onCategoryChange={setActiveCategory}
                onExport={handleExportCsv}
                onPriorityChange={setActivePriority}
                onQueryChange={setQuery}
                onReset={handleResetWorkspaceData}
                onSelect={setSelectedComplaintId}
                onStatusChange={handleStatusChange}
                query={query}
                stats={stats}
              />
            ) : null}

            {activeView === "Analytics" ? <AnalyticsView complaints={complaints} /> : null}

            {activeView === "Staff" ? (
              <StaffView
                complaints={complaints}
                hasSavedAccess={staffAccess.hasSavedAccess}
                isAuthenticated={staffAccess.isAuthenticated}
                onAssigneeChange={handleAssigneeChange}
                onSelect={setSelectedComplaintId}
                onSignOut={handleStaffSignOut}
                onUnlock={handleStaffUnlock}
              />
            ) : null}

            {activeView === "Settings" ? (
              <SettingsView
                onReset={handleResetWorkspaceData}
                onSettingsChange={setSettings}
                settings={settings}
              />
            ) : null}
          </div>
        </div>
      </div>
      <ComplaintDetailPanel
        canManageStaff={staffAccess.isAuthenticated}
        complaint={selectedComplaint}
        onAssigneeChange={handleAssigneeChange}
        onClose={() => setSelectedComplaintId(null)}
        onRequestStaffAccess={() => {
          setSelectedComplaintId(null);
          handleViewChange("Staff");
        }}
        onStatusChange={handleStatusChange}
      />
      <ActionToast message={actionMessage} onDismiss={() => setActionMessage(null)} />
    </main>
  );
}

export function SmartComplaintResolver() {
  const [surface, setSurface] = useState<"site" | "workspace">("site");

  if (surface === "site") {
    return <MarketingWebsite onOpenProduct={() => setSurface("workspace")} />;
  }

  return <ProductWorkspace onBackToSite={() => setSurface("site")} />;
}
