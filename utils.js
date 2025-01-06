/**
 * Displays a log of information onto the page
 * @param {String} type Label of the information about to be logged
 * @param {Object} data Object that can be JSON stringified
 */
function log(type, data) {
  var ul = document.getElementById("console");
  var li = document.createElement("li");
  var header = document.createElement("p");
  var headerMessage = document.createTextNode(
    `${new Date().toJSON()}: ${type}`
  );
  header.appendChild(headerMessage);
  li.appendChild(header);
  var code = document.createElement("pre");
  var payload = document.createTextNode(`${JSON.stringify(data, "\n", 2)}`);
  code.appendChild(payload);
  li.appendChild(code);
  ul.prepend(li);
}

/**
 * Logs the app object from `new window.Webex.Application();`
 */
function handleDisplayAppInfo() {
  log("Webex Embedded App Application Object", app);
}

/**
 * Calls and logs the user data from `app.context.getUser()`
 */
function handleGetUser() {
  app.context
    .getUser()
    .then((u) => {
      log("getUser()", u);
    })
    .catch((error) => {
      log(
        "getUser() promise failed with error",
        Webex.Application.ErrorCodes[error]
      );
    });
}

/**
 * Calls and logs the meeting data from `app.context.getMeeting()`
 */
function handleGetMeeting() {
  app.context
    .getMeeting()
    .then((m) => {
      log("getMeeting()", m);
    })
    .catch((error) => {
      log(
        "getMeeting() promise failed with error",
        Webex.Application.ErrorCodes[error]
      );
    });
}

/**
 * Calls and logs the space data from `app.context.getSpace()`
 */
function handleGetSpace() {
  app.context
    .getSpace()
    .then((s) => {
      log("getSpace()", s);
    })
    .catch((error) => {
      log(
        "getSpace() promise failed with error",
        Webex.Application.ErrorCodes[error]
      );
    });
}

/**
 * Handles a new message event and updates the sidebar message counter
 */

const setUnreadMsgCounterBadge = async () => {
  try {  

      const count = unreadMessagesCount ?? unreadCount;
      
      if (isNaN(count) || count < 0) {
        console.error("Invalid count value:", count);
        return;
      }
  
      if ("serviceWorker" in navigator) {
        return navigator?.serviceWorker?.controller?.postMessage({
          type: "set_unread_message_counter",
          unreadCount: count,
        });
      }
  
      const webexSidebar = await webexApplication.context.getSidebar();
      log("Debug: Sidebar context obtained", webexSidebar);
  
      const res = await webexSidebar.showBadge({ badgeType: "count", count });
      log("Debug: Badge update response", res);
    } catch (e) {
      console.error(
        log("Badge Update Failed", { error: e.message })
        );
    }
  }

  webexApplication.onReady().then(async () => {
    console.log("Webex app is ready.");
  
    try {
      // Call setUnreadMsgCounterBadge when the app is ready
      await setUnreadMsgCounterBadge();
    } catch (error) {
      console.error("Error invoking setUnreadMsgCounterBadge:", error);
    }
});


function handleNewMessage() {
  app.context
    .getSpace()
    .then((space) => {
      log("getSpace()", space);

      // Simulate fetching new messages for the current space
      const spaceId = space.id; // Get the current space ID
      const simulatedMessage = {
        id: `msg-${Date.now()}`, // Simulated unique message ID
        spaceId: "00000000-0000-0000-0000-000000000000", //spaceId,
        text: "This is a test message",
        created: new Date().toISOString(),
      };

      // Log the new message event
      log("New Message Event", simulatedMessage);

      // Update the counter
      try {
        const unreadMessagesCount = (window.unreadMessagesCount || 0) + 1;
        window.unreadMessagesCount = unreadMessagesCount;

        // Update the badge with the new count
        setUnreadMsgCounterBadge(unreadMessagesCount);
        log("Updated Message Counter", { unreadMessagesCount });
      } catch (error) {
        log("Error Handling New Message", { error: error.message });
      }
    })
    .catch((error) => {
      log(
        "getSpace() promise failed with error",
        Webex.Application.ErrorCodes[error]
      );
    });
}


/**
 * Initiates the System Browser OAuth flow for SSO
 */
function handleSystemBrowserOAuth() {
  // System Browser OAuth Support is only for 1.5.0 SDK and above
  log('app.isSdkSupported("1.5.0")', app.isSdkSupported("1.5.0"));
  if (!app.isSdkSupported("1.5.0")) {
    return;
  }
  // The redirect from your SSO flow needs to return to this Webex address
  const webexAppRedirectUri =
    "https://oauth-helper-prod.wbx2.com/helperservice/v1/callback";
  // We are utiling mocklab to demonstrate an SSO Flow
  // Be sure to add the SSO domain to your "valid domains" configuration
  const SSOAuthUrl = `https://oauth.mocklab.io/oauth/authorize?response_type=code&redirect_uri=${webexAppRedirectUri}`;

  log("Initiating SSO flow in system browser", true);
  // Initiate SSO flow in system browser
  app
    .initiateSystemBrowserOAuth(SSOAuthUrl)
    .then(function (response) {
      // Promise fulfilled, get authorization code from JSON response
      let authCode = response;
      log("SSO flow got authorization code", authCode);
      // Exchange authorization code for a token with ID provider.
      // This part of the OAuth flow is the responsibility of the embedded app, for example:
      // exchangeCodeForToken(authCode);
    })
    .catch(function (reason) {
      console.error(
        "initiateSystemBrowserOAuth() failed with reason=",
        window.Webex.Application.ErrorCodes[reason]
      );
    });
}
