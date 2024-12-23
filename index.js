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
    const unreadCount = Object.values(
      store.getState()?.roomsPageReducer?.unreadInboxRooms || {}
    ).reduce((a, c) => a + c, 0);
    console.log("Unread message count:", unreadCount);  // Debugging line

    // Access the Webex sidebar
    const webexSidebar = await app.context.getSidebar();
    if (!webexSidebar) {
      console.error("Sidebar is not available.");
      return;
    }

    console.log("Sidebar loaded successfully");

    // Set the unread message counter badge
    const res = await webexSidebar.showBadge({
      badgeType: "count",  // Ensure the badgeType is correct
      count: unreadCount,
    });
    console.log("Badge Response:", res);

    // If a service worker is available, post the unread message count
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "set_unread_message_counter",
        unreadCount,
      });
    } else {
      console.log("No service worker available.");
    }
  } catch (e) {
    console.error("Setting unread message badge counter failed:", e);
  }
});
