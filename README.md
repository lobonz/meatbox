# meatbox
A control system for a salumi/charcuteri/koji ageing/growing environment which runs on a Raspberry Pi 4

## WARNING
Currently not fully working, partial gui functional, basic logging.
### TODO
- [x] Basic Client/Server
- [x] Basic UI
- [x] Chamber simulator to simulate sensor data
- [x] Graphing data
- [ ] Add indicators and switches to control and show state of sensors
- [ ] Implement logic to control the chamber environment automatically within the desired parameters
- [ ] Integrate Sensors
- [ ] Integrate Relays
- [ ] Integrate Camera
- [ ] Track items within the chamber for time and weight
- [ ] Notifications for when things are ready or go awry
- [ ] other things I think of

## NOTE
I'm hacking this together from various tutorials, I am not a programmer by trade so there is likely many things that are not done correctly but always willing to learn.
Uses Mongo DB Express and Vue 2

## client
Front end PWA to interact and control the meatbox

## server
API backend for the interface and controller to check the various sensors

## chamber
A virtual chamber, a server which acts like an insulated chamber which can be heated and cooled, humidified and dehumidified, etc.

## Screenshots Web UI
<img src="https://raw.githubusercontent.com/lobonz/meatbox/main/about/210317Screenshot_1.PNG" width="300" >
<img src="https://raw.githubusercontent.com/lobonz/meatbox/main/about/210317Screenshot_2.PNG" width="300" >

