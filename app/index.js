import * as messaging from "messaging";
import * as document from "document";
import * as fs from "fs";
import { today } from "user-activity";
import { geolocation } from "geolocation";

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
    console.log("isUserIDNull: " + isUserIDNull);

    let json_data = {
      code: receivedCode,
    };

    if (isUserIDNull === true) {
      //show the code and remove the connect button
      showText.text = "Enter this code on your app:";
      codeShow.text = receivedCode;
      myButton.style.display = "none";
    } else {
      showText.style.fill = "black";
      showText.text = "Connected to the app...";
      codeShow.style.fill = "darkgreen";
      codeShow.text = "Welcome!";
      myButton.style.display = "none";

      //save the code to a file in the device and read it
      fs.writeFileSync("json.txt", json_data, "json");
      let json_object = fs.readFileSync("json.txt", "json");
      console.log("Authenticated code from fs: " + json_object.code);

      //send the step count and location to the server every 5 seconds
      setInterval(() => {
        const stepCount = today.adjusted.steps;

        // Request location
        geolocation.getCurrentPosition(locationSuccess, locationError);

        function locationSuccess(position) {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          const data = {
            code: json_object.code,
            stepCount: stepCount !== undefined ? stepCount : null,
            location: location,
          };
          if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
            messaging.peerSocket.send(data);
          }
          console.log(
            "data: " +
              data.code +
              " " +
              data.stepCount +
              " " +
              data.location.latitude +
              " " +
              data.location.longitude
          );
        }
        function locationError(error) {
          console.log("Error getting location: " + error.code, error.message);
        }
      }, 5000);
    }
  }
};
