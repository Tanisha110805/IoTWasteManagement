#include <SoftwareSerial.h>
SoftwareSerial esp8266(2,3);
#include <LiquidCrystal.h>
LiquidCrystal lcd(8,9,10,11,12,13);//RS,EN,D4,D5,D6,D7
#include <Servo.h>
#define buzzer 4
#define trigPin1 A4  //// front
#define echoPin1 A5
int lvl1=0;
long duration, distance,sensor1,sensor2,sensor3; // us variable
int onetime=0,onetime1=0 ;
int wet=0,moisture=0,object=0,cabin2=0,c1=0,c2=0;
int powers=0,powers1=0,powers2=0,powers3=0;

void setup() 
{
 Serial.begin(115200);
 esp8266.begin(9600);
 lcd.begin(16, 2); //initializing LCD
 lcd.setCursor(0,0); 
 lcd.print("Automatic WASTE");
 delay(3000);
 pinMode(buzzer,OUTPUT);
 pinMode(trigPin1, OUTPUT);
 pinMode(echoPin1, INPUT);
 delay(3000);
}

void loop()
{
 ultrasensor(trigPin1, echoPin1);
 sensor1 = distance;  
 delay(10);
 esp8266.println(sensor1);
 lvl1=(20-sensor1)*7;
 esp8266.println(lvl1);
 if(lvl1<0){lvl1=0;}
 if(lvl1>100){lvl1=100;}
 lcd.clear();
 lcd.setCursor(0,0); 
 lcd.print("Dustbin Level");
 lcd.setCursor(6,1); 
 lcd.print(lvl1);
 delay(1000);
 if(lvl1>70)
 {      
  if(onetime==0)
  {
    lcd.clear();
   lcd.setCursor(0,0); 
   lcd.print("-send msg-");
   digitalWrite(buzzer,HIGH); 
   tracking(); 
   digitalWrite(buzzer,LOW);
   onetime=1;
  }
 }  
 else
 {
  onetime=0;
 }
 ////////////////////////////////////////////////
 String data = "";
 data+= "{";
 data+= "\"anloga\":";
 data+= "\""+String(lvl1)+"\",";
 data+= "\"anlogb\":";
 data+= "\""+String(powers)+"\",";
 data+= "\"anlogc\":";
 data+= "\""+String(powers1)+"\",";
 data+= "\"anlogd\":";
 data+= "\""+String(powers2)+"\"";
 data+= "}";
 Serial.print('\r');
 Serial.print(data);
 delay(10);
 Serial.print('\n');
 delay(200);
 ///////////////////////////////////////////////   
}

void init_sms()
{
 esp8266.println("AT+CMGF=1");
 delay(400);
 esp8266.println("AT+CMGS=\"+919X083X52XX\"");   // use your 10 digit cell no. here //
 delay(400);
}

void init_sms1()
{
 esp8266.println("AT+CMGF=1");
 delay(400);
 esp8266.println("AT+CMGS=\"+918XX227XX8X\"");   // use your 10 digit cell no. here
 delay(400);
}  

void send_data(String message)
{
 esp8266.println(message);
 delay(200);
}

void send_sms()
{
 esp8266.write(26);
}

void tracking()
{
 init_sms();
 send_data("dustbin-001  is almost full:\n");
 send_sms();
 delay(6000);
 init_sms1();
 send_data("dustbin-001  is almost full:\n");
 esp8266.print(" Level in %");
 esp8266.print(lvl1);
 send_sms();
 delay(6000);
}

void ultrasensor(int trigPin,int echoPin)
{ 
 digitalWrite(trigPin, LOW);  
 delayMicroseconds(2); 
 digitalWrite(trigPin, HIGH);
 delayMicroseconds(10); 
 digitalWrite(trigPin, LOW);
 duration = pulseIn(echoPin, HIGH);
 distance = (duration/2) / 29.1;
}
