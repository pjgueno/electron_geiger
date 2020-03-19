#include <Wire.h> 
#include <LiquidCrystal_I2C.h>

// Set the LCD address to 0x27 for a 16 chars and 2 line display
LiquidCrystal_I2C lcd(0x27, 16, 2);

#define LOG_PERIOD 15000     //Logging period in milliseconds, recommended value 15000-60000.
#define MAX_PERIOD 60000    //Maximum logging period

unsigned long counts;             //variable for GM Tube events
unsigned long cpm;                 //variable for CPM
unsigned int multiplier;             //variable for calculation CPM in this sketch
unsigned long previousMillis;      //variable for time measurement

const char textDisplay[]="Radioactivity is in the air for you and me";
byte textLen;
const unsigned int scrollDelay = 500;
const unsigned int startDelay = 1000; 

void impulse(){               //procedure for capturing events from Geiger Kit
  counts++;
}

void setup()
{
  lcd.begin();
  lcd.backlight();
  
  // Initialize the serial port at a speed of 9600 baud
  Serial.begin(9600);
  
  textLen = sizeof(textDisplay) - 1;
//
//  lcd.print(textDisplay);
//  delay(startDelay);
//
//  for (byte positionCounter = 0; positionCounter < textLen; positionCounter++) {
//    lcd.scrollDisplayLeft();
//    delay(scrollDelay);
//  }
//    
//  delay(startDelay);
  counts = 0;
  cpm = 0;
  multiplier = MAX_PERIOD / LOG_PERIOD;

  pinMode(2, INPUT);                                  
  attachInterrupt(digitalPinToInterrupt(2), impulse, FALLING); 
  //Serial.println("Start counter"); 
 }

void loop()
{

unsigned long currentMillis = millis();

  if(currentMillis - previousMillis > LOG_PERIOD){
    previousMillis = currentMillis;
    cpm = counts * multiplier;
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("CPM=");
    lcd.print(cpm);
    lcd.setCursor(0, 1);
    //Serial.print(cpm);
    //Serial.println(" cpm");
    lcd.print("Rad=");
    lcd.print(cpm*0.00812037,4);
    lcd.print(" uS/h");

//    byte buf32[4];
//  buf32[0] = cpm & 255;
//  buf32[1] = (cpm >> 8)  & 255;
//  buf32[2] = (cpm >> 16) & 255;
//  buf32[3] = (cpm >> 24) & 255;
//
//    Serial.write(buf32, sizeof(buf32));

//Serial.write(cpm);

Serial.write((byte*)&cpm, sizeof(cpm));

//inline size_t write(unsigned long n) { return write((byte*)&n, sizeof(n)); }
    
    //Serial.print(cpm*0.00812037,4);
    //Serial.println(" uS/h");
    counts = 0;
    cpm = 0;
  }
}

