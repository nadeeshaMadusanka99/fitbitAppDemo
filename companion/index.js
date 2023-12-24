import * as messaging from "messaging";

// const JSON_CODE_BIN_URL =
//   "https://api.jsonbin.io/v3/b/6584117fdc7465401886c13e";

//   // Fetch the code from the server
// async function getCodeFromServer() {
//   try {
//     const response = await fetch(JSON_CODE_BIN_URL, {
//       headers: {
//         "X-Master-Key":
//           "$2a$10$0aA3xWZBETEF78mJ8lcWA.s3oG1TdOtaf8NzfIKrfLNwkjFcsCJA.",
//       },
//     });
//     if (!response.ok) {
//       throw new Error("Error fetching data from server");
//     }
//     const data = await response.json();
//     let connectionCode = data.record.code;
//     console.log("Recieved Code: ", connectionCode);
//     //send the code to the device
//     if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
//       messaging.peerSocket.send({ code: connectionCode });
//     }
//   } catch (error) {
//     console.error("There was a problem with the fetch operation:", error);
//   }
// }

const codeUserIDList = [];

const GET_CODE_URL = "http://localhost:5555/getCode";

// Fetch the code from the server
async function getCodeFromServer() {
  try {
    const response = await fetch(GET_CODE_URL);

    if (!response.ok) {
      throw new Error("Error fetching data from server");
    }
    const data = await response.json();

    // Create an object with code and initial userID set to null
    const codeUserIDObject = {
      code: data.code,
      userID: null
    };
    // Add code object to the code list
    codeUserIDList.push(codeUserIDObject);
    console.log("codeUserIDList: ", codeUserIDList);
    
    // Send the code to the device
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send({ code: data.code });
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}


// Listen for the onopen event from the device
messaging.peerSocket.onmessage = function (evt) {
  if (evt.data && evt.data.message === true) {
    getCodeFromServer();
  }
};

