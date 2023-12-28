import * as messaging from "messaging";

const BASE_URL =
  "https://ad91-2402-d000-8110-3bc-fd26-5f1-ccae-646c.ngrok-free.app";

let continuePolling = true;
// Fetch the code from the server
async function getCodeFromServer() {
  try {
    const response = await fetch(`${BASE_URL}/getCode`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching data from server");
    }
    // console.log("Response:", response);
    const data = await response.json();
    const codeUserID_id = data.id;
    console.log("Put this on the Postman to update:", codeUserID_id);
    // Send the code to the device
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send({ code: data.code, isUserIDNull: true });
    }
    const code = data.code;

    // Get the UserID status from the server
    const checkCode = async () => {
      try {
        const checkCodeResponse = await fetch(`${BASE_URL}/checkCode/${code}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });
        if (!checkCodeResponse.ok) {
          throw new Error("Error checking code");
        }

        const checkCodeData = await checkCodeResponse.json();
        if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
          // Send the code if isUserIDNull is true
          if (checkCodeData.isUserIDNull === true) {
            messaging.peerSocket.send({
              isUserIDNull: checkCodeData.isUserIDNull,
              code: code,
            });
          } else {
            continuePolling = false; // Stop polling when isUserIDNull is false
          }
        }
        // pass true if the response is true
        if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
          if (checkCodeData.isUserIDNull === true) {
            messaging.peerSocket.send({
              isUserIDNull: checkCodeData.isUserIDNull,
              code: code,
            });
          } else {
            messaging.peerSocket.send({
              isUserIDNull: checkCodeData.isUserIDNull,
              code: code,
            });
            continuePolling = false;
          }
        }
      } catch (error) {
        console.error("There was a problem:", error);
      }
    };

    checkCode();
    // Poll every 5 seconds while continuePolling is true
    const pollingInterval = setInterval(() => {
      if (continuePolling) {
        checkCode();
      } else {
        clearInterval(pollingInterval); // Stop the interval
      }
    }, 5000);
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

// Listen for the onopen event from the device
messaging.peerSocket.onmessage = function (evt) {
  if (evt.data && evt.data.message === true) {
    getCodeFromServer();
  } else if (evt.data && evt.data.code &&evt.data.stepCount && evt.data.location) {
    const stepData = {
      code: evt.data.code || null,
      stepCounts: evt.data.stepCount || null,
      location: {
        longitude: evt.data.location.longitude | null,
        latitude: evt.data.location.latitude || null,
      },
    };
    const jsonData = JSON.stringify(stepData);
    fetch(`${BASE_URL}/stepLocation/658cebad90c90d1e9a7838c8`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonData,
    })
      .then((response) => {
        if (response.ok) {
          console.log("Step count data sent successfully.");
        } else {
          console.error("Failed to send step count data.");
        }
      })
      .catch((error) => {
        console.error("Error while sending step count data:", error);
      });
  } else {
    console.log("No data");
  }
};
