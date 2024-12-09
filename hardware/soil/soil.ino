#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

// WIFI PARAMETERS
const char* SSID = "WIFI_SSID";
const char* PASSWORD = "WIFI_PASSWORD";

// Set your Static IP Address Settings
IPAddress local_IP(192, 168, 0, 174);
IPAddress gateway(192, 168, 0, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress primaryDNS(8, 8, 8, 8); // this is optional
IPAddress secondaryDNS(8, 8, 4, 4); // this is optional

// INPUT PINS
const int INPUT_PIN_SOIL_PLANT_1 = A0;

// CONSTANTS
const int DRY_GROUND = 745;
const int WET_GROUND = 310;
const float SLOPE = 2.48; // slope from linear fit
const float INTERCEPT = -0.72; // intercept from linear fit

// DELAYS
const int DELAY_CONNECTING_SERIAL_MS = 100; // 0.1 sec
const int DELAY_CONNECTING_WIFI_MS = 500; // 0.5 sec
const int DELAY_LOOP_MS = 3000; // 3 sec

// SERVER CONFIG
const int PORT = 81;
WebSocketsServer webSocket = WebSocketsServer(PORT);

// VALUES
float previousSensorValue = 0;

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

void setup() {
  Serial.begin(115200);
  analogReference(EXTERNAL); // set the analog reference to 3.3V
  Serial.println("Booting up... give me a second, initializing");
  delay(DELAY_CONNECTING_SERIAL_MS);

   // Connect to WiFi network
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(SSID);
  if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
    Serial.println("WiFi Failed to configure");
  }
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
  
  webSocket.begin();
  Serial.println("[*] Server started.");
  Serial.print("[+] PORT: ");
  Serial.println(PORT);
  
  // Print the IP address
  Serial.print("[+] URL: ");
  Serial.print("ws://");
  Serial.print(WiFi.localIP());
  Serial.print(":");
  Serial.println(PORT);

  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();
  
  // READ RAW SENSOR DATA
  float sensorValue,percentage,voltage,volumeWaterContent;

  // INIT DATA
  sensorValue = analogRead(INPUT_PIN_SOIL_PLANT_1); // read sensor
  percentage = map(sensorValue, DRY_GROUND, WET_GROUND, 0, 100);
  if (percentage > 100) {
    percentage = 100;
  } else if (percentage < 0) {
    percentage = 0;
  }
  voltage = (float(sensorValue)/1023.0)*3.3;
  volumeWaterContent = ((1.0/voltage)*SLOPE)+INTERCEPT; // calc of theta_v (vol. water content)

  // CREATE JSON
  DynamicJsonDocument doc(512);
  doc["raw"] = sensorValue;
  doc["percentage"] = percentage;
  doc["voltage"] = voltage;
  doc["volumeWaterContent"] = volumeWaterContent;
  String json;
  serializeJson(doc, json);

  // SEND DATA
  if (previousSensorValue != sensorValue) {
    // LOG DATA
    Serial.println(json);
    // SEND OVER WS
    webSocket.broadcastTXT(json);
    previousSensorValue = sensorValue;
  }

  // DELAY LOOP
  delay(DELAY_LOOP_MS);
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\n", num);
      break;
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
      }
      break;
    case WStype_TEXT:
      Serial.printf("[%u] Text: %s\n", num, payload);
      if (payload[0] == 'p' && payload[1] == 'i' && payload[2] == 'n' && payload[3] == 'g') {
        // send the pong payload
        webSocket.sendTXT(num, "pong", 4);
      }
      break;
    case WStype_BIN:
      break;
  }
}
