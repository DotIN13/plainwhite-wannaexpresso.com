---
layout: post
title: "树莓派自动风扇控制系统"
subtitle: "Raspberry Pi Fan Control"
author: "DotIN13"
tags:
  - Raspberry Pi
  - Linux
  - Python
typora-root-url: ../
locale: zh_CN
---

## 一次不求甚解的尝试

电路设计：零基础。

Python：零基础。

照抄：[Aerandir14@Instructable Circuts](https://www.instructables.com/id/PWM-Regulated-Fan-Based-on-CPU-Temperature-for-Ras/)。

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><em>本文遵循<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">CC-BY-NC-SA 4.0证书</a>.<em>

## 材料

1. Raspberry Pi 4B×1
2. 5V风扇×1
3. 实验板×1
4. NPN三极管2N2222A×1
5. 1KΩ电阻×1
6. 公对母杜邦线×3

## 电路设计

电路设计如图，全部照抄。

{% include post-image.html link="post-pi-fan/circut.jpg" alt="Circut Design" %}

{% include post-image.html link="post-pi-fan/emulation.jpg" alt="Weld Guide" %}

## 成品

我在实际操作的时候，直接将公对母杜邦线一剪为二，母头用于连接GPIO，公头用于和风扇自带的母头空中对接。

{% include post-image.html link="post-pi-fan/final.jpg" alt="My Work" %}

## 使用

使用[Aerandir14@Instructable Circuts](https://www.instructables.com/id/PWM-Regulated-Fan-Based-on-CPU-Temperature-for-Ras/)制作的`calib.py`，尝试调整风扇转速，了解风扇不同转速下的噪音情况。

`python calib.py`之后，系统会提示输入风扇速度，回车确认。

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

然后使用[Aerandir14@Instructable Circuts](https://www.instructables.com/id/PWM-Regulated-Fan-Based-on-CPU-Temperature-for-Ras/)制作的`ctrl.py`控制风扇转速，依照自身喜好调节`tempSteps`与`speedSteps`之后使用`python ctrl.py`运行。

`tempSteps`中的每一个温度对应一个`speedSteps`的速度，如果温度介于两个设定之间，将会自动线性计算需要的转速。

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

## 自动运行

测试完毕，使用systemd配置后台运行。修改`/etc/systemd/system/fanctrl.service`。

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

然后使用systemctl三件套启动服务。

```bash
sudo systemctl daemon-reload
sudo systemctl enable fanctrl
sudo systemctl start fanctrl
```

## 大功告成

如果你和我一样是个温控强迫症，温度超过50度就感觉要崩溃；如果你和我一样，觉得店家附赠的风扇太吵，那么就来尝试动手制作吧！让风扇再也不会吵到楼下保安。愿世界再也没有噪音。