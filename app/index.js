import * as messaging from "messaging";
import * as document from "document";
import * as fs from "fs";

const myButton = document.getElementById("myButton");

function buttonClicked(message) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({ message: message });
  }
}
const buttonClick = false;
//send true when the button is clicked
myButton.addEventListener("click", (evt) => {
  buttonClick = true;
  buttonClicked(buttonClick);
});

// Listen for the onopen event from the companion
messaging.peerSocket.onmessage = function (evt) {
  const codeShow = document.getElementById("codeShow");
  const showText = document.getElementById("showText");

  if (evt.data && evt.data.code) {
    const receivedCode = evt.data.code;
    const isUserIDNull = evt.data.isUserIDNull;
    console.log("Received code from companion:", receivedCode);
    console.log("Received userID status from companion:", isUserIDNull);
    if (isUserIDNull === true) {
      //show the code and remove the connect button
      showText.text = "Enter this code on your app:";
      codeShow.text = receivedCode;
      myButton.style.display = "none";
      return;
    } else {
      showText.style.fill = "black";
      showText.text = "Connected to the app";
      codeShow.style.fill = "darkgreen";
      codeShow.text = "Welcome!";
      myButton.style.display = "none";
      return;
    }

    // //save the code to a file in the device
    // let json_data = {
    //   code: receivedCode,
    // };

    // fs.writeFileSync("json.txt", json_data, "json", (err) => {
    //   if (err) {
    //     console.error("Error writing file:", err);
    //   } else {
    //     console.log("File saved");
    //     fs.readFile("json.txt", "json", (err, data) => {
    //       if (err) {
    //         console.error("Error reading file:", err);
    //       } else {
    //         console.log("File content:", data);
    //       }
    //     });
    //   }
    // });
  }
};
