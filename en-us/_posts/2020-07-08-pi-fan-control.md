---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- Raspberry Pi
- Linux
- Python
title: Automatic Fan Control System for Raspberry Pi
typora-root-url: ../
---

## An Attempt Without Full Understanding

Circuit design: Zero basics.

Python: Zero basics.

Simply copied from: [Aerandir14@Instructable Circuts](https://www.instructables.com/id/PWM-Regulated-Fan-Based-on-CPU-Temperature-for-Ras/).

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><em>This article follows the <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">CC-BY-NC-SA 4.0 license</a>.<em>

## Components

1. Raspberry Pi 4B×1
2. 5V Fan×1
3. Prototype Board×1
4. NPN Transistor 2N2222A×1
5. 1KΩ Resistor×1
6. Male-to-Female Jumper Wires×3

## Circuit Design

Circuit design as shown in the figure, all copied.

{% include post-image.html link="post-pi-fan/circut.jpg" alt="Circuit Design" %}

{% include post-image.html link="post-pi-fan/emulation.jpg" alt="Welding Guide" %}

## Final Product

During practical operation, I directly cut one male-to-female jumper wire into two parts, using the female end to connect to GPIO and the male end to connect to the fan's female end in mid-air.

{% include post-image.html link="post-pi-fan/final.jpg" alt="My Work" %}

## Usage

Using `calib.py` made by [Aerandir14@Instructable Circuts](https://www.instructables.com/id/PWM-Regulated-Fan-Based-on-CPU-Temperature-for-Ras/) to adjust the fan speed and understand the noise level at different speeds.

After `python calib.py`, the system will prompt to input the fan speed, then press Enter to confirm.

```python
#!/usr/bin/python
# -*- coding: utf-8 -*-

import RPi.GPIO as GPIO
import time
import sys
#import os

FAN_PIN = 21
WAIT_TIME = 1
PWM_FREQ = 25

GPIO.setmode(GPIO.BCM)
GPIO.setup(FAN_PIN, GPIO.OUT, initial=GPIO.LOW)

fan=GPIO.PWM(FAN_PIN,PWM_FREQ)
fan.start(0);
i = 0

hyst = 1
tempSteps = [50, 70]
speedSteps = [0, 100]
cpuTempOld=0

try:
    while 1:
        fanSpeed=float(input("Fan Speed: "))
        fan.ChangeDutyCycle(fanSpeed)


except(KeyboardInterrupt):
    print("Fan ctrl interrupted by keyboard")
    GPIO.cleanup()
    sys.exit()
```

Then, use `ctrl.py` made by [Aerandir14@Instructable Circuts](https://www.instructables.com/id/PWM-Regulated-Fan-Based-on-CPU-Temperature-for-Ras/) to control the fan speed. Adjust `tempSteps` and `speedSteps` to personal preference, then run `python ctrl.py`.

Each temperature in `tempSteps` corresponds to a speed in `speedSteps`. If the temperature falls between two settings, the required speed will be automatically calculated linearly.

```python
#!/usr/bin/python
# -*- coding: utf-8 -*-

import RPi.GPIO as GPIO
import time
import sys

# Configuration
FAN_PIN = 21  # BCM pin used to drive transistor's base
WAIT_TIME = 1  # [s] Time to wait between each refresh
FAN_MIN = 20  # [%] Fan minimum speed.
PWM_FREQ = 25  # [Hz] Change this value if fan has strange behavior

# Configurable temperature and fan speed steps
tempSteps = [45, 70]  # [°C]
speedSteps = [0, 100]  # [%]

# Fan speed will change only of the difference of temperature is higher than hysteresis
hyst = 1

# Setup GPIO pin
GPIO.setmode(GPIO.BCM)
GPIO.setup(FAN_PIN, GPIO.OUT, initial=GPIO.LOW)
fan = GPIO.PWM(FAN_PIN, PWM_FREQ)
fan.start(0)

i = 0
cpuTemp = 0
fanSpeed = 0
cpuTempOld = 0
fanSpeedOld = 0

# We must set a speed value for each temperature step
if len(speedSteps) != len(tempSteps):
    print("Numbers of temp steps and speed steps are different")
    exit(0)

try:
    while 1:
        # Read CPU temperature
        cpuTempFile = open("/sys/class/thermal/thermal_zone0/temp", "r")
        cpuTemp = float(cpuTempFile.read()) / 1000
        cpuTempFile.close()

        # Calculate desired fan speed
        if abs(cpuTemp - cpuTempOld) > hyst:
            # Below first value, fan will run at min speed.
            if cpuTemp < tempSteps[0]:
                fanSpeed = speedSteps[0]
            # Above last value, fan will run at max speed
            elif cpuTemp >= tempSteps[len(tempSteps) - 1]:
                fanSpeed = speedSteps[len(tempSteps) - 1]
            # If temperature is between 2 steps, fan speed is calculated by linear interpolation
            else:
                for i in range(0, len(tempSteps) - 1):
                    if (cpuTemp >= tempSteps[i]) and (cpuTemp < tempSteps[i + 1]):
                        fanSpeed = round((speedSteps[i + 1] - speedSteps[i])
                                         / (tempSteps[i + 1] - tempSteps[i])
                                         * (cpuTemp - tempSteps[i])
                                         + speedSteps[i], 1)

            if fanSpeed != fanSpeedOld:
                if (fanSpeed != fanSpeedOld
                        and (fanSpeed >= FAN_MIN or fanSpeed == 0)):
                    fan.ChangeDutyCycle(fanSpeed)
                    fanSpeedOld = fanSpeed
            cpuTempOld = cpuTemp

        # Wait until next refresh
        time.sleep(WAIT_TIME)


# If a keyboard interrupt occurs (ctrl + c), the GPIO is set to 0 and the program exits.
except KeyboardInterrupt:
    print("Fan ctrl interrupted by keyboard")
    GPIO.cleanup()
    sys.exit()
```

## Automatic Running

After testing, configure systemd for background running. Modify `/etc/systemd/system/fanctrl.service`.

```bash
[Unit]
Description=PWM Fan Control
After=mediacenter.service

[Service]
Type=simple
User=root
ExecStart= /usr/bin/python <path to ctrl.py>
Restart=always

[Install]
WantedBy=default.target
```

Then use `systemctl` to start the service.

```bash
sudo systemctl daemon-reload
sudo systemctl enable fanctrl
sudo systemctl start fanctrl
```

## All Done

If you, like me, can't stand temperatures above 50 degrees; if you, like me, think the fan provided by the store is too noisy, then try making one yourself! Let the fan no longer disturb the security guard downstairs. May the world be free from noise.
