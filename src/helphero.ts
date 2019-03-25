type EventKind =
  | "tour_started"
  | "tour_completed"
  | "tour_advanced"
  | "tour_cancelled"
  | "tour_interrupted"
  | "error";

type Event = {
  kind: EventKind;
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

type EventInfo = {
  tour?: Tour;
  step?: Step;
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
  on: (kind: EventKind, fn: (ev: Event, info: EventInfo) => void) => void;
  off: (kind: EventKind, fn: (ev: Event, info: EventInfo) => void) => void;
  openLauncher: () => void;
  closeLauncher: () => void;
};

interface AsyncHelpHero {
  (method: string, ...args: unknown[]): void;
  q?: unknown[];
}

type _Window = Window & {
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
  "openLauncher",
  "closeLauncher"
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
      // @ts-ignore
      (window as _Window).HelpHero.apply(null, [method].concat(args));
  });
  return instance;
}
