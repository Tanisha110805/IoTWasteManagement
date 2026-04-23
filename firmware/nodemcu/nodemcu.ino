#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <Arduino_JSON.h>

// Update with your actual Wi-Fi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Update with your machine's local IP address where the backend is running
const char* serverName = "http://192.168.1.X:3001/api/telemetry";

String inputData = "";
boolean data_complete = false;

String vala; // anloga (level)

void setup() {
  Serial.begin(115200);
  inputData.reserve(200);
  
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Read Serial data from Arduino
  while(Serial.available() > 0) {
    char inChar = Serial.read();
    if(inChar == '\r') {
      inputData = "";
    } else if(inChar == '\n') {
      data_complete = true;
    } else {
      inputData += inChar;
    }
  }

  if(data_complete) {
    data_complete = false;
    Serial.println("Received: " + inputData);
    parseAndSend();
  }
}

void parseAndSend() {
  JSONVar myObject = JSON.parse(inputData);    
  if (JSON.typeof(myObject) == "undefined") {
    Serial.println("Parsing input failed!");
    return;
  }

  if (myObject.hasOwnProperty("anloga")) {
    vala = (const char*) myObject["anloga"];
    Serial.print("Garbage Level: ");
    Serial.println(vala);
    
    // Send data to Backend via HTTP POST
    if (WiFi.status() == WL_CONNECTED) {
      WiFiClient client;
      HTTPClient http;
      
      http.begin(client, serverName);
      http.addHeader("Content-Type", "application/json");
      
      // Create JSON payload
      String jsonPayload = "{\"anloga\":\"" + vala + "\"}";
      
      int httpResponseCode = http.POST(jsonPayload);
      
      if (httpResponseCode > 0) {
        Serial.print("HTTP Response code: ");
        Serial.println(httpResponseCode);
        String payload = http.getString();
        Serial.println(payload);
      } else {
        Serial.print("Error code: ");
        Serial.println(httpResponseCode);
      }
      http.end();
    } else {
      Serial.println("WiFi Disconnected");
    }
  }
}
