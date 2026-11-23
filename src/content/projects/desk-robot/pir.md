---
title: Motion sensor (HC-SR501)
summary: The robot's second sense. A PIR sensor that notices when I walk into the room, so the robot can wake up and greet me.
keyFacts: ['Sees motion, not presence', 'Edge detection', 'Arduino Uno']
status: in-progress
parent: desk-robot
order: 2
year: 2026
started: 11 Nov 2026
lastUpdated: 23 Nov 2026
stack: [C/C++, Arduino]

hero:
  photo: /projects/desk-robot/pir.jpg
  photoCaption: The HC-SR501 wired straight to the Uno, one wire per pin. 15 Nov 2026

why: >-
  When I walk into the room, the robot should wake up and tell me what's left of my day. A PIR sensor is made for
  exactly that: it reacts to body heat moving across its view. It also taught me the difference between motion and
  presence, which is why the robot needs both this sensor and the distance sensor.

devlog:
  - date: 23 Nov 2026
    title: Working with the distance sensor
    short: 'Now on one Uno with the HC-SR04. It greets me only if I am not already at the desk.'
    text: >-
      The PIR now runs together with the distance sensor, with a 60 s warm-up in setup(). Sitting still at the
      desk, the PIR drops after its 15 s hold and the next small movement looked like someone walking in, so it
      kept saying "Welcome back!". Now it greets only when the distance sensor says I'm not already at the desk.
      More on the Desk Robot page.
  - date: 16 Nov 2026
    title: Schematic with my own symbol
    short: 'Drew the wiring in KiCad 10 with an HC-SR501 symbol I made myself. ERC clean.'
    text: >-
      KiCad has no symbol for the HC-SR501, so I made one in a project library: a box with three pins, VCC and GND
      as power inputs and OUT as an output. Then I drew the wiring, put no-connect flags on every unused Uno pin
      and ran the Electrical Rules Checker. It gave the same error as on the distance sensor, ground not driven,
      and the same PWR_FLAG fixed it.
  - date: 15 Nov 2026
    title: Tuning the two potentiometers
    short: 'Found which pot is which, set the hold time to about 15 s and learned what mode H does.'
    text: >-
      Found out which potentiometer is which: the right one sets the time, the left one the sensitivity. With the
      time at minimum (about 3 s) it said "Motion ended" while I was still moving, because small movements are not
      always seen. I set it to about 15 s with a phone stopwatch. Sitting in front of it, it said "Motion detected"
      and never "ended": my board is in mode H, so every small movement restarts the timer. That is the correct
      behaviour.
  - date: 15 Nov 2026
    title: Print only when something changes
    short: 'A lastMotion variable remembers the previous state, so it prints only when motion starts or ends.'
    key: true
    text: >-
      Instead of printing 0 or 1 five times a second, the sketch now remembers the previous state in lastMotion,
      declared outside loop() so it survives between loops. It prints "Motion detected" when the state goes from 0
      to 1 and "Motion ended" from 1 to 0, and nothing in between. The robot will need this everywhere: greet me
      once, not five times a second.
  - date: 11 Nov 2026
    title: First readings
    short: 'Wired it to D2 and read 0 or 1. The bugs: storing the pin number instead of the reading, and no warm-up.'
    text: >-
      Wired the sensor straight to the Uno: VCC to 5V, OUT to D2, GND to GND. The first sketch always printed 2,
      because I stored the pin number instead of the result of digitalRead(). After fixing that it only printed 0:
      the sensor needs about a minute after power-up to calibrate. After a reset and a minute of not moving, it
      printed 1 when I moved.

schematic: /projects/desk-robot/pir-wiring.svg

code: |
  const int PIR_PIN = 2;

  // Outside loop(), so it survives between loops
  int lastMotion = LOW;

  void loop()
  {
    int motion = digitalRead(PIR_PIN);

    // React only when the state changes
    if (motion != lastMotion)
    {
      if (motion == HIGH)
        Serial.println("Motion detected");
      else
        Serial.println("Motion ended");
      lastMotion = motion;
    }

    delay(200);  // 5 checks per second
  }

problem: >-
  Sitting right in front of it, the sensor said "Motion detected" and never "Motion ended", and with the time
  turned down it said "ended" while I was still moving.
lesson: >-
  A PIR sees motion, not presence. Someone sitting still is invisible to it, so the robot uses the PIR for
  "someone came in" and the distance sensor for "someone is at the desk".

progress: 85
steps:
  - label: Wire it and read 0 or 1
    state: done
    date: 11 Nov 2026
  - label: Print only when motion starts or ends
    state: done
    date: 15 Nov 2026
  - label: Tune time, sensitivity and mode
    state: done
    date: 15 Nov 2026
  - label: Schematic in KiCad 10, ERC clean
    state: done
    date: 16 Nov 2026
  - label: Handle the one-minute warm-up
    state: done
    date: 23 Nov 2026
  - label: Work together with the distance sensor
    state: done
    date: 23 Nov 2026
  - label: Test it in the room
    state: next

parts:
  - name: Arduino Uno R3 (clone)
    qty: ×1
  - name: HC-SR501 PIR motion sensor
    qty: ×1
  - name: Jumper wires (female-male)
    qty: ×3

github: https://github.com/Matei-Iliuta/desk-robot/tree/main/components/pir_motion
---
