#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include "DHT.h"

// USED D1 WiFi R1 BOARD

#define HYGROMETER_PIN D12 // what digital pin we're connected to measure temp and humidity

#define HYGROMETER_TYPE DHT11 // DHT 11

// WIFI PARAMETERS
const char *SSID = "websouffle";
const char *PASSWORD = "SharingIsCaring";

// Set your Static IP Address Settings
IPAddress local_IP(192, 168, 0, 174);
IPAddress gateway(192, 168, 0, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress primaryDNS(8, 8, 8, 8);   // this is optional
IPAddress secondaryDNS(8, 8, 4, 4); // this is optional

// initialize dht library
DHT hygrometer(HYGROMETER_PIN, HYGROMETER_TYPE);

// MOISTURE SENSOR CONFIG
const int MOISTURE_SENSOR_COUNT = 4;
// GPIO PINS ARE USED FOR THE SOIL MOISTURE SENSORS
const int MOISTURE_SENSOR_PINS[MOISTURE_SENSOR_COUNT] = {16, 5, 4, 14};

// LIGHT SENSOR CONFIG
const int LIGHT_SENSOR_PIN = 8;

// ANALOG PINS
const int MULTIPLEX_ANALOG_PIN_0 = A0;

// CONSTANTS
const int DRY_GROUND = 570;
const int WET_GROUND = 200;
const float SLOPE = 2.48;      // slope from linear fit
const float INTERCEPT = -0.72; // intercept from linear fit

// DELAYS
const int DELAY_CONNECTING_SERIAL_MS = 100;      // 0.1 sec
const int DELAY_CONNECTING_WIFI_MS = 500;        // 0.5 sec
const int DELAY_LOOP_MS = 10000;                 // 10 sec
const int DELAY_MULTIPLEXER_STABILIZATION = 100; // 0.1 sec

// SERVER CONFIG
const int PORT = 81;
WebSocketsServer webSocket = WebSocketsServer(PORT);

String gpioToDPin(int gpioPin)
{
  switch (gpioPin)
  {
  case 16:
    return "D2";
  case 5:
    return "D3";
  case 4:
    return "D4";
  case 14:
    return "D13";
  case 13:
    return "D11";
  case 8:
    return "D0";
  default:
    return "Unknown";
  }
}

void getNetworkInfo()
{
  if (WiFi.status() != WL_CONNECTED)
  {
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
  Serial.println((String) "[+] RSSI: " + WiFi.RSSI() + " dB");
  Serial.print("[+] ESP32 IP: ");
  Serial.println(WiFi.localIP());
  Serial.println("");
}

void setup()
{
  Serial.begin(115200);
  analogReference(EXTERNAL); // set the analog reference to 3.3V

  // Setup input pins
  pinMode(MULTIPLEX_ANALOG_PIN_0, INPUT);

  // Setup soil output pins
  for (int i = 0; i < MOISTURE_SENSOR_COUNT; i++)
  {
    pinMode(MOISTURE_SENSOR_PINS[i], OUTPUT);
  }

  Serial.println("Booting up... give me a second, initializing");
  delay(DELAY_CONNECTING_SERIAL_MS);

  // Connect to WiFi network
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(SSID);
  if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS))
  {
    Serial.println("WiFi Failed to configure");
  }
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED)
  {
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

  // Start barometer
  hygrometer.begin();

  webSocket.onEvent(webSocketEvent);
}

// Function to Read from a Moisture Specific Sensor
int readMoistureSensor(int moistureSensorNumber)
{
  // Set light sensor to low, since we don't want to read this value here
  digitalWrite(LIGHT_SENSOR_PIN, LOW);

  // Set all moisture sensor pins LOW except the selected one
  for (int i = 0; i < MOISTURE_SENSOR_COUNT; i++)
  {
    digitalWrite(MOISTURE_SENSOR_PINS[i], i == moistureSensorNumber ? HIGH : LOW);
  }

  delay(DELAY_MULTIPLEXER_STABILIZATION); // Allow time for the multiplexer to switch
  int sensorValue = analogRead(MULTIPLEX_ANALOG_PIN_0);
  delay(DELAY_MULTIPLEXER_STABILIZATION); // Stabilization delay
  return sensorValue;
}

// Function to Read from a Specific Sensor
int readLightSensor()
{
  // Set all moisture sensor pins to LOW since we don't want to read moisture sensors here
  for (int i = 0; i < MOISTURE_SENSOR_COUNT; i++)
  {
    digitalWrite(MOISTURE_SENSOR_PINS[i], LOW);
  }

  // Set light sensor to HIGH, since we do want to read the light sensor
  digitalWrite(LIGHT_SENSOR_PIN, HIGH);

  delay(DELAY_MULTIPLEXER_STABILIZATION); // Allow time for the multiplexer to switch
  int sensorValue = analogRead(MULTIPLEX_ANALOG_PIN_0);
  delay(DELAY_MULTIPLEXER_STABILIZATION); // Stabilization delay
  return sensorValue;
}

DynamicJsonDocument createMoistureSensorJson(int moistureSensorNumber)
{
  int moistureSensorValue = readMoistureSensor(moistureSensorNumber);

  DynamicJsonDocument doc(128);
  int percentage = map(moistureSensorValue, DRY_GROUND, WET_GROUND, 0, 100);
  percentage = constrain(percentage, 0, 100);
  float voltage = (float(percentage) / 1023.0) * 3.3;
  float volumeWaterContent = ((1.0 / voltage) * SLOPE) + INTERCEPT;
  int plant = moistureSensorNumber + 1;

  doc["type"] = "moisture";
  doc["plant"] = plant;
  doc["pin"] = gpioToDPin(MOISTURE_SENSOR_PINS[moistureSensorNumber]);
  doc["value"] = moistureSensorValue;
  doc["percentage"] = percentage;
  doc["voltage"] = voltage;
  doc["volumeWaterContent"] = volumeWaterContent;
  Serial.print("Plant ");
  Serial.print(plant);
  Serial.print(": ");
  Serial.print(percentage);
  Serial.println("% moisture");
  return doc;
}

DynamicJsonDocument createHygrometerSensorJson()
{
  // Reading temperature or humidity takes about 250 milliseconds!
  // Read temperature as Celsius (the default)
  float temperatureInCelsius = hygrometer.readTemperature();
  // Read temperature as Fahrenheit (isFahrenheit = true)
  float temperatureInFahrenheit = hygrometer.readTemperature(true);
  // Read humidity in percentage
  float humidity = hygrometer.readHumidity();

  // Check if any reads failed and exit early (to try again).
  if (isnan(temperatureInCelsius) || isnan(temperatureInFahrenheit) || isnan(temperatureInFahrenheit) || isnan(humidity))
  {
    Serial.println("Failed to read data from DHT sensor!");
    return DynamicJsonDocument(0); // return an empty JSON document
  }

  // Compute heat index in Fahrenheit (the default)
  float heatIndexInFahrenheit = hygrometer.computeHeatIndex(temperatureInFahrenheit, humidity);
  // Compute heat index in Celsius (isFahreheit = false)
  float heatIndexInCelsius = hygrometer.computeHeatIndex(temperatureInCelsius, humidity, false);

  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.println("%");

  Serial.print("Temperature: ");
  Serial.print(temperatureInCelsius);
  Serial.println("°C");

  DynamicJsonDocument doc(128);
  doc["type"] = "hygrometer";
  doc["pin"] = HYGROMETER_PIN;
  doc["heatIndexInCelsius"] = heatIndexInCelsius;
  doc["heatIndexInFahrenheit"] = heatIndexInFahrenheit;
  doc["humidityInPercentage"] = humidity;
  doc["temperatureInCelsius"] = temperatureInCelsius;
  doc["temperatureInFahrenheit"] = temperatureInFahrenheit;

  return doc;
}

DynamicJsonDocument createLightSensorJson()
{
  int lightSensorValue = readLightSensor();

  DynamicJsonDocument doc(128);

  doc["type"] = "light";
  doc["pin"] = LIGHT_SENSOR_PIN;
  doc["value"] = lightSensorValue;
  Serial.print("Light: ");
  Serial.print(lightSensorValue);
  Serial.println(" lux");
  return doc;
}

void loop()
{
  webSocket.loop();

  DynamicJsonDocument sensorData(2048);

  // Read All Moisture Sensors
  for (int i = 0; i < MOISTURE_SENSOR_COUNT; i++)
  {
    DynamicJsonDocument sensorMoistureJson = createMoistureSensorJson(i);
    sensorData["sensors"][i] = sensorMoistureJson;
  }

  // Read Hygrometer Sensor (Temperature and Humidity)
  int currentSensorCount = MOISTURE_SENSOR_COUNT;
  DynamicJsonDocument sensorHygrometerJson = createHygrometerSensorJson();
  if (!sensorHygrometerJson.isNull())
  {
    sensorData["sensors"][currentSensorCount] = sensorHygrometerJson;
  }
  else
  {
    Serial.println("Hygrometer sensor data is empty.");
    return;
  }

  // Read Light Sensor
  currentSensorCount = currentSensorCount + 1;
  DynamicJsonDocument sensorLightJson = createLightSensorJson();
  sensorData["sensors"][currentSensorCount] = sensorLightJson;

  String json;
  serializeJson(sensorData, json);
  Serial.println(json);
  webSocket.broadcastTXT(json);

  delay(DELAY_LOOP_MS);
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length)
{
  switch (type)
  {
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
    if (payload[0] == 'p' && payload[1] == 'i' && payload[2] == 'n' && payload[3] == 'g')
    {
      // send the pong payload
      webSocket.sendTXT(num, "pong", 4);
    }
    break;
  case WStype_BIN:
    break;
  }
}
