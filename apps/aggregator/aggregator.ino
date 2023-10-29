#include "ESP8266WiFi.h"
#include "ESPAsyncWebServer.h"
#include <ArduinoJson.h>

// Set to true to define Relay as Normally Open (NO)
#define RELAY_NO    true

// Set number of relays
#define NUM_RELAYS  2

// WIFI PARAMETERS
const char* SSID = "WIFI_SSID";
const char* PASSWORD = "WIFI_PASSWORD";

// Assign each GPIO to a relay
int relayGPIOs[NUM_RELAYS] = {5, 14};
String relays[NUM_RELAYS] = {"PUMP", "FAN"};

const char* PARAM_INPUT_1 = "relay";  
const char* PARAM_INPUT_2 = "state";

const int DELAY_CONNECTING_SERIAL_MS = 100; // 0.1 sec
const int DELAY_CONNECTING_WIFI_MS = 500; // 0.5 sec

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);

void getNetworkInfo(){
  if(WiFi.status() != WL_CONNECTED) {
    return;
  }
  
  Serial.println("[*] Network information");
  Serial.print("[+] SSID: ");
  Serial.println(SSID);
  Serial.println("[+] BSSID: " + WiFi.BSSIDstr());
  Serial.print("[+] Gateway IP: ");
  Serial.println(WiFi.gatewayIP());
  Serial.print("[+] Subnet Mask: ");
  Serial.println(WiFi.subnetMask());
  Serial.println((String)"[+] RSSI: " + WiFi.RSSI() + " dB");
  Serial.print("[+] ESP32 IP: ");
  Serial.println(WiFi.localIP());
  Serial.println("");
}

const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE HTML><html>
<head>
  <title>Greenthumb - Aggregator</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    html {font-family: Arial; display: inline-block; text-align: center;}
    h2 {font-size: 3.0rem;}
    p {font-size: 3.0rem;}
    body {max-width: 600px; margin:0px auto; padding-bottom: 25px;}
    .switch {position: relative; display: inline-block; width: 120px; height: 68px} 
    .switch input {display: none}
    .slider {position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; border-radius: 34px}
    .slider:before {position: absolute; content: ""; height: 52px; width: 52px; left: 8px; bottom: 8px; background-color: #fff; -webkit-transition: .4s; transition: .4s; border-radius: 68px}
    input:checked+.slider {background-color: #2196F3}
    input:checked+.slider:before {-webkit-transform: translateX(52px); -ms-transform: translateX(52px); transform: translateX(52px)}
  </style>
</head>
<body>
  <h2>Greenthumb Aggregator</h2>
  %BUTTONPLACEHOLDER%
<script>function toggleCheckbox(element) {
  var xhr = new XMLHttpRequest();
  var params = "relay="+element.id;

  if(element.checked){ 
    xhr.open("POST", "/control", true);
    params = params + "&state=1";
  } else { 
    xhr.open("POST", "/control", true);
    params = params + "&state=0";
  }
  
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.send(params);
}</script>
</body>
</html>
)rawliteral";

// Replaces placeholder with button section in your web page
String processor(const String& var){
  //Serial.println(var);
  if(var == "BUTTONPLACEHOLDER"){
    String buttons ="";
    for(int i=1; i<=NUM_RELAYS; i++){
      String relayStateValue = relayState(i);
      buttons+= "<h4>Relay #" + relays[i-1] + " - GPIO " + relayGPIOs[i-1] + "</h4><label class=\"switch\"><input type=\"checkbox\" onchange=\"toggleCheckbox(this)\" id=\"" + relays[i-1] + "\" "+ relayStateValue +"><span class=\"slider\"></span></label>";
    }
    return buttons;
  }
  return String();
}

String relayState(int numRelay){
  if(RELAY_NO){
    if(digitalRead(relayGPIOs[numRelay-1])){
      return "";
    }
    else {
      return "checked";
    }
  }
  else {
    if(digitalRead(relayGPIOs[numRelay-1])){
      return "checked";
    }
    else {
      return "";
    }
  }
  return "";
}

int searchElementInArray(String array[], int size, String value) {
  for (int i = 0; i < size; i++) {
    if (array[i] == value) {
      return i;
    }
  }
  return -1;
}

void setup(){
  // Serial port for debugging purposes
  Serial.begin(115200);
  delay(DELAY_CONNECTING_SERIAL_MS);

  // Set all relays to off when the program starts - if set to Normally Open (NO), the relay is off when you set the relay to HIGH
  for(int i=1; i<=NUM_RELAYS; i++){
    pinMode(relayGPIOs[i-1], OUTPUT);
    if(RELAY_NO){
      digitalWrite(relayGPIOs[i-1], HIGH);
    }
    else{
      digitalWrite(relayGPIOs[i-1], LOW);
    }
  }
  
  // Connect to WiFi network
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(DELAY_CONNECTING_WIFI_MS);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("Connected to the WiFi network.");
  Serial.println("");
  
  // Print out network information
  getNetworkInfo();

  // Route for root / web page
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/html", index_html, processor);
  });

  // Send a POST request to <ESP_IP>/control
  server.on("/control", HTTP_POST, [] (AsyncWebServerRequest *request) {
    Serial.println("> POST /control");
    int params = request->params();
    for (int i = 0; i < params; i++) {
      AsyncWebParameter* p = request->getParam(i);
      Serial.printf("REQUEST[%s]: %s\n", p->name().c_str(), p->value().c_str());
    }

    if (!request->hasParam(PARAM_INPUT_1, true) & !request->hasParam(PARAM_INPUT_2, true)) {
       request->send(400, "text/plain", "BAD REQUEST");
    } else {      
      String relay = request->getParam(PARAM_INPUT_1, true)->value();
      String state = request->getParam(PARAM_INPUT_2, true)->value();

      int indexOfRelay = searchElementInArray(relays, NUM_RELAYS, relay);
      if (indexOfRelay == -1) {
        request->send(400, "text/plain", "BAD REQUEST");
      } else {
         if(RELAY_NO){
          digitalWrite(relayGPIOs[indexOfRelay], !state.toInt());
        } else{
          digitalWrite(relayGPIOs[indexOfRelay], state.toInt());
        }
        Serial.println(relay + (state.toInt() == 1 ? " ON" : " OFF"));

        request->send(200, "text/plain", "OK");
      }
    }
    Serial.println();
  });
  
  server.begin();
}
  
void loop() {

}
