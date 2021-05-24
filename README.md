<img src="https://github.com/lobonz/meatbox/blob/main/client/public/img/icons/android-chrome-512x512.png" width="128" >

# meatbox
A control system for a salumi/charcuteri/koji ageing/growing environment which runs on a Raspberry Pi 4

## WARNING
Currently not fully working, partial gui functional, basic logging.
### TODO
- [x] Basic Client/Server
- [x] Basic UI
- [x] Chamber simulator to simulate sensor data
- [x] Graphing data
- [ ] Arduino Controllbox - to monitor sensors and keep the environment within set points
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
Uses Mongo DB Express and Vue 2, Arduino Mega

## client
Front end PWA to interact and control the meatbox

## server
API backend for the interface and controller to check the various sensors

## chamber
A virtual chamber, a server which acts like an insulated chamber which can be heated and cooled, humidified and dehumidified, etc.

## controllbox
Arduino code to measure sensors and control relays to keep the meatbox environment within setpoints.
<img src="https://github.com/lobonz/meatbox/blob/main/controllbox/fritzing/controlbox_bb.png" width="700" >

## Screenshots Web UI
UI on iPhone 6s | UI with menu Open
------------ | -------------
<img src="https://raw.githubusercontent.com/lobonz/meatbox/main/about/210317Screenshot_1.PNG" width="300" >|<img src="https://raw.githubusercontent.com/lobonz/meatbox/main/about/210317Screenshot_2.PNG" width="300" >

## Installation Notes
These relate to Ubuntu 64bit OS for Raspberry Pi OR the development 64bit Raspberry PI OS
64 Bit OS was required to get the latest features in MongoDB

### Install OS
[https://ubuntu.com/tutorials/how-to-install-ubuntu-on-your-raspberry-pi#1-overview](https://ubuntu.com/tutorials/how-to-install-ubuntu-on-your-raspberry-pi#1-overview)  
OR use the OS image for Raspbery PI 64bit development version from here  
https://downloads.raspberrypi.org/raspios_lite_arm64/images/raspios_lite_arm64-2021-04-09/

### update default username and home directory
If you dont want the default user to be pi, then you can change it to meatbox :)  
https://thepihut.com/blogs/raspberry-pi-tutorials/how-to-change-the-default-account-username-and-password

### Install Mongo
[https://pimylifeup.com/mongodb-raspberry-pi/](https://pimylifeup.com/mongodb-raspberry-pi/)

### Install Node
[https://linuxize.com/post/how-to-install-node-js-on-raspberry-pi/](https://linuxize.com/post/how-to-install-node-js-on-raspberry-pi/)

### Install nginx
sudo apt install nginx

### Clone the Meatbox repo
Im installing as user meatbox in /home/meatbox, modify to suit where you install  
meatbox@meatbox:~/meatbox $ git clone https://github.com/lobonz/meatbox.git

#### update node modules for the client
meatbox@meatbox:~/meatbox/client $ npm update

### build the client
npm run build

#### update node modules for the client
meatbox@meatbox:~/meatbox/server $ npm update

### Configure the nginx webserver
Added these lines, commenting out any existing matching directives.   
```
root /home/meatbox/meatbox/client/dist;
index index.html
access_log /var/log/nginx/meatbox.access;
error_log /var/log/nginx/meatbox.error error;
```
### Install pm2
[https://pm2.keymetrics.io/docs/usage/quick-start/](https://pm2.keymetrics.io/docs/usage/quick-start/)

#### Start Server with PM2
```
meatbox@meatbox:~/meatbox/server $ pm2 start server.js --watch --name meatbox
```

#### Generate Startup Command - and follow instructions
```
meatbox@meatbox:~/meatbox $ pm2 startup
```

#### You should set the mongo admin password if you want - My meatbox is not online so not worried about security.

#### Make Database - using the mongo commandline
```
meatbox@meatbox:~/meatbox $ mongo
> use meatbox
switched to db meatbox
```

#### Make a user to access the meatbox database
```
meatbox@meatbox:~/meatbox $ mongo
> use admin
switched to db admin
> db.createUser(
...   {
...     user: "meat",
...     pwd: "charcoal",
...     roles: [ { role: "readWrite", db: "meatbox" } ]
...   }
... );

```

### Enabling non-root access to the GPIO pins
```bash
sudo apt install rpi.gpio-common
sudo adduser "${USER}" dialout
sudo reboot
```
Thanks to Chris L8's answer here
[https://askubuntu.com/questions/1230947/gpio-for-raspberry-pi-gpio-group](https://askubuntu.com/questions/1230947/gpio-for-raspberry-pi-gpio-group)

Then we can use https://www.npmjs.com/package/node-dht-sensor as a normal user by adding them to the dialout group.
