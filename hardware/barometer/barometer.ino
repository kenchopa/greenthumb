#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include "DHT.h"

#define DHTPIN D5  // what digital pin we're connected to measure temp and humidity

#define DHTTYPE DHT11   // DHT 11

// DELAYS
const int DELAY_CONNECTING_SERIAL_MS = 100; // 0.1 sec
const int DELAY_CONNECTING_WIFI_MS = 500; // 0.5 sec
const int DELAY_LOOP_MS = 3000; // 3 sec

// WIFI PARAMETERS
const char* SSID = "WIFI_SSID";
const char* PASSWORD = "WIFI_PASSWORD";

// Set your Static IP Address Settings
IPAddress local_IP(192, 168, 0, 175);
IPAddress gateway(192, 168, 0, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress primaryDNS(8, 8, 8, 8); // this is optional
IPAddress secondaryDNS(8, 8, 4, 4); // this is optional

// initialize dht library
DHT dht(DHTPIN, DHTTYPE);

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
  
  // Start websocket
  webSocket.begin();
  Serial.println("[*] Server started.");
  Serial.print("[+] PORT: ");
  Serial.println(PORT);
  
  // Print the IP address of websocket
  Serial.print("[+] URL: ");
  Serial.print("ws://");
  Serial.print(WiFi.localIP());
  Serial.print(":");
  Serial.println(PORT);
  
  // Start barometer
  dht.begin();   

  // Listen on websocket event
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  // DELAY LOOP
  delay(DELAY_LOOP_MS);
  
  webSocket.loop();

  // Reading temperature or humidity takes about 250 milliseconds!
  // Read temperature as Celsius (the default)
  float temperatureInCelsius = dht.readTemperature();
  // Read temperature as Fahrenheit (isFahrenheit = true)
  float temperatureInFahrenheit = dht.readTemperature(true);
  // Reading humidity
  float humidity = dht.readHumidity();
  // Check if any reads failed and exit early (to try again).
  if (isnan(temperatureInCelsius) || isnan(temperatureInFahrenheit) || isnan(temperatureInFahrenheit)) {    
    Serial.println("Failed to read data from DHT sensor!");
    return;
  }

   // Compute heat index in Fahrenheit (the default)
   float heatIndexInFahrenheit = dht.computeHeatIndex(temperatureInFahrenheit, humidity);
   // Compute heat index in Celsius (isFahreheit = false)
   float heatIndexInCelsius = dht.computeHeatIndex(temperatureInCelsius, humidity, false);

   Serial.println();
   Serial.println("-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------");
   Serial.println();
   Serial.println("DATA:");
   Serial.print ("Humidity: ");
   Serial.print (humidity);
   Serial.println (" %");
   Serial.print ("Temperature: ");
   Serial.print (temperatureInCelsius);
   Serial.print (" °C\t");
   Serial.print (temperatureInFahrenheit);
   Serial.println (" °F");
   Serial.print ("Heat index: ");
   Serial.print (heatIndexInCelsius);
   Serial.print (" °C \t");
   Serial.print (heatIndexInFahrenheit);
   Serial.println (" °F");

  // CREATE JSON
  DynamicJsonDocument doc(512);
  doc["heatIndexInCelsius"] = heatIndexInCelsius;
  doc["heatIndexInFahrenheit"] = heatIndexInFahrenheit;
  doc["humidity"] = humidity;
  doc["temperatureInCelsius"] = temperatureInCelsius;
  doc["temperatureInFahrenheit"] = temperatureInFahrenheit;

  String json;
  serializeJson(doc, json);

  // LOG DATA
  Serial.println();
  Serial.println("JSON:");
  Serial.println(json);
  Serial.println();
  Serial.println("-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------");
  Serial.println();

  // SEND OVER WS
  webSocket.broadcastTXT(json);
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
