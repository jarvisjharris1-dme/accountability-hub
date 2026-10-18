import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { LifeBuoy, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { DashboardSection } from "./sections/DashboardSection";
import { JournalSection } from "./sections/JournalSection";
import { CircleSection } from "./sections/CircleSection";
import { WorkshopViewer } from "./sections/WorkshopViewer";
import { ProfileSection } from "./sections/ProfileSection";
import { GoalTracker } from "./sections/GoalTracker";
import NotificationPermissionBanner from "./ui/NotificationPermissionBanner";
import { EmailVerificationBanner } from "./ui/EmailVerificationBanner";
import { NotificationBell } from "./NotificationBell";
import { BottomNav } from "./navigation/BottomNav";
import { PWAInstallPrompt } from "./ui/PWAInstallPrompt";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { UserProfile, AccountabilityArea } from "../types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useKeyboardOpen } from "@/hooks/useKeyboardOpen";

const internalTabs = [
  "dashboard",
  "journal",
  "circle",
  "workshop",
  "goals",
  "profile",
];
export default function AppLayout({ children }: { children?: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const requestedTab = params.get("tab") || "dashboard";
  const activeTab =
    location.pathname === "/goals"
      ? "goals"
      : internalTabs.includes(requestedTab)
        ? requestedTab
        : "dashboard";
  const { user: authUser } = useAuth();
  const { isAdmin } = useAdmin();
  const keyboardOpen = useKeyboardOpen();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [supportType, setSupportType] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleTabChange = (tab: string, action?: string) => {
    if (["analytics", "notifications", "achievements", "admin"].includes(tab)) {
      navigate("/" + tab);
      return;
    }
    const query = new URLSearchParams();
    if (tab !== "dashboard") query.set("tab", tab);
    if (action) query.set("action", action);
    navigate({ pathname: "/", search: query.toString() }, { state: null });
    window.scrollTo({ top: 0 });
  };

  // Retain existing notification links while giving every section browser history.
  useEffect(() => {
    if (!location.state?.tab) return;
    const legacyTab = location.state.tab;
    const query = new URLSearchParams({
      tab: legacyTab === "messages" ? "circle" : legacyTab,
    });
    if (legacyTab === "messages") query.set("action", "chat");
    navigate(
      { pathname: "/", search: query.toString() },
      { replace: true, state: null },
    );
  }, [location.state, navigate]);

  const loadProfile = useCallback(async () => {
    if (!authUser?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setProfileError(false);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();
      if (error) throw error;
      setUser({
        id: data.id,
        name: data.full_name || "Friend",
        age: data.age || 0,
        location: data.location || "",
        city: data.city || "",
        state: data.state || "",
        zipcode: data.zipcode || "",
        sex: data.sex || "",
        ethnicity: data.ethnicity || "",
        familyStatus: data.family_status || "",
        accountabilityAreas: (data.accountability_areas ||
          []) as AccountabilityArea[],
        avatar:
          data.avatar ||
          "https://api.dicebear.com/7.x/avataaars/svg?seed=" + authUser.id,
        streakDays: data.streak_days || 0,
        joinedDate: data.joined_date || new Date().toISOString(),
        phone_number: data.phone_number || "",
        phone_verified: data.phone_verified || false,
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      setProfileError(true);
    } finally {
      setLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);
  useEffect(() => {
    if (authUser?.id)
      supabase.rpc("update_circle_member_activity").then(({ error }) => {
        if (error) console.error("Error updating Circle activity:", error);
      });
  }, [authUser?.id]);

  const sendSupport = async () => {
    if (!authUser || !supportType || sending) return;
    setSending(true);
    try {
      const { error } = await supabase.from("support_requests").insert({
        user_id: authUser.id,
        support_type: supportType,
        message: supportMessage.trim() || null,
        status: "active",
      });
      if (error) throw error;
      setShowSupport(false);
      setSupportType("");
      setSupportMessage("");
      toast.success("Your support request is saved in your Circle.");
    } catch (error) {
      console.error("Error saving support request:", error);
      toast.error("Your request could not be saved. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (profileError || (!loading && !user))
    return (
      <div
        role="alert"
        className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"
      >
        <p>We could not load your profile.</p>
        <button
          onClick={loadProfile}
          className="bg-[#1a2332] text-white rounded-lg px-5 py-3"
        >
          Try again
        </button>
      </div>
    );
  if (loading || !user)
    return (
      <div
        role="status"
        className="min-h-screen flex items-center justify-center"
      >
        Loading your account…
      </div>
    );

  const renderContent = () => {
    if (children) return children;
    switch (activeTab) {
      case "journal":
        return (
          <JournalSection
            key={params.get("action") || "list"}
            openNew={params.get("action") === "new"}
          />
        );
      case "circle":
        return (
          <CircleSection
            key={params.get("action") || "members"}
            initialView={params.get("action") === "chat" ? "chat" : "members"}
          />
        );
      case "workshop":
        return <WorkshopViewer />;
      case "goals":
        return (
          <GoalTracker
            key={params.get("action") || "list"}
            openNew={params.get("action") === "new"}
          />
        );
      case "profile":
        return <ProfileSection />;
      default:
        return <DashboardSection onTabChange={handleTabChange} />;
    }
  };

  return (
    <div
      className={`min-h-screen bg-gray-50 pb-24 ${keyboardOpen ? "keyboard-open" : ""}`}
    >
      <header className="app-header sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex justify-between items-center gap-2">
          <button
            aria-label="Go to Home"
            onClick={() => handleTabChange("dashboard")}
            className="shrink-0"
          >
            <img
              src="https://d64gsuwffb70l.cloudfront.net/6906b08a650ee0590aaf4bb4_1762183406403_6827ce42.png"
              alt="Accountable"
              className="app-logo"
            />
          </button>
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              aria-label="Request Circle support"
              onClick={() => setShowSupport(true)}
              className="flex items-center gap-1 px-2 py-2 rounded-lg hover:bg-gray-100 text-[#1a2332]"
            >
              <LifeBuoy className="w-5 h-5" aria-hidden="true" />
              <span className="hidden sm:inline text-sm">Support</span>
            </button>
            {isAdmin && (
              <button
                aria-label="Administration"
                onClick={() => navigate("/admin")}
                className="px-2 py-2 rounded-lg hover:bg-gray-100"
              >
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
            <NotificationBell />
            <button
              aria-label="Profile and settings"
              onClick={() => handleTabChange("profile")}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100"
            >
              <img
                src={user.avatar}
                alt=""
                className="app-avatar rounded-full"
              />
              <span className="hidden sm:inline text-sm">{user.name}</span>
            </button>
          </div>
        </div>
      </header>
      <main className="app-content max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <NotificationPermissionBanner />
        {authUser && !authUser.email_confirmed_at && authUser.email && (
          <EmailVerificationBanner email={authUser.email} />
        )}
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      <Dialog
        open={showSupport}
        onOpenChange={(open) => {
          if (!sending) setShowSupport(open);
        }}
      >
        <DialogContent className="app-dialog">
          <DialogHeader>
            <DialogTitle>Request Circle support</DialogTitle>
            <DialogDescription>
              Your request will appear in your Circle’s Support section.
              Responses may not be immediate.
            </DialogDescription>
          </DialogHeader>
          <label htmlFor="support-type" className="text-sm font-medium">
            What do you need help with?
          </label>
          <select
            id="support-type"
            value={supportType}
            onChange={(event) => setSupportType(event.target.value)}
            className="w-full border rounded-lg p-3"
          >
            <option value="">Choose a category</option>
            <option value="goals">Staying on track with goals</option>
            <option value="motivation">Motivation</option>
            <option value="setback">A setback</option>
            <option value="emotional">Emotional support</option>
            <option value="encouragement">Encouragement</option>
            <option value="other">Other</option>
          </select>
          <label htmlFor="support-message" className="text-sm font-medium">
            Message optional
          </label>
          <textarea
            id="support-message"
            rows={3}
            value={supportMessage}
            onChange={(event) => setSupportMessage(event.target.value)}
            className="w-full border rounded-lg p-3"
            placeholder="What would you like your Circle to know?"
          />
          <div className="flex gap-3">
            <button
              disabled={sending}
              onClick={() => setShowSupport(false)}
              className="flex-1 border rounded-lg p-3"
            >
              Cancel
            </button>
            <button
              disabled={!supportType || sending}
              onClick={sendSupport}
              className="flex-1 rounded-lg p-3 bg-[#1a2332] text-white disabled:opacity-50"
            >
              {sending ? "Saving…" : "Share with Circle"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <PWAInstallPrompt />
    </div>
  );
}
