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

type StartOptions = {
  skipIfAlreadySeen?: boolean;
  redirectIfNeeded?: boolean;
  stepId?: string;
};

type AdvanceOptions = {
  stepId?: string;
};

type HelpHero = {
  startTour: (id: string, options?: StartOptions) => void;
  advanceTour: (options?: AdvanceOptions) => void;
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
  setOptions: (options: { showBeacon?: boolean }) => void;
};

interface AsyncHelpHero {
  (...args: any[]): void;
  q?: unknown[];
}

type _Window = Window &
  typeof globalThis & {
    HelpHero: HelpHero & AsyncHelpHero;
  };

const methods: (keyof HelpHero)[] = [
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
  "setOptions",

  // deprecated
  // @ts-ignore
  "showBeacon",
  // @ts-ignore
  "hideBeacon"
];

let initializedAppId: string;

function init(appId: string): HelpHero {
  if (typeof appId !== "string" || appId === "") {
    throw new Error(`Invalid HelpHero App ID: ${appId}`);
  }
  if (initializedAppId != null && initializedAppId !== appId) {
    throw new Error(
      `HelpHero does not support initializing multiple Apps on the same page. Trying to initialize with App ID "${initializedAppId}" which is different from previously used App ID "${appId}"`
    );
  }

  const host = window as _Window;
  if (host.HelpHero != null) {
    return host.HelpHero;
  }

  const tasks: unknown[] = [];
  // @ts-ignore
  const instance: AsyncHelpHero & HelpHero = function() {
    tasks.push(arguments);
  };
  host.HelpHero = instance;
  instance.q = tasks;
  methods.forEach(method => {
    instance[method] = (...args: any[]) =>
      host.HelpHero.apply(null, [method].concat(args));
  });

  // add script to page
  initializedAppId = appId;
  const script = document.createElement("script");
  script.src = `https://app.helphero.co/embed/${appId}`;
  script.async = true;
  document.body.appendChild(script);

  return instance;
}

// @ts-ignore
init["default"] = init;
export default init;
