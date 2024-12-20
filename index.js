// Check URL Hash for Login with Webex Token
parseJwtFromURLHash();

// Initialize the Webex application
const app = new window.Webex.Application();

app.onReady().then(async () => {
  log("onReady()", { message: "host app is ready" });

  // Listen and emit any events from the EmbeddedAppSDK
  app.listen().then(() => {
    app.on("application:displayContextChanged", (payload) =>
      log("application:displayContextChanged", payload)
    );
    app.on("application:shareStateChanged", (payload) =>
      log("application:shareStateChanged", payload)
    );
    app.on("application:themeChanged", (payload) =>
      log("application:themeChanged", payload)
    );
    app.on("meeting:infoChanged", (payload) =>
      log("meeting:infoChanged", payload)
    );
    app.on("meeting:roleChanged", (payload) =>
      log("meeting:roleChanged", payload)
    );
    app.on("space:infoChanged", (payload) => log("space:infoChanged", payload));
  });

  // Implement the message counter within the Webex sidebar
  try {
    // Get the unread message count from the Redux store
    const unreadCount = Object.values(
      store.getState()?.roomsPageReducer?.unreadInboxRooms || {}
    ).reduce((a, c) => a + c, 0);

    // Access the Webex sidebar
    const webexSidebar = await app.context.getSidebar();
    console.log("Webex Sidebar:", webexSidebar);

    // Set the unread message counter badge
    const res = await webexSidebar.showBadge({
      badgeType: "count",
      count: unreadCount,
    });
    console.log("Badge Response:", res);

    // If a service worker is available, post the unread message count
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "set_unread_message_counter",
        unreadCount,
      });
    }
  } catch (e) {
    console.error(`Setting unread message badge counter failed: ${e.message}`);
  }
});

/**
 * Sets the share URL to the value entered in the "shareUrl" element.
 */
function handleSetShare() {
  if (app.isShared) {
    log("ERROR: setShareUrl() should not be called while session is active");
    return;
  }
  const url = document.getElementById("shareUrl").value;
  app
    .setShareUrl(url, url, "Embedded App Kitchen Sink")
    .then(() => {
      log("setShareUrl()", {
        message: "shared URL to participants panel",
        url: url,
      });
    })
    .catch((error) => {
      log(
        "setShareUrl() failed with error",
        Webex.Application.ErrorCodes[error]
      );
    });
}

/**
 * Clears the share URL.
 */
function handleClearShare() {
  app
    .clearShareUrl()
    .then(() => {
      log("clearShareUrl()", { message: "share URL has been cleared" });
    })
    .catch((error) => {
      log(
        "clearShareUrl() failed with error",
        Webex.Application.ErrorCodes[error]
      );
    });
}

/**
 * Sets the presentation URL.
 */
async function handleSetPresentationUrl() {
  if (app.isShared) {
    log("ERROR: setShareUrl() should not be called while session is active");
    return;
  }
  const url = document.getElementById("shareUrl").value;
  const meeting = await app.context.getMeeting();
  meeting
    .setPresentationUrl(
      url,
      "My Presentation",
      Webex.Application.ShareOptimizationMode.AUTO_DETECT,
      false
    )
    .then(() => {
      log("setPresentationUrl()", {
        message: "presented URL to participants panel",
        url: url,
      });
    })
    .catch((error) => {
      log(
        "setPresentationUrl() failed with error",
        Webex.Application.ErrorCodes[error]
      );
    });
}

/**
 * Clears the set presentation URL.
 */
async function handleClearPresentationUrl() {
  const meeting = await app.context.getMeeting();
  meeting
    .clearPresentationUrl()
    .then(() => {
      log("clearPresentationUrl()", {
        message: "cleared URL to participants panel",
      });
    })
    .catch((error) => {
      log(
        "clearPresentationUrl() failed with error",
        Webex.Application.ErrorCodes[error]
      );
    });
}