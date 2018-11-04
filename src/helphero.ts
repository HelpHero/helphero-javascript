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

type HelpHero = {
  startTour: (id: string, options?: { skipIfAlreadySeen: boolean }) => void;
  advanceTour: () => void;
  cancelTour: () => void;
  identify: (id: string | number, data?: Object) => void;
  anonymous: () => void;
  on: (kind: EventKind, fn: (ev: Event, info: EventInfo) => void) => void;
  off: (kind: EventKind, fn: (ev: Event, info: EventInfo) => void) => void;
  openLauncher: () => void;
  closeLauncher: () => void;
};

let initializedAppId: string;
let instance: HelpHero;

const methods = [
  "startTour",
  "advanceTour",
  "cancelTour",
  "identify",
  "anonymous",
  "on",
  "off",
  "openLauncher",
  "closeLauncher"
];

interface AsyncHelpHero {
  (method: string, ...args: unknown[]): void;
  q?: unknown[];
}

interface _Window {
  HelpHero: AsyncHelpHero;
}

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

  // create temporary buffer
  const queue: unknown[] = [];
  const buffer: AsyncHelpHero = function() {
    queue.push(arguments);
  };
  buffer.q = queue;
  // @ts-ignore
  (window as _Window).HelpHero = buffer;

  // add script to page
  var script = document.createElement("script");
  script.src = `//app.helphero.co/embed/${appId}`;
  script.async = true;
  document.body.appendChild(script);

  // return API wrapper
  initializedAppId = appId;
  instance = Object.create(null);
  methods.forEach(method => {
    (instance as any)[method] = (...args: unknown[]) =>
      // @ts-ignore
      (window as _Window).HelpHero.apply(null, [method].concat(args));
  });
  return instance;
}
