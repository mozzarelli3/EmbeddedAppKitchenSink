app.onReady().then(async () => {
    log("onReady()", { message: "host app is ready" });
  
    app.context.getSidebar()
    .then((sidebar) => log("Sidebar Available", sidebar))
    .catch((error) => log("Sidebar Unavailable", { error: error.message }));

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
      app.on("space:infoChanged", (payload) =>
        log("space:infoChanged", payload)
      );
    });
  });
