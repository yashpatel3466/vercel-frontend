import toast from "react-hot-toast";

const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const SCOPE = "https://www.googleapis.com/auth/drive.readonly";

function loadGapiScript() {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google API script"));
    document.body.appendChild(script);
  });
}

function loadGisScript() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services script"));
    document.body.appendChild(script);
  });
}

function ensureConfig() {
  // Debug: log what we're getting (remove in production if needed)
  console.log("API_KEY present:", !!API_KEY, "CLIENT_ID present:", !!CLIENT_ID);

  if (!API_KEY || !CLIENT_ID) {
    const missing = [];
    if (!API_KEY) missing.push("REACT_APP_GOOGLE_API_KEY");
    if (!CLIENT_ID) missing.push("REACT_APP_GOOGLE_CLIENT_ID");
    throw new Error(
      `Google Drive is not configured. Missing: ${missing.join(", ")}. ` +
      `Please check your frontend/.env file and make sure you've restarted the React dev server after adding the variables.`
    );
  }

  // Check if they're still placeholder values
  if (API_KEY.includes("YOUR_") || CLIENT_ID.includes("YOUR_")) {
    throw new Error(
      "Google Drive configuration incomplete. Please replace the placeholder values in frontend/.env with your actual Google API keys."
    );
  }
}

export async function openGoogleDrivePicker({ onPick, onError } = {}) {
  try {
    ensureConfig();
    await loadGapiScript();
    await loadGisScript();

    // Load auth and picker libraries
    await new Promise((resolve, reject) => {
      window.gapi.load("auth", {
        callback: resolve,
        onerror: () => reject(new Error("Failed to load Google auth library"))
      });
    });

    await new Promise((resolve, reject) => {
      window.gapi.load("picker", {
        callback: resolve,
        onerror: () => reject(new Error("Failed to load Google Picker library"))
      });
    });

    // Use modern Google Identity Services for authentication
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          createAndShowPicker(tokenResponse.access_token);
        } else if (tokenResponse && tokenResponse.error === 'access_denied') {
          const error = new Error("Access denied. Please allow access to your Google Drive to select images.");
          if (onError) onError(error);
          console.error("Google Drive picker error:", error);
        } else {
          const error = new Error("Google authentication failed. Please try again.");
          if (onError) onError(error);
          console.error("Google Drive picker error:", tokenResponse);
        }
      },
      error_callback: (error) => {
        let errorMessage = "Google authentication failed";
        if (error.type === 'popup_closed') {
          errorMessage = "Authentication window was closed. Please try again.";
        } else if (error.message) {
          errorMessage = `Google authentication error: ${error.message}`;
        }
        const err = new Error(errorMessage);
        if (onError) onError(err);
        console.error("Google Drive picker error details:", JSON.stringify(error, null, 2));
      }
    });

    // Request the token with a user-friendly prompt
    tokenClient.requestAccessToken({
      prompt: 'consent'
    });

    function createAndShowPicker(oauthToken) {
      const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS_IMAGES)
        .setIncludeFolders(false)
        .setSelectFolderEnabled(false)
        .setMimeTypes('image/jpeg', 'image/png', 'image/gif', 'image/webp');

      const picker = new window.google.picker.PickerBuilder()
        .setAppId("")
        .setOAuthToken(oauthToken)
        .setDeveloperKey(API_KEY)
        .addView(view)
        .setCallback((data) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const doc = data.docs && data.docs[0];
            if (doc) {
              const fileId = doc.id;
              const name = doc.name || doc.originalFilename || "Selected file";
              const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
              if (onPick) {
                onPick({ url, name, fileId });
              }
            }
          } else if (data.action === window.google.picker.Action.CANCEL) {
            // User cancelled the picker - no error needed
            console.log("Google Drive picker cancelled by user");
          }
        })
        .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
        .build();

      picker.setVisible(true);
    }
  } catch (err) {
    if (onError) onError(err);
    // eslint-disable-next-line no-console
    console.error("Google Drive picker error:", err);
    // As a fallback, surface something visible in case the form does not show the error.
    if (!onError && typeof window !== "undefined") {
      // eslint-disable-next-line no-alert
      toast.error(`Google Drive picker error: ${err.message || err}`);
    }
  }
}


