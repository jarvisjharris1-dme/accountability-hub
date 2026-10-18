import React from "react";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
const qa = vi.hoisted(() => ({
  user: {
    id: "test-user",
    email_confirmed_at: "yes",
    user_metadata: { full_name: "Test User" },
  },
  rows: {} as Record<string, any>,
  failures: {} as Record<string, boolean>,
  writes: [] as any[],
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: qa.user }),
}));
vi.mock("@/contexts/AdminContext", () => ({
  useAdmin: () => ({ isAdmin: true }),
}));
vi.mock("sonner", () => ({ toast: { success: qa.success, error: qa.error } }));
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: (table: string) => {
      let op = "read";
      let payload: any;
      const builder: any = {};
      for (const method of [
        "select",
        "eq",
        "order",
        "limit",
        "in",
        "or",
        "is",
        "gte",
      ])
        builder[method] = () => builder;
      for (const method of ["insert", "upsert", "update", "delete"])
        builder[method] = (value: any, options: any) => {
          op = method;
          payload = value;
          qa.writes.push({ table, method, payload, options });
          return builder;
        };
      builder.single = builder.maybeSingle = () => builder;
      builder.then = (resolve: any) =>
        Promise.resolve({
          data: qa.rows[table] ?? [],
          error: qa.failures[table]
            ? { message: "QA simulated failure" }
            : null,
        }).then(resolve);
      return builder;
    },
    rpc: () => Promise.resolve({ error: null }),
  },
}));
vi.mock("@/components/NotificationBell", () => ({
  NotificationBell: () => null,
}));
vi.mock("@/components/ui/NotificationPermissionBanner", () => ({
  default: () => null,
}));
vi.mock("@/components/ui/EmailVerificationBanner", () => ({
  EmailVerificationBanner: () => null,
}));
vi.mock("@/components/ui/PWAInstallPrompt", () => ({
  PWAInstallPrompt: () => null,
}));
vi.mock("@/components/sections/ProfileSection", () => ({
  ProfileSection: () => <h1>Profile settings</h1>,
}));
vi.mock("@/components/onboarding/WelcomeStep", () => ({
  WelcomeStep: ({ onNext }: any) => <button onClick={onNext}>Begin</button>,
}));
vi.mock("@/components/onboarding/ProfilePhotoStep", () => ({
  ProfilePhotoStep: ({ onNext }: any) => (
    <button onClick={onNext}>Next photo</button>
  ),
}));
vi.mock("@/components/onboarding/BioStep", () => ({
  BioStep: ({ onNext }: any) => (
    <button onClick={() => onNext("My bio")}>Next bio</button>
  ),
}));
vi.mock("@/components/onboarding/AccountabilityAreasStep", () => ({
  AccountabilityAreasStep: ({ onNext }: any) => (
    <button onClick={() => onNext(["growth"])}>Next areas</button>
  ),
}));
vi.mock("@/components/onboarding/InitialGoalStep", () => ({
  InitialGoalStep: ({ onComplete }: any) => (
    <button
      onClick={() =>
        onComplete({
          title: "My goal",
          description: "One step",
          category: "professional",
          targetDate: "",
        })
      }
    >
      Finish
    </button>
  ),
}));
import AppLayout from "@/components/AppLayout";
import { WorkshopViewer } from "@/components/sections/WorkshopViewer";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useKeyboardOpen } from "@/hooks/useKeyboardOpen";
function RouteProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output data-testid="route">{location.pathname + location.search}</output>
      <button onClick={() => navigate(-1)}>Browser back</button>
    </>
  );
}
function mount(ui: React.ReactNode, url = "/") {
  return render(
    <MemoryRouter initialEntries={[url]}>
      {ui}
      <RouteProbe />
    </MemoryRouter>,
  );
}
beforeEach(() => {
  qa.rows = {
    profiles: { id: "test-user", full_name: "Test User" },
    goals: [],
    journal_entries: [],
    workshops: [],
    user_workshop_progress: [],
  };
  qa.failures = {};
  qa.writes = [];
  qa.success.mockClear();
  qa.error.mockClear();
  window.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("Accountable mobile and save regressions", () => {
  it("has five readable destinations, header settings/admin, and browser history", async () => {
    mount(<AppLayout />);
    const nav = await screen.findByRole("navigation", {
      name: "Main navigation",
    });
    expect(
      within(nav)
        .getAllByRole("button")
        .map((b) => b.textContent),
    ).toEqual(["Home", "Mirror", "Circle", "Workshops", "Goals"]);
    expect(screen.getByRole("button", { name: "Administration" })).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Profile and settings" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Profile settings" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Browser back" }));
    expect(
      await screen.findByRole("button", { name: "Write a reflection" }),
    ).toBeTruthy();
  });
  it("opens the reflection editor directly and preserves writing after a failed save", async () => {
    mount(<AppLayout />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Write a reflection" }),
    );
    const input = await screen.findByRole("textbox", {
      name: "Your reflection",
    });
    fireEvent.change(input, { target: { value: "My next honest step" } });
    qa.failures.journal_entries = true;
    fireEvent.click(screen.getByRole("button", { name: /Save/ }));
    await waitFor(() => expect(qa.error).toHaveBeenCalled());
    expect((input as HTMLTextAreaElement).value).toBe("My next honest step");
    qa.failures.journal_entries = false;
    fireEvent.click(screen.getByRole("button", { name: /Save/ }));
    await waitFor(() => expect(qa.success).toHaveBeenCalled());
    expect(
      screen.queryByRole("textbox", { name: "Your reflection" }),
    ).toBeNull();
  });
  it("opens goal form and Circle chat from Home", async () => {
    mount(<AppLayout />);
    fireEvent.click(await screen.findByRole("button", { name: "Set a goal" }));
    expect(
      await screen.findByPlaceholderText("e.g., Run a marathon"),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Go to Home" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Open Circle chat" }),
    );
    expect(
      await screen.findByRole("textbox", { name: "Circle message" }),
    ).toBeTruthy();
  });
  it("preserves completed workshops on review and persists selected stage in URL", async () => {
    qa.rows.workshops = [
      {
        id: "w1",
        title: "One honest step",
        stage: "Awareness",
        description: "Reflect",
        content: "Lesson body",
        content_type: "text",
      },
    ];
    qa.rows.user_workshop_progress = [
      { workshop_id: "w1", status: "completed", progress_percentage: 100 },
    ];
    mount(<WorkshopViewer />, "/?tab=workshop");
    fireEvent.click(await screen.findByRole("button", { name: "Review" }));
    expect(screen.getByText("Lesson body")).toBeTruthy();
    expect(qa.writes).toHaveLength(0);
    expect(
      screen.queryByRole("button", { name: "Complete session" }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Back to Workshops/ }));
    fireEvent.change(screen.getByLabelText("Choose your stage"), {
      target: { value: "Action" },
    });
    expect(screen.getByTestId("route").textContent).toContain("stage=Action");
  });
  it("blocks workshop actions when progress cannot load, then retries", async () => {
    qa.failures.user_workshop_progress = true;
    mount(<WorkshopViewer />, "/?tab=workshop");
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Start" })).toBeNull();
    qa.failures.user_workshop_progress = false;
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByLabelText("Choose your stage")).toBeTruthy();
  });
  it("shows completion only after workshop save succeeds", async () => {
    qa.rows.workshops = [
      {
        id: "w1",
        title: "One honest step",
        stage: "Awareness",
        description: "Reflect",
        content: "Lesson body",
        content_type: "text",
      },
    ];
    mount(<WorkshopViewer />, "/?tab=workshop");
    fireEvent.click(await screen.findByRole("button", { name: "Start" }));
    await screen.findByText("Lesson body");
    qa.failures.user_workshop_progress = true;
    fireEvent.click(screen.getByRole("button", { name: "Complete session" }));
    await waitFor(() => expect(qa.error).toHaveBeenCalled());
    expect(
      screen.getByRole("button", { name: "Complete session" }),
    ).toBeTruthy();
    qa.failures.user_workshop_progress = false;
    fireEvent.click(screen.getByRole("button", { name: "Complete session" }));
    expect(await screen.findByText("Completed")).toBeTruthy();
  });
  it("does not finish onboarding when goal save fails and reuses goal ID on retry", async () => {
    mount(<OnboardingWizard />, "/onboarding");
    for (const name of ["Begin", "Next photo", "Next bio", "Next areas"])
      fireEvent.click(await screen.findByRole("button", { name }));
    qa.failures.goals = true;
    fireEvent.click(await screen.findByRole("button", { name: "Finish" }));
    await waitFor(() => expect(qa.error).toHaveBeenCalled());
    expect(qa.writes.some((w) => w.payload?.onboarding_completed)).toBe(false);
    const first = qa.writes.find((w) => w.table === "goals").payload;
    expect(first.status).toBe("active");
    qa.failures.goals = false;
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    await waitFor(() => expect(qa.success).toHaveBeenCalled());
    expect(
      qa.writes
        .filter((w) => w.table === "goals")
        .every((w) => w.payload.id === first.id),
    ).toBe(true);
    expect(qa.writes.at(-1).payload).toEqual({ onboarding_completed: true });
  });
  it("preserves goal details on failed save and clears the form only on success", async () => {
    mount(<AppLayout />, "/?tab=goals&action=new");
    const input = await screen.findByPlaceholderText("e.g., Run a marathon");
    fireEvent.change(input, { target: { value: "Take the next step" } });
    qa.failures.goals = true;
    fireEvent.click(screen.getByRole("button", { name: "Create Goal" }));
    await waitFor(() => expect(qa.error).toHaveBeenCalled());
    expect((input as HTMLInputElement).value).toBe("Take the next step");
    qa.failures.goals = false;
    fireEvent.click(screen.getByRole("button", { name: "Create Goal" }));
    await waitFor(() => expect(qa.success).toHaveBeenCalled());
    expect(screen.queryByPlaceholderText("e.g., Run a marathon")).toBeNull();
  });
  it("uses saved goal percentages and the reader completion records on Home", async () => {
    qa.rows.goals = [
      {
        id: "g1",
        title: "My saved goal",
        progress_percentage: 65,
        status: "active",
      },
    ];
    qa.rows.workshops = [
      { id: "w1", stage: "Awareness" },
      { id: "w2", stage: "Awareness" },
    ];
    qa.rows.user_workshop_progress = [
      { workshop_id: "w1", status: "completed" },
    ];
    mount(<AppLayout />);
    expect(await screen.findByText("My saved goal")).toBeTruthy();
    expect(screen.getByText("65%")).toBeTruthy();
    expect(screen.getByText("50%")).toBeTruthy();
  });
  it("does not claim support is shared after a failed save", async () => {
    mount(<AppLayout />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Request Circle support" }),
    );
    fireEvent.change(screen.getByLabelText("What do you need help with?"), {
      target: { value: "motivation" },
    });
    qa.failures.support_requests = true;
    fireEvent.click(screen.getByRole("button", { name: "Share with Circle" }));
    await waitFor(() => expect(qa.error).toHaveBeenCalled());
    expect(qa.success).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeTruthy();
    qa.failures.support_requests = false;
    fireEvent.click(screen.getByRole("button", { name: "Share with Circle" }));
    await waitFor(() => expect(qa.success).toHaveBeenCalled());
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("hides app chrome for keyboard resizing, respects zoom, and cleans up", () => {
    const viewport = new EventTarget() as any;
    Object.assign(viewport, { height: 800, offsetTop: 0, scale: 1 });
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: viewport,
    });
    function Keyboard() {
      const open = useKeyboardOpen();
      return (
        <>
          <input aria-label="Edit" />
          <output>{String(open)}</output>
        </>
      );
    }
    const view = render(<Keyboard />);
    const input = screen.getByLabelText("Edit");
    input.focus();
    viewport.height = 450;
    fireEvent(viewport, new Event("resize"));
    expect(
      document.documentElement.classList.contains("app-keyboard-open"),
    ).toBe(true);
    viewport.scale = 2;
    fireEvent(viewport, new Event("resize"));
    expect(
      document.documentElement.classList.contains("app-keyboard-open"),
    ).toBe(false);
    view.unmount();
    expect(
      document.documentElement.style.getPropertyValue("--app-visual-height"),
    ).toBe("");
  });
});
