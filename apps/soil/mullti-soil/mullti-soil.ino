#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

// USED D1 WiFi R1 BOARD

// WIFI PARAMETERS
const char* SSID = "WIFI_SSID";
const char* PASSWORD = "WIFI_PASSWORD";

// Set your Static IP Address Settings
IPAddress local_IP(192, 168, 0, 174);
IPAddress gateway(192, 168, 0, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress primaryDNS(8, 8, 8, 8); // this is optional
IPAddress secondaryDNS(8, 8, 4, 4); // this is optional

const int SENSOR_COUNT = 3;
// GPIO PINS ARE USED
const int SENSOR_PINS[SENSOR_COUNT] = {16, 5, 4};

// INPUT PINS
const int MULTIPLEX_ANALOG_PIN_0 = A0;

// CONSTANTS
const int DRY_GROUND = 600;
const int WET_GROUND = 200;
const float SLOPE = 2.48; // slope from linear fit
const float INTERCEPT = -0.72; // intercept from linear fit

// DELAYS
const int DELAY_CONNECTING_SERIAL_MS = 100; // 0.1 sec
const int DELAY_CONNECTING_WIFI_MS = 500; // 0.5 sec
const int DELAY_LOOP_MS = 3000; // 3 sec

// SERVER CONFIG
const int PORT = 81;
WebSocketsServer webSocket = WebSocketsServer(PORT);

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

  // Setup input pins
  pinMode(MULTIPLEX_ANALOG_PIN_0,INPUT);

  // Setup output pins
  for (int i = 0; i < SENSOR_COUNT; i++) {
      pinMode(SENSOR_PINS[i],OUTPUT);
  }

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

// Function to Read from a Specific Sensor
int readSensor(int sensorNumber) {
    // Set all sensor pins LOW except the selected one
    for (int i = 0; i < SENSOR_COUNT; i++) {
        digitalWrite(SENSOR_PINS[i], i == sensorNumber ? HIGH : LOW);
    }
    delay(100); // Allow time for the multiplexer to switch
    int sensorValue = analogRead(MULTIPLEX_ANALOG_PIN_0);
    delay(100); // Stabilization delay
    return sensorValue;
}

DynamicJsonDocument createSensorJson(int sensorValue, int sensorNumber) {
    DynamicJsonDocument doc(128);
    int percentage = map(sensorValue, DRY_GROUND, WET_GROUND, 0, 100);
    percentage = constrain(percentage, 0, 100);
    float voltage = (float(percentage) / 1023.0) * 3.3;
    float volumeWaterContent = ((1.0 / voltage) * SLOPE) + INTERCEPT;
    int plant = sensorNumber + 1;

    doc["sensor"][sensorNumber]["plant"] = plant;
    doc["sensor"][sensorNumber]["raw"] = sensorValue;
    doc["sensor"][sensorNumber]["percentage"] = percentage;
    doc["sensor"][sensorNumber]["voltage"] = voltage;
    doc["sensor"][sensorNumber]["volumeWaterContent"] = volumeWaterContent;

    return doc;
}

void loop() {
  webSocket.loop();

  DynamicJsonDocument sensorData(1024);

  for (int i = 0; i < SENSOR_COUNT; i++) {
    int sensorValue = readSensor(i);
    DynamicJsonDocument sensorJson = createSensorJson(sensorValue, i);
    sensorData["sensors"][i] = sensorJson["sensor"][i];
  }

  String json;
  serializeJson(sensorData, json);
  Serial.println(json);
  webSocket.broadcastTXT(json);

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
