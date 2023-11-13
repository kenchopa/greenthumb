#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

// USED D1 WiFi R1 BOARD

// WIFI PARAMETERS
const char* SSID = "websouffle";
const char* PASSWORD = "SharingIsCaring";

// Set your Static IP Address Settings
IPAddress local_IP(192, 168, 0, 174);
IPAddress gateway(192, 168, 0, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress primaryDNS(8, 8, 8, 8); // this is optional
IPAddress secondaryDNS(8, 8, 4, 4); // this is optional


const int SENSOR_COUNT = 2;
const int SENSOR_PINS[SENSOR_COUNT] = {5, 4};

// INPUT PINS
const int MULTIPLEX_ANALOG_PIN_0 = A0;

// Check GPIO pins on board - image
const int PIN_SENSOR_ONE_D3 = 5;
const int PIN_SENSOR_TWO_D4 = 4;

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

// VALUES
float previousReadSoilPlant1 = 0;
float previousReadSoilPlant2 = 0;

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
  pinMode(PIN_SENSOR_ONE_D3,OUTPUT);
  pinMode(PIN_SENSOR_TWO_D4,OUTPUT);
  pinMode(MULTIPLEX_ANALOG_PIN_0,INPUT);
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

int analogReadPlantOne() {
    digitalWrite(PIN_SENSOR_ONE_D3, HIGH); // Turn D3 On
    digitalWrite(PIN_SENSOR_TWO_D4, LOW); // Turn D4 Off
    delay(100);
    int readSensorOne = analogRead(MULTIPLEX_ANALOG_PIN_0);
    delay(100);
    return readSensorOne;
}

int analogReadPlantTwo() {
    digitalWrite(PIN_SENSOR_ONE_D3, LOW); //  Turn D3 OFF
    digitalWrite(PIN_SENSOR_TWO_D4, HIGH); // Turn D4 ON
    delay(100);
    int readSensorTwo = analogRead(MULTIPLEX_ANALOG_PIN_0);
    delay(100);
    return readSensorTwo;
}

void loop() {
  webSocket.loop();

  // READ RAW SENSOR DATA
  float
    sensorValuePlantOne,
    percentagePlantOne,
    voltagePlantOne,
    volumeWaterContentPlantOne,
    sensorValuePlantTwo,
    percentagePlantTwo,
    voltagePlantTwo,
    volumeWaterContentPlantTwo;

  // INIT DATA
  // Plant 1
  sensorValuePlantOne = analogReadPlantOne(); // read sensor
  percentagePlantOne = map(sensorValuePlantOne, DRY_GROUND, WET_GROUND, 0, 100);
  if (percentagePlantOne > 100) {
    percentagePlantOne = 100;
  } else if (percentagePlantOne < 0) {
    percentagePlantOne = 0;
  }
  voltagePlantOne = (float(percentagePlantOne)/1023.0)*3.3;
  volumeWaterContentPlantOne = ((1.0/voltagePlantTwo)*SLOPE)+INTERCEPT; // calc of theta_v (vol. water content)

  // Plant 2
  sensorValuePlantTwo = analogReadPlantTwo(); // read sensor
  percentagePlantTwo = map(sensorValuePlantTwo, DRY_GROUND, WET_GROUND, 0, 100);
  if (percentagePlantTwo > 100) {
    percentagePlantTwo = 100;
  } else if (percentagePlantTwo < 0) {
    percentagePlantTwo = 0;
  }
  voltagePlantTwo = (float(percentagePlantTwo)/1023.0)*3.3;
  volumeWaterContentPlantTwo = ((1.0/voltagePlantTwo)*SLOPE)+INTERCEPT; // calc of theta_v (vol. water content)

  Serial.print("sensor 1 = ");
  Serial.print(sensorValuePlantOne);
  Serial.print(" / sensor 2 = ");
  Serial.println(sensorValuePlantTwo);

  // CREATE JSON
  DynamicJsonDocument doc(512);
  // Plant 1
  doc["plantOne"]["raw"] = sensorValuePlantOne;
  doc["plantOne"]["percentage"] = percentagePlantOne;
  doc["plantOne"]["voltage"] = voltagePlantOne;
  doc["plantOne"]["volumeWaterContent"] = volumeWaterContentPlantOne;
  // Plant two
  doc["plantTwo"]["raw"] = sensorValuePlantTwo;
  doc["plantTwo"]["percentage"] = percentagePlantTwo;
  doc["plantTwo"]["voltage"] = voltagePlantTwo;
  doc["plantTwo"]["volumeWaterContent"] = volumeWaterContentPlantTwo;
  String json;
  serializeJson(doc, json);

  // SEND DATA
  if (previousReadSoilPlant1 != sensorValuePlantOne && previousReadSoilPlant2 != sensorValuePlantTwo) {
    // LOG DATA
    Serial.println(json);
    // SEND OVER WS
    webSocket.broadcastTXT(json);
    previousReadSoilPlant1 = sensorValuePlantOne;
    previousReadSoilPlant2 = sensorValuePlantTwo;
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
