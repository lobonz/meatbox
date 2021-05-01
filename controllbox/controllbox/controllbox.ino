#include "ArduinoJson.h"

///////////////////////////////////////////////
////    DEBUG - Comment out to stop verbose serial output
///////////////////////////////////////////////
//#define DEBUG

///////////////////////////////////////////////
////    RESET FUNCTION
///////////////////////////////////////////////
void(* resetFunc) (void) = 0; //declare reset function @ address 0

///////////////////////////////////////////////
////    LOADCELL MOVING AVERAGES
///////////////////////////////////////////////
// Weight is not expected to change suddenly so moving average smooths any errors and help with drift.
#include <movingAvg.h> 
movingAvg avgloadcell_1(30);
movingAvg avgloadcell_2(30);
movingAvg avgloadcell_3(30);
movingAvg avgloadcell_4(30);
movingAvg avgloadcell_5(30);

///////////////////////////////////////////////
////    RELAYS / RELAY PIN NUMBERS
///////////////////////////////////////////////
  const int light_relayenable = 22;
  const int cool_relayenable = 24;
  const int heat_relayenable = 26;

  const int humidify_relayenable = 28;
  const int dehumidify_relayenable = 30;
  const int airpump_relayenable = 32;
  const int circulate_relayenable = 34;
  //const int ??_relayenable = 36;
  
///////////////////////////////////////////////
////    TIMER
///////////////////////////////////////////////
#include <arduino-timer.h>;
auto timer = timer_create_default();
Timer<> default_timer; // save as above

///////////////////////////////////////////////
////    DHT SENSOR
///////////////////////////////////////////////
// REQUIRES the following Arduino libraries:
// - DHT Sensor Library: https://github.com/adafruit/DHT-sensor-library
// - Adafruit Unified Sensor Lib: https://github.com/adafruit/Adafruit_Sensor
#include "DHT.h"
#define DHTPIN 2
// Uncomment whatever type you're using!
//#define DHTTYPE DHT11   // DHT 11
//#define DHTTYPE DHT22   // DHT 22  (AM2302), AM2321
#define DHTTYPE DHT21   // DHT 21 (AM2301)
// Initialize DHT sensor.
DHT dht(DHTPIN, DHTTYPE);

///////////////////////////////////////////////
////    LOAD CELL
///////////////////////////////////////////////
#include <HX711_ADC.h>

unsigned long stabilizingtime = 5000; // tare preciscion can be improved by adding a few seconds of stabilizing time

//pins:
const int HX711_dout_1 = 4; //HX711 dout pin
const int HX711_sck_1 = 5; //HX711 sck pin

const int HX711_dout_2 = 6; //HX711 dout pin
const int HX711_sck_2 = 7; //HX711 sck pin

const int HX711_dout_3 = 8; //HX711 dout pin
const int HX711_sck_3 = 9; //HX711 sck pin

const int HX711_dout_4 = 10; //HX711 dout pin
const int HX711_sck_4 = 11; //HX711 sck pin

const int HX711_dout_5 = 12; //HX711 dout pin
const int HX711_sck_5 = 13; //HX711 sck pin

//HX711 constructor (dout pin, sck pin)
HX711_ADC LoadCell_1(HX711_dout_1, HX711_sck_1); //HX711 1
HX711_ADC LoadCell_2(HX711_dout_2, HX711_sck_2); //HX711 2
HX711_ADC LoadCell_3(HX711_dout_3, HX711_sck_3); //HX711 3
HX711_ADC LoadCell_4(HX711_dout_4, HX711_sck_4); //HX711 4
HX711_ADC LoadCell_5(HX711_dout_5, HX711_sck_5); //HX711 5

unsigned long t = 0;

///////////////////////////////////////////////
////    COMMAND HANDLER
///////////////////////////////////////////////
#include "CommandHandler.h"
CommandHandler<15> SerialCommandHandler;


/* Arrange your settings in this struct. Ensure that 'checksum' is the */
/* last item and is an unsigned int. Otherwise, do whatever you like. */
/* https://gitlab.com/snippets/1728275 */

struct meat_settings {
  float temperature_target;
  float temperature_variance;
  
  float humidity_target;
  float humidity_variance;

  float load_calibration_1;
  float load_calibration_2;
  float load_calibration_3;
  float load_calibration_4;
  float load_calibration_5;

  long tare_offset_1;
  long tare_offset_2;
  long tare_offset_3;
  long tare_offset_4;
  long tare_offset_5;

  int load_check_millis;
  int temphumidity_millis;
  
  float cycle_delay = 10*1000*60; //10 minutes

  void Reset() {
  temperature_target = 5;
  temperature_variance = 2;
  
  humidity_target = 80;
  humidity_variance = 4;

  load_calibration_1 = 250.055;
  load_calibration_2 = 250.055;
  load_calibration_3 = 250.055;
  load_calibration_4 = 250.055;
  load_calibration_5 = 250.055;

  tare_offset_1 = 8409015;
  tare_offset_2 = 8409015;
  tare_offset_3 = 8409015;
  tare_offset_4 = 8409015;
  tare_offset_5 = 8409015;

  load_check_millis = 60 * 60 * 1000;//every hour
  temphumidity_millis = 60 * 1000;//every minute
  
  cycle_delay = 10*1000*60; //10 minutes
  
}
  //unsigned int checksum;
};

///////////////////////////////////////////////
////    EEPROM
///////////////////////////////////////////////
#include "EEPROMStore.h"
EEPROMStore<meat_settings> settings;

///////////////////////////////////////////////
////    STATE STRUCT
///////////////////////////////////////////////
struct meat_state {
  float temperature;
  float humidity;
  
  boolean light;
  boolean cool;
  boolean heat;

  boolean humidify;
  boolean dehumidify;
  boolean airpump;
  boolean circulate;
  boolean isactive;
  float loadcells[5];

  boolean tareloadcell_1;
  boolean tareloadcell_2;
  boolean tareloadcell_3;
  boolean tareloadcell_4;
  boolean tareloadcell_5;

  boolean newdataloadcell_1;
  boolean newdataloadcell_2;
  boolean newdataloadcell_3;
  boolean newdataloadcell_4;
  boolean newdataloadcell_5;
};
/* 'state' has to be globally available, so declare it here */
meat_state state;


//Default State
void defaultState(){
  state.temperature = 0;
  state.humidity = 0;
  
  state.light = false;
  state.cool = false;
  state.heat = false;
  state.humidify = false;
  state.dehumidify = false;
  state.airpump = false;
  state.circulate = false;
  state.isactive = true;
  state.loadcells[0]  = 0;
  state.loadcells[1]  = 0;
  state.loadcells[2]  = 0;
  state.loadcells[3]  = 0;
  state.loadcells[4]  = 0;

  state.tareloadcell_1 = false;
  state.tareloadcell_2 = false;
  state.tareloadcell_3 = false;
  state.tareloadcell_4 = false;
  state.tareloadcell_5 = false;

  state.newdataloadcell_1 = false;
  state.newdataloadcell_2 = false;
  state.newdataloadcell_3 = false;
  state.newdataloadcell_4 = false;
  state.newdataloadcell_5 = false;
}

//Command handling

void Cmd_Unknown()
{
  // Allocate the JSON document
  StaticJsonDocument<200> JsonResponse;
  JsonResponse["success"] = false;
  JsonResponse["message"] = "I don't understand";
  serializeJsonPretty(JsonResponse, Serial);
}

void Cmd_Reset()
{
  resetFunc();  //call reset
}


void Cmd_Help(CommandParameter &Parameters)
{
  // Allocate the JSON document
  StaticJsonDocument<200> JsonResponse;
  JsonResponse["success"] = true;

  JsonObject commands  = JsonResponse.createNestedObject("commands");
  commands["!set temperaturetarget 10"] = "Sets the Target Temperature";
  commands["!set temperaturevariance 2"] = "Sets Target +/- Variance";
  commands["!set humiditytarget 75"] = "Sets the Target Humidity 0-100";
  commands["!set humidityvariance 5"] = "Sets the Humidity +/- % Variance 0-25";
  
  commands["!set light 0"] = "Sets the current light state, on[1] or off[0]";
  commands["!set cool 0"] = "Sets the current cool state, on[1] or off[0]";
  commands["!set heat 0"] = "Sets the current heat state, on[1] or off[0]";
  commands["!set humidify 0"] = "Sets the current humidify state, on[1] or off[0]";
  commands["!set dehumidify 0"] = "Sets the current dehumidify state, on[1] or off[0]";
  commands["!set airpump 0"] = "Sets the current airpump state, on[1] or off[0]";
  commands["!set circulate 0"] = "Sets the current circulate state, on[1] or off[0]";
  commands["!set isactive 0"] = "Sets the current isactive state, on[1] or off[0]";

  commands["!get light"] = "Gets the current light state, true or false";
  commands["!get cool"] = "Gets the current cool state, true or false";
  commands["!get heat"] = "Gets the current heat state, true or false";
  commands["!get humidify"] = "Gets the current humidify state, true or false";
  commands["!get dehumidify"] = "Gets the current dehumidify state, true or false";
  commands["!get airpump"] = "Gets the current airpump state, true or false";
  commands["!get circulate"] = "Gets the current circulate state, true or false";
  commands["!get isactive"] = "Gets the current isactive state, true or false";
  commands["!get resetbox"] = "Resets/Restarts the Box Controller";

  
//  SerialCommandHandler.AddCommand(F("get"), Cmd_Get);
//  SerialCommandHandler.AddCommand(F("set"), Cmd_Set);

  commands["!tareloadcell 1"] = "Tare's the given loadcell to Zero";
  commands["!calibrateloadcell 1 1000"] = "Calibrates the given loadcell with the given known mass, mass is in grams, i.e. calibrate loadcell 1 with 1000g";

  serializeJsonPretty(JsonResponse, Serial);
  Serial.println();
}

void Cmd_Set(CommandParameter &Parameters)
{
  // Allocate the JSON document
  StaticJsonDocument<200> JsonResponse;
  
  //Serial.println(Parameters.NextParameter());
  const char* service = Parameters.NextParameter();
  float setstate = atof(Parameters.NextParameter());
  
  #ifdef DEBUG
  Serial.print("CHECK->");
  Serial.println(service);
  #endif
  
  JsonResponse["success"] = true;

  if(strcmp(service, "temperaturetarget") == 0)
  {
      JsonResponse["message"] = "Temperature Target";

      #ifdef DEBUG
        Serial.println(setstate);
      #endif
      if (setstate > 0){
        settings.Data.temperature_target = setstate;
        JsonResponse["target_temp"] = settings.Data.temperature_target;
        settings.Save();
      }else{
        JsonResponse["success"] = false;
        JsonResponse["message"] = "Could Not Set New Temperature Target <= 0";
      }  
  }
  else if(strcmp(service, "settemperaturevariance") == 0)
  {
      JsonResponse["message"] = "Temperature Variance";

      #ifdef DEBUG
        Serial.println(setstate);
      #endif
      if (setstate > 0){
        settings.Data.temperature_variance = setstate;
        JsonResponse["temperature_variance"] = settings.Data.temperature_variance;
        settings.Save();
      }else{
        JsonResponse["success"] = false;
        JsonResponse["message"] = "Could Not Set New Temperature Variance <= 0";
      }  
  }
  else if(strcmp(service, "sethumiditytarget") == 0)
  {
      JsonResponse["message"] = "Humidity Target";

      #ifdef DEBUG
        Serial.println(setstate);
      #endif
      if (setstate > 0 && setstate <= 100){
        settings.Data.humidity_target = setstate;
        JsonResponse["humidity_target"] = settings.Data.humidity_target;
        settings.Save();
      }else{
        JsonResponse["success"] = false;
        JsonResponse["message"] = "Could Not Set New Humidity Target <= 0";
      }  
  }
  else if(strcmp(service, "sethumidityvariance") == 0)
  {
      JsonResponse["message"] = "Temperature Target";

      #ifdef DEBUG
        Serial.println(setstate);
      #endif
      if (setstate > 0 && setstate <= 25){ //should be enough
        settings.Data.humidity_variance = setstate;
        JsonResponse["target_temp"] = settings.Data.humidity_variance;
        settings.Save();
      }else{
        JsonResponse["success"] = false;
        JsonResponse["message"] = "Could Not Set New Humidity Variance <= 0";
      }  
  }
  else if(strcmp(service, "light") == 0)
  {
      JsonResponse["message"] = "Light";
      if (setstate == 1){
        state.light = true;
        digitalWrite( light_relayenable , LOW);
      }else if(setstate == 0){
        state.light = false;
        digitalWrite( light_relayenable , HIGH);
      }
      JsonResponse["light"] = state.light;
  }
  else if(strcmp(service, "cool") == 0)
  {
      JsonResponse["message"] = "Cool";
      if (setstate == 1){
        state.cool = true;
        digitalWrite( cool_relayenable , LOW);
      }else if(setstate == 0){
        state.cool = false;
        digitalWrite( cool_relayenable , HIGH);
      }
      JsonResponse["cool"] = state.cool;
  }
  else if(strcmp(service, "heat") == 0)
  {
      JsonResponse["message"] = "Heat";
      if (setstate == 1){
        state.light = true;
        digitalWrite( light_relayenable , LOW);
      }else if(setstate == 0){
        state.light = false;
        digitalWrite( light_relayenable , HIGH);
      }
      JsonResponse["heat"] = state.heat;
  }
  else if(strcmp(service, "humidify") == 0)
  {
      JsonResponse["message"] = "Humidify";
      if (setstate == 1){
        state.humidify = true;
        digitalWrite( humidify_relayenable , LOW);
      }else if(setstate == 0){
        state.humidify = false;
        digitalWrite( humidify_relayenable , HIGH);
      }
      JsonResponse["humidify"] = state.humidify;
  }
  else if(strcmp(service, "dehumidify") == 0)
  {
      JsonResponse["message"] = "Dehumidify";
      if (setstate == 1){
        state.dehumidify = true;
        digitalWrite( dehumidify_relayenable , LOW);
      }else if(setstate == 0){
        state.dehumidify = false;
        digitalWrite( dehumidify_relayenable , HIGH);
      }
      JsonResponse["dehumidify"] = state.dehumidify;
  }
  else if(strcmp(service, "airpump") == 0)
  {
      JsonResponse["message"] = "Airpump";
      if (setstate == 1){
        state.airpump = true;
        digitalWrite( airpump_relayenable , LOW);
      }else if(setstate == 0){
        state.airpump = false;
        digitalWrite( airpump_relayenable , HIGH);
      }
      JsonResponse["airpump"] = state.airpump;
  }
  else if(strcmp(service, "circulate") == 0)
  {
      JsonResponse["message"] = "Circulate";
      if (setstate == 1){
        state.circulate = true;
        digitalWrite( circulate_relayenable , LOW);
      }else if(setstate == 0){
        state.circulate = false;
        digitalWrite( circulate_relayenable , HIGH);
      }
      JsonResponse["circulate"] = state.circulate;
  }
  else if(strcmp(service, "isactive") == 0)
  {
      JsonResponse["message"] = "Isactive";
      if (setstate == 1){
        state.isactive = true;
      }else if(setstate == 0){
        state.isactive = false;
      }
      JsonResponse["isactive"] = state.isactive;
  }
  else
  {
      JsonResponse["success"] = false;
      JsonResponse["message"] = strcat ("No valid service specified: ", service);
  }
  
  serializeJsonPretty(JsonResponse, Serial);
  Serial.println();
}

void Cmd_Get(CommandParameter &Parameters)
{
  // Allocate the JSON document
  StaticJsonDocument<200> JsonResponse;
  
  //Serial.println(Parameters.NextParameter());
  const char* service = Parameters.NextParameter();
  Serial.print("CHECK->");
  Serial.println(service);

  JsonResponse["success"] = true;
  if (strcmp(service, "temperature") == 0)
  {
      JsonResponse["message"] = "Temperature";
      JsonResponse["temperature"] = state.temperature;
  }
  else if(strcmp(service, "humidity") == 0)
  {
      JsonResponse["message"] = "Humidity";
      JsonResponse["humidity"] = state.humidity;
  }
  else if(strcmp(service, "light") == 0)
  {
      JsonResponse["message"] = "Light";
      JsonResponse["light"] = state.light;
  }
  else if(strcmp(service, "cool") == 0)
  {
      JsonResponse["message"] = "Cool";
      JsonResponse["cool"] = state.cool;
  }
  else if(strcmp(service, "heat") == 0)
  {
      JsonResponse["message"] = "Heat";
      JsonResponse["heat"] = state.heat;
  }
  else if(strcmp(service, "humidify") == 0)
  {
      JsonResponse["message"] = "Humidify";
      JsonResponse["humidify"] = state.humidify;
  }
  else if(strcmp(service, "dehumidify") == 0)
  {
      JsonResponse["message"] = "Dehumidify";
      JsonResponse["dehumidify"] = state.dehumidify;
  }
  else if(strcmp(service, "airpump") == 0)
  {
      JsonResponse["message"] = "Airpump";
      JsonResponse["airpump"] = state.airpump;
  }
  else if(strcmp(service, "circulate") == 0)
  {
      JsonResponse["message"] = "Circulate";
      JsonResponse["circulate"] = state.circulate;
  }
  else if(strcmp(service, "isactive") == 0)
  {
      JsonResponse["message"] = "Isactive";
      JsonResponse["isactive"] = state.isactive;
  }
  else if(strcmp(service, "loadcells") == 0)
  {
      JsonResponse["message"] = "Loadcells";
      JsonArray data = JsonResponse.createNestedArray("loadcells");
      data.add(state.loadcells[0]);
      data.add(state.loadcells[1]);
      data.add(state.loadcells[2]);
      data.add(state.loadcells[3]);
      data.add(state.loadcells[4]);
  }
  else if(strcmp(service, "state") == 0)
  {
    JsonResponse["temperature"] = state.temperature;
    JsonResponse["humidity"] = state.humidity;
    JsonResponse["light"] = state.light;
    JsonResponse["cool"] = state.cool;
    JsonResponse["heat"] = state.heat;
    JsonResponse["humidify"] = state.humidify;
    JsonResponse["dehumidify"] = state.dehumidify;
    JsonResponse["airpump"] = state.airpump;
    JsonResponse["circulate"] = state.circulate;  
    JsonResponse["isactive"] = state.isactive;
    
    JsonArray data = JsonResponse.createNestedArray("loadcells");
    data.add(state.loadcells[0]);
    data.add(state.loadcells[1]);
    data.add(state.loadcells[2]);
    data.add(state.loadcells[3]);
    data.add(state.loadcells[4]);
  }
  else if(strcmp(service, "settings") == 0)
  {
    JsonResponse["temperature_target"] = settings.Data.temperature_target;
    JsonResponse["temperature_variance"] = settings.Data.temperature_variance;
    JsonResponse["humidity_target"] = settings.Data.humidity_target;
    JsonResponse["humidity_variance"] = settings.Data.humidity_variance;
    JsonResponse["cycle_delay"] = settings.Data.cycle_delay;
  
    JsonResponse["load_calibration_1"] = settings.Data.load_calibration_1;
    JsonResponse["load_calibration_2"] = settings.Data.load_calibration_2;
    JsonResponse["load_calibration_3"] = settings.Data.load_calibration_3;
    JsonResponse["load_calibration_4"] = settings.Data.load_calibration_4;
    JsonResponse["load_calibration_5"] = settings.Data.load_calibration_5;
    
    JsonResponse["tare_offset_1"] = settings.Data.tare_offset_1;
    JsonResponse["tare_offset_2"] = settings.Data.tare_offset_2;
    JsonResponse["tare_offset_3"] = settings.Data.tare_offset_3;
    JsonResponse["tare_offset_4"] = settings.Data.tare_offset_4;
    JsonResponse["tare_offset_5"] = settings.Data.tare_offset_5;
  }
  else
  {
      JsonResponse["success"] = false;
      JsonResponse["message"] = strcat ("No valid service specified: ", service);
  }
  
  serializeJsonPretty(JsonResponse, Serial);
  Serial.println();
}

void Cmd_TareLoadCell(CommandParameter &Parameters)
{
  int loadcelltotare = atoi(Parameters.NextParameter());
  
  // Allocate the JSON document
  StaticJsonDocument<200> JsonResponse;
  JsonResponse["success"] = true;
  JsonResponse["message"] = "Starting tare 1 loadcell: " + loadcelltotare;

  
  switch(loadcelltotare){
    case 1:
      LoadCell_1.tareNoDelay();
      state.tareloadcell_1 = true;
      break;
    case 2:
      LoadCell_2.tareNoDelay();
      state.tareloadcell_2 = true;
      break;
    case 3:
      LoadCell_3.tareNoDelay();
      state.tareloadcell_3 = true;
      break;
    case 4:
      LoadCell_4.tareNoDelay();
      state.tareloadcell_4 = true;
      break;
    case 5:
      LoadCell_5.tareNoDelay();
      state.tareloadcell_5 = true;
      break;
    default:
      JsonResponse["success"] = false;
      JsonResponse["message"] = "No valid loadcell specified: " + loadcelltotare;
      
  }
  
  serializeJsonPretty(JsonResponse, Serial);
}

//!calibrateloadcell 1 920\r\n (grams)
void Cmd_CalibrateLoadCell(CommandParameter &Parameters)
{
  int loadcelltocalibrate = atoi(Parameters.NextParameter());
  int known_mass = atoi(Parameters.NextParameter());
  
  // Allocate the JSON document
  StaticJsonDocument<200> JsonResponse;
  JsonResponse["success"] = true;
  String message = "Calibrated loadcell: " + loadcelltocalibrate;
  message.concat(" Known mass: ");
  message.concat(known_mass);
  JsonResponse["message"] = message;
  
  if (known_mass > 0 && known_mass < 8000 ){
    switch(loadcelltocalibrate){
      case 1:
        LoadCell_1.refreshDataSet();
        settings.Data.load_calibration_1 = LoadCell_1.getNewCalibration(known_mass);
        settings.Save();
        break;
      case 2:
        LoadCell_2.refreshDataSet();
        settings.Data.load_calibration_2 = LoadCell_2.getNewCalibration(known_mass);
        settings.Save();
        break;
      case 3:
        LoadCell_3.refreshDataSet();
        settings.Data.load_calibration_3 = LoadCell_3.getNewCalibration(known_mass);
        settings.Save();
        break;
      case 4:
        LoadCell_4.refreshDataSet();
        settings.Data.load_calibration_4 = LoadCell_4.getNewCalibration(known_mass);
        settings.Save();
        break;
      case 5:
        LoadCell_5.refreshDataSet();
        settings.Data.load_calibration_5 = LoadCell_5.getNewCalibration(known_mass);
        settings.Save();
        break;
      default:
        JsonResponse["success"] = false;
        JsonResponse["message"] = "No valid loadcell specified: " + loadcelltocalibrate;
        
    }
  }else{
    JsonResponse["message"] = "No valid known mass: " + known_mass;
  }
  
  serializeJsonPretty(JsonResponse, Serial);
}

bool CheckTempAndHumidity(void *) {
#ifdef DEBUG
  Serial.println("Checking Temp & Humidity");
#endif
  
  // Reading temperature or humidity takes about 250 milliseconds!
  // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
  float h = dht.readHumidity();
  // Read temperature as Celsius (the default)
  float t = dht.readTemperature();

  // Check if any reads failed and exit early (to try again).
  if (isnan(h) || isnan(t)) {
#ifdef DEBUG
    Serial.println(F("Failed to read from DHT sensor!"));
#endif
    return true;
  }else{
    state.temperature = t;
    state.humidity = h;
  }
  return true;//Returning true repeats the timer that called this
}

bool CheckLoadCells(void *) {
#ifdef DEBUG
  Serial.println("Checking Load Cells");
#endif

  //get smoothed value from data set
  if (state.newdataloadcell_1) {
      //state.loadcells[0] = LoadCell_1.getData();
      state.loadcells[0] = avgloadcell_1.reading(LoadCell_1.getData()); 
 #ifdef DEBUG
      Serial.print("Load_cell 1 output val: ");
      Serial.println(state.loadcells[0]);
 #endif
      state.newdataloadcell_1 = false;
  }
    if (state.newdataloadcell_2) {
      //state.loadcells[1] = LoadCell_2.getData();
      state.loadcells[1] = avgloadcell_2.reading(LoadCell_2.getData()); 
 #ifdef DEBUG
      Serial.print("Load_cell 2 output val: ");
      Serial.println(state.loadcells[1]);
 #endif
      state.newdataloadcell_2 = false;
  }
    if (state.newdataloadcell_3) {
      //state.loadcells[2] = LoadCell_3.getData();
      state.loadcells[2] = avgloadcell_3.reading(LoadCell_3.getData()); 
 #ifdef DEBUG
      Serial.print("Load_cell 3 output val: ");
      Serial.println(state.loadcells[2]);
 #endif
      state.newdataloadcell_3 = false;
  }
    if (state.newdataloadcell_4) {
      //state.loadcells[3] = LoadCell_4.getData();
      state.loadcells[3] = avgloadcell_4.reading(LoadCell_4.getData()); 
 #ifdef DEBUG
      Serial.print("Load_cell 4 output val: ");
      Serial.println(state.loadcells[3]);
 #endif
      state.newdataloadcell_4 = false;
  }
    if (state.newdataloadcell_5) {
      //state.loadcells[4] = LoadCell_5.getData();
      state.loadcells[4] = avgloadcell_5.reading(LoadCell_5.getData()); 
 #ifdef DEBUG
      Serial.print("Load_cell 5 output val: ");
      Serial.println(state.loadcells[4]);
 #endif
      state.newdataloadcell_5 = false;
  }
  
  return true;//Returning true repeats the timer that called this
}

//Setup & Loop
void setup() {
  Serial.begin(9600);
  while (!Serial) continue;
  Serial.println("Starting...");

  ///START TEMPERATURE & HUMIDITY SENSOR
  dht.begin();
  
  ///START TIMER TO CHECK TEMP & HUMIDITY
  timer.every(10 * 1000, CheckTempAndHumidity);

  ///START TIMER TO CHECK LOADCELLS
  timer.every(15 * 1000, CheckLoadCells);

  ///START TIMER TO ADJUST ENVIRONMENT
  timer.every(15 * 1000, CheckLoadCells);


  //CONFIGURE RELAYS - SET HIGH TO TURN OFF BEFORE SETTING TO OUTPUT
  digitalWrite( light_relayenable , HIGH);
  pinMode(light_relayenable, OUTPUT);
  digitalWrite( cool_relayenable , HIGH);
  pinMode(cool_relayenable, OUTPUT);
  digitalWrite( heat_relayenable , HIGH);
  pinMode(heat_relayenable, OUTPUT);
  digitalWrite( humidify_relayenable , HIGH);
  pinMode(humidify_relayenable, OUTPUT);
  digitalWrite( dehumidify_relayenable , HIGH);
  pinMode(dehumidify_relayenable, OUTPUT);
  digitalWrite( airpump_relayenable , HIGH);
  pinMode(airpump_relayenable, OUTPUT);
  digitalWrite( circulate_relayenable , HIGH);
  pinMode(circulate_relayenable, OUTPUT);

  ///START SETUP COMMAND HANDLER
  SerialCommandHandler.AddCommand(F("help"), Cmd_Help);
  SerialCommandHandler.AddCommand(F("get"), Cmd_Get);
  SerialCommandHandler.AddCommand(F("set"), Cmd_Set);
  //3
 
  SerialCommandHandler.AddCommand(F("tareloadcell"), Cmd_TareLoadCell);
  SerialCommandHandler.AddCommand(F("calibrateloadcell"), Cmd_CalibrateLoadCell);
  //5

  SerialCommandHandler.AddCommand(F("resetbox"), Cmd_Reset);
  SerialCommandHandler.SetDefaultHandler(Cmd_Unknown);
  //6
  ///END SETUP COMMAND HANDLER

  ///START LOAD CELL SETUP
  LoadCell_1.begin();
  LoadCell_2.begin();
  LoadCell_3.begin();
  LoadCell_4.begin();
  LoadCell_5.begin();
  //start the moving average objects
  avgloadcell_1.begin();
  avgloadcell_2.begin();
  avgloadcell_3.begin();
  avgloadcell_4.begin();
  avgloadcell_5.begin();
  

  boolean _tare = false; //set this to false if you don't want tare to be performed in the next step
  byte loadcell_1_rdy = 0;
  byte loadcell_2_rdy = 0;
  byte loadcell_3_rdy = 0;
  byte loadcell_4_rdy = 0;
  byte loadcell_5_rdy = 0;
  
  //delay(2000);
  while ((loadcell_1_rdy ) < 1) { // + loadcell_2_rdy + loadcell_3_rdy + loadcell_4_rdy + loadcell_5_rdy) < 1) { //run startup, stabilization and tare on all modules simultaniously
    if (!loadcell_1_rdy) loadcell_1_rdy = LoadCell_1.startMultiple(stabilizingtime, _tare);
    if (!loadcell_2_rdy) loadcell_2_rdy = LoadCell_2.startMultiple(stabilizingtime, _tare);
    if (!loadcell_3_rdy) loadcell_3_rdy = LoadCell_3.startMultiple(stabilizingtime, _tare);
    if (!loadcell_4_rdy) loadcell_4_rdy = LoadCell_4.startMultiple(stabilizingtime, _tare);
    if (!loadcell_5_rdy) loadcell_5_rdy = LoadCell_5.startMultiple(stabilizingtime, _tare);
  }
  //delay(10000);
  
  if (LoadCell_1.getTareTimeoutFlag()) {
    Serial.println("Timeout, check MCU>HX711 no.1 wiring and pin designations");
  }
  if (LoadCell_2.getTareTimeoutFlag()) {
    Serial.println("Timeout, check MCU>HX711 no.2 wiring and pin designations");
  }
  if (LoadCell_3.getTareTimeoutFlag()) {
    Serial.println("Timeout, check MCU>HX711 no.3 wiring and pin designations");
  }
  if (LoadCell_4.getTareTimeoutFlag()) {
    Serial.println("Timeout, check MCU>HX711 no.4 wiring and pin designations");
  }
  if (LoadCell_5.getTareTimeoutFlag()) {
    Serial.println("Timeout, check MCU>HX711 no.5 wiring and pin designations");
  }
  
  #ifdef DEBUG
  Serial.print("settings.Data.load_calibration_1: ");
  Serial.println(settings.Data.load_calibration_1);
  #endif
  
  LoadCell_1.setCalFactor(settings.Data.load_calibration_1); // user set calibration value (float)
  LoadCell_2.setCalFactor(settings.Data.load_calibration_2); // user set calibration value (float)
  LoadCell_3.setCalFactor(settings.Data.load_calibration_3); // user set calibration value (float)
  LoadCell_4.setCalFactor(settings.Data.load_calibration_4); // user set calibration value (float)
  LoadCell_5.setCalFactor(settings.Data.load_calibration_5); // user set calibration value (float)

  //need to set the tare offset based on the last tare before weight is applied so that our existing weight does not get Tare'd to 0
  LoadCell_1.setTareOffset( settings.Data.tare_offset_1 );
  LoadCell_2.setTareOffset( settings.Data.tare_offset_2 );
  LoadCell_3.setTareOffset( settings.Data.tare_offset_3 );
  LoadCell_4.setTareOffset( settings.Data.tare_offset_4 );
  LoadCell_5.setTareOffset( settings.Data.tare_offset_5 );
  ///END LOAD CELL SETUP

}

void loop() {
  //tick the timer
  timer.tick();
  
  // Check for serial commands and dispatch them.
  SerialCommandHandler.Process();

  if (state.tareloadcell_1){
    //check if last tare operation is complete
    if (LoadCell_1.getTareStatus() == true) {
      state.tareloadcell_1 = false;
      Serial.println("Tare load cell 1 complete");
      settings.Data.tare_offset_1 = LoadCell_1.getTareOffset();
      settings.Save();
      avgloadcell_1.reset();//reset the moving average object
    }
  }
  if (state.tareloadcell_2){
    //check if last tare operation is complete
    if (LoadCell_2.getTareStatus() == true) {
      state.tareloadcell_2 = false;
      Serial.println("Tare load cell 2 complete");
      settings.Data.tare_offset_2 = LoadCell_2.getTareOffset();
      settings.Save();
      avgloadcell_2.reset();//reset the moving average object
    }
  }
  if (state.tareloadcell_3){
    //check if last tare operation is complete
    if (LoadCell_3.getTareStatus() == true) {
      state.tareloadcell_3 = false;
      Serial.println("Tare load cell 3 complete");
      settings.Data.tare_offset_3 = LoadCell_3.getTareOffset();
      settings.Save();
      avgloadcell_3.reset();//reset the moving average object
    }
  }
  if (state.tareloadcell_4){
    //check if last tare operation is complete
    if (LoadCell_4.getTareStatus() == true) {
      state.tareloadcell_4 = false;
      Serial.println("Tare load cell 4 complete");
      settings.Data.tare_offset_4 = LoadCell_4.getTareOffset();
      settings.Save();
      avgloadcell_4.reset();//reset the moving average object
    }
  }
  if (state.tareloadcell_5){
    //check if last tare operation is complete
    if (LoadCell_5.getTareStatus() == true) {
      state.tareloadcell_5 = false;
      Serial.println("Tare load cell 5 complete");
      settings.Data.tare_offset_5 = LoadCell_5.getTareOffset();
      settings.Save();
      avgloadcell_5.reset();//reset the moving average object
    }
  }

// static boolean newDataReady = 0;
// const int serialPrintInterval = 15000; //increase value to slow down serial print activity
  
//We need to keep calling update to keep data fresh
if (LoadCell_1.update()) state.newdataloadcell_1 = true;
if (LoadCell_2.update()) state.newdataloadcell_2 = true;
if (LoadCell_3.update()) state.newdataloadcell_3 = true;
if (LoadCell_4.update()) state.newdataloadcell_4 = true;
if (LoadCell_5.update()) state.newdataloadcell_5 = true;

}
