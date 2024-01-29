#include <cstring>
#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include "DHT.h"

// USED D1 WiFi R1 BOARD

enum SensorType
{
  MOISTURE,
  LIGHT,
  CO2,
  OXYGEN
};

struct SensorConfig
{
  SensorType type;
  int pin;
};

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
#define HYGROMETER_PIN D12    // what digital pin we're connected to measure temp and humidity
#define HYGROMETER_TYPE DHT11 // DHT 11
DHT hygrometer(HYGROMETER_PIN, HYGROMETER_TYPE);

const int SENSOR_COUNT = 7; // Total number of sensors
SensorConfig sensors[SENSOR_COUNT] = {
    {MOISTURE, 16},
    {MOISTURE, 5},
    {MOISTURE, 4},
    {MOISTURE, 14},
    {LIGHT, 8},
    {CO2, 2},
    {OXYGEN, 15}};

// MOISTURE SENSOR CONFIG
const int MOISTURE_SENSOR_COUNT = 4;
// GPIO PINS ARE USED FOR THE SOIL MOISTURE SENSORS
const int MOISTURE_SENSOR_PINS[MOISTURE_SENSOR_COUNT] = {16, 5, 4, 14};

// ANALOG PINS
const int MULTIPLEX_ANALOG_PIN_0 = A0;

// CONSTANTS
const int DRY_GROUND = 570;
const int WET_GROUND = 200;
const float SLOPE = 2.48;      // slope from linear fit
const float INTERCEPT = -0.72; // intercept from linear fit
const int SAMPLE_RATE = 10;

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
  case 2:
    return "D9";
  case 15:
    return "D10";
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

  // Setup sensor output pins
  for (int i = 0; i < SENSOR_COUNT; i++)
  {
    SensorConfig sensor = sensors[i];
    pinMode(sensor.pin, OUTPUT);
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
int readSensor(SensorConfig currentSensor)
{
  // Loop over all sensors and enable the current sensor to read the value from
  for (int i = 0; i < SENSOR_COUNT; i++)
  {
    SensorConfig sensor = sensors[i];

    // Set all sensor pins LOW except the selected one
    digitalWrite(sensor.pin, sensor.pin == currentSensor.pin ? HIGH : LOW);
  }

  // Allow time for the multiplexer to switch
  delay(DELAY_MULTIPLEXER_STABILIZATION);

  // Create x amount of samples
  int sample[SAMPLE_RATE];
  // memset sets the bytes of sample to 0. Since int is typically larger than a byte,
  // this effectively sets each element of the array to 0.
  memset(sample, 0, sizeof(sample));

  for (int x = 0; x < SAMPLE_RATE; x++)
  {
    sample[x] = analogRead(MULTIPLEX_ANALOG_PIN_0);
    delay(200);
  }

  // Calculate the average from the samples
  int total = 0;
  for (int x = 0; x < SAMPLE_RATE; x++)
  {
    total = total + sample[x];
  }
  int average = total / SAMPLE_RATE;

  // Stabilization delay
  delay(DELAY_MULTIPLEXER_STABILIZATION); // Stabilization delay

  return average;
}

DynamicJsonDocument createMoistureSensorJson(SensorConfig sensor, int value)
{
  DynamicJsonDocument doc(128);
  int percentage = map(value, DRY_GROUND, WET_GROUND, 0, 100);
  percentage = constrain(percentage, 0, 100);
  float voltage = (float(percentage) / 1023.0) * 3.3;
  float volumeWaterContent = ((1.0 / voltage) * SLOPE) + INTERCEPT;

  doc["type"] = sensor.type;
  doc["pin"] = gpioToDPin(sensor.pin);
  doc["value"] = value;
  doc["percentage"] = percentage;
  doc["voltage"] = voltage;
  doc["volumeWaterContent"] = volumeWaterContent;
  Serial.print("Sensor ");
  Serial.print(sensor.pin);
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

  DynamicJsonDocument doc(128);
  doc["type"] = "hygrometer";
  doc["pin"] = "D" + String(HYGROMETER_PIN);
  doc["heatIndexInCelsius"] = heatIndexInCelsius;
  doc["heatIndexInFahrenheit"] = heatIndexInFahrenheit;
  doc["humidityInPercentage"] = humidity;
  doc["temperatureInCelsius"] = temperatureInCelsius;
  doc["temperatureInFahrenheit"] = temperatureInFahrenheit;

  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.println("%");

  Serial.print("Temperature: ");
  Serial.print(temperatureInCelsius);
  Serial.println("°C");

  return doc;
}

DynamicJsonDocument createLightSensorJson(SensorConfig sensor, int value)
{
  DynamicJsonDocument doc(128);
  doc["type"] = sensor.type;
  doc["pin"] = gpioToDPin(sensor.pin);
  doc["value"] = value;

  Serial.print("Light: ");
  Serial.print(value);
  Serial.println(" lux");

  return doc;
}

DynamicJsonDocument createCO2SensorJson(SensorConfig sensor, int value)
{
  DynamicJsonDocument doc(128);
  doc["type"] = sensor.type;
  doc["pin"] = gpioToDPin(sensor.pin);
  doc["value"] = value;

  Serial.print("CO2: ");
  Serial.print(value);
  Serial.println(" PPM");

  return doc;
}

DynamicJsonDocument createOxygenSensorJson(SensorConfig sensor, int value)
{
  DynamicJsonDocument doc(128);
  doc["type"] = sensor.type;
  doc["pin"] = gpioToDPin(sensor.pin);
  doc["value"] = value;

  Serial.print("OXYGEN: ");
  Serial.print(value);
  Serial.println(" PPM");

  return doc;
}

void loop()
{
  webSocket.loop();

  DynamicJsonDocument sensorData(2048);

  // Read All Multiplex Sensors
  for (int i = 0; i < SENSOR_COUNT; i++)
  {
    SensorConfig sensor = sensors[i];

    int rawSensorValue = readSensor(sensor);

    // Determine sensor json data
    switch (sensor.type)
    {
    case MOISTURE:
    {
      // Read moisture sensor and add to JSON
      DynamicJsonDocument sensorMoistureJson = createMoistureSensorJson(sensor, rawSensorValue);
      sensorData["sensors"][i] = sensorMoistureJson;
      break;
    }
    case LIGHT:
    {
      // Read light sensor and add to JSON
      DynamicJsonDocument sensorLightJson = createLightSensorJson(sensor, rawSensorValue);
      sensorData["sensors"][i] = sensorLightJson;
      break;
    }
    case CO2:
    {
      // Read CO2 sensor and add to JSON
      DynamicJsonDocument sensorCO2Json = createCO2SensorJson(sensor, rawSensorValue);
      sensorData["sensors"][i] = sensorCO2Json;
      break;
    }
    case OXYGEN:
    {
      // Read oxygen sensor and add to JSON
      DynamicJsonDocument sensorOxygenJson = createOxygenSensorJson(sensor, rawSensorValue);
      sensorData["sensors"][i] = sensorOxygenJson;
      break;
    }
      // Add cases for other sensor types if necessary
    }
  }

  // Read Hygrometer Sensor (Temperature and Humidity)
  // This sensor doens't use the multiplex analog sensor reading but has it own digital pin for the readings
  // (dht-11) works this way
  int currentSensorCount = SENSOR_COUNT;
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
