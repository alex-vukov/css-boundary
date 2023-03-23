// Create a shadow container with all styles and a placeholder for the app injection
export const createShadowInstance = function (parentElementId: string, init?: ShadowRootInit) {
  const { styles, instances }: { styles: HTMLElement[]; instances: { [key: string]: HTMLElement } } =
    window["css-boundary-" + __webpack_runtime_id__];
  const shadowContainer = document.getElementById(parentElementId);
  if (!shadowContainer) {
    throw new Error(`Could not find element with id ${parentElementId}`);
  }
  // Block all styles coming from the light DOM
  shadowContainer.style.all = "initial";
  if (!shadowContainer.shadowRoot) {
    shadowContainer.attachShadow(init || { mode: "open", delegatesFocus: false });
    if (!shadowContainer.shadowRoot) {
      throw new Error("Shadow root could not be attached!");
    }
  }
  shadowContainer.shadowRoot.append(
    ...styles.map((style) => {
      const deepClone = style.cloneNode(true) as HTMLElement;
      deepClone.dataset.cssb = "true";
      return deepClone;
    }),
  );
  instances[parentElementId] = shadowContainer;
  return shadowContainer.shadowRoot;
};

export const deleteShadowInstance = function (parentElementId: string) {
  const { instances } = window["css-boundary-" + __webpack_runtime_id__];
  const shadowContainer = document.getElementById(parentElementId);
  shadowContainer?.shadowRoot?.querySelectorAll("[data-cssb]").forEach((el) => el.remove());
  delete instances[parentElementId];
};

export const insert = function (style: HTMLElement) {
  const sc = window["css-boundary-" + __webpack_runtime_id__] || {};
  if (typeof sc.isStandalone === "undefined") {
    window["css-boundary-" + __webpack_runtime_id__] = {
      styles: [],
      instances: {},
      isStandalone: false,
    };
  }
  const {
    styles,
    instances,
    isStandalone,
  }: { styles: HTMLElement[]; instances: { [key: string]: HTMLElement }; isStandalone: boolean } =
    window["css-boundary-" + __webpack_runtime_id__];
  // Update the style list for newly created shadow instances
  styles.push(style);

  if (isStandalone) {
    document.head.appendChild(style);
  } else {
    // Update the style list for already existing shadow instances.
    // This will provide them with any lazy loaded styles.
    Promise.resolve().then(() => {
      Object.values(instances).forEach((instance) => {
        if (instance.shadowRoot) {
          instance.shadowRoot.appendChild(style.cloneNode(true));
        }
      });
    });
  }
};

// If this function is called it will make the style loader behave as it normally does
// and insert the styles into the head of the document instead of the shadow DOM
export const runStandalone = function () {
  let { styles }: { styles: HTMLElement[] } = window["css-boundary-" + __webpack_runtime_id__];
  window["css-boundary-" + __webpack_runtime_id__].isStandalone = true;
  styles.forEach((style) => document.head.appendChild(style));
};
