type TourEventKind =
  | "tour_started"
  | "tour_completed"
  | "tour_advanced"
  | "tour_cancelled"
  | "tour_interrupted"
  | "error";

type TourEvent = {
  kind: TourEventKind;
  details?: string;
  tourId?: string;
  stepId?: string;
};

type Step = {
  id: string;
  name: string;
};

type Tour = {
  id: string;
  name: string;
  steps: Step[];
};

type TourEventInfo = {
  tour?: Tour;
  step?: Step;
};

type ChecklistEventKind = "checklist_completed" | "checklist_item_completed";

type ChecklistEvent = {
  kind: ChecklistEventKind;
  checklistId: string;
  itemId?: string;
};

type ChecklistItem = {
  id: string;
  name: string;
};

type Checklist = {
  id: string;
  name: string;
  items: ChecklistItem[];
};

type ChecklistEventInfo = {
  checklist: Checklist;
  item?: ChecklistItem;
};

type Data = {
  [key: string]: boolean | number | string | undefined | null;
};

type HelpHero = {
  startTour: (id: string, options?: { skipIfAlreadySeen: boolean }) => void;
  advanceTour: () => void;
  cancelTour: () => void;
  identify: (id: string | number, data?: Data) => void;
  update: (data: Data | ((data: Data) => Data | null | undefined)) => void;
  anonymous: () => void;
  on(
    kind: TourEventKind,
    fn: (ev: TourEvent, info: TourEventInfo) => void
  ): void;
  off(
    kind: TourEventKind,
    fn: (ev: TourEvent, info: TourEventInfo) => void
  ): void;
  on(
    kind: ChecklistEventKind,
    fn: (ev: ChecklistEvent, info: ChecklistEventInfo) => void
  ): void;
  off(
    kind: ChecklistEventKind,
    fn: (ev: ChecklistEvent, info: ChecklistEventInfo) => void
  ): void;
  openChecklist: () => void;
  closeChecklist: () => void;
  startChecklist: (id: string) => void;
  showBeacon: () => void;
  hideBeacon: () => void;
};

interface AsyncHelpHero {
  (...args: any[]): void;
  q?: unknown[];
}

type _Window = Window &
  typeof globalThis & {
    HelpHero: AsyncHelpHero;
  };

const methods = [
  "startTour",
  "advanceTour",
  "cancelTour",
  "identify",
  "anonymous",
  "update",
  "on",
  "off",
  "openChecklist",
  "closeChecklist",
  "startChecklist",
  "showBeacon",
  "hideBeacon"
];

let initializedAppId: string;
let instance: HelpHero & AsyncHelpHero & { [method: string]: Function };

export default function initHelpHero(appId: string): HelpHero {
  if (typeof appId !== "string" || appId === "") {
    throw new Error(`Invalid HelpHero App ID: ${appId}`);
  }
  if (initializedAppId != null && initializedAppId !== appId) {
    throw new Error(
      `HelpHero does not support initializing multiple Apps on the same page. Trying to initialize with App ID "${initializedAppId}" which is different from previously used App ID "${appId}"`
    );
  }
  if (instance != null) {
    return instance;
  }

  // create temporary tasks
  const tasks: unknown[] = [];
  const queue: AsyncHelpHero = function() {
    tasks.push(arguments);
  };
  queue.q = tasks;
  (window as _Window).HelpHero = queue;

  // add script to page
  const script = document.createElement("script");
  const hasHttp = /^https?:$/.test(document.location.protocol || "");
  script.src = `${hasHttp ? "" : "https:"}//app.helphero.co/embed/${appId}`;
  script.async = true;
  document.body.appendChild(script);

  // return API wrapper
  initializedAppId = appId;
  instance = Object.create(null);
  methods.forEach(method => {
    instance[method] = (...args: any[]) =>
      (window as _Window).HelpHero.apply(null, [method].concat(args));
  });
  return instance;
}
