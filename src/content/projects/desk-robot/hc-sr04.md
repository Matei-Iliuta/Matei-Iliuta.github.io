---
title: Distance sensor (HC-SR04)
summary: The robot's first sense. An ultrasonic sensor that measures how far away I am, read by an Arduino Uno.
keyFacts: ['Ultrasonic echo', 'Median of 5', 'Arduino Uno']
status: in-progress
parent: desk-robot
order: 1
year: 2026
started: 6 Nov 2026
lastUpdated: 9 Nov 2026
stack: [C/C++, Arduino]

hero:
  photo: /projects/desk-robot/hc-sr04.jpg
  photoCaption: The HC-SR04 on the breadboard, wired to the Uno. 6 Nov 2026

why: >-
  The robot has to notice when someone sits down in front of it, so it can turn its head towards them. Waking up when I walk into the room is the motion sensor's job. The HC-SR04
  is the simplest way to measure distance, and it teaches something every sensor needs: timing a signal precisely.

devlog:
  - date: 9 Nov 2026
    title: '"Too close!" under 10 cm'
    short: 'A warning under 10 cm, checked only for real distances, because the no-echo value -1 is also below 10.'
    text: >-
      A named constant, TOO_CLOSE_CM, and one if that prints "Too close!" when something is nearer than 10 cm.
      Tested with my hand: the warning shows up under 10 cm and disappears above. The check sits inside the else,
      after the "Out of range" case, because the no-echo value is -1 and -1 is also smaller than 10.
  - date: 9 Nov 2026
    title: My own schematic in KiCad 10
    short: 'Redrew the wiring in KiCad 10 and fixed it until the rules checker showed 0 errors.'
    text: >-
      Redrew the wiring in KiCad 10 and ran the Electrical Rules Checker until it came back clean. Every unused
      Arduino pin got a no-connect flag, and a PWR_FLAG tells KiCad that ground is driven from USB. I first put a
      flag on +5V too and got an error: the Uno's 5V pin is already a power output, so two sources were fighting
      on the same net.
  - date: 6 Nov 2026
    title: Median of 5 readings
    short: 'Each value is the median of five readings, so single spikes and lost echoes get ignored.'
    key: true
    text: >-
      Every printed value is now the median of five readings, 60 ms apart so a late echo can't mix into the next
      one. A bubble sort puts them in order and the middle one wins, so spikes and lost echoes end up at the edges
      and get ignored. With readings of 20.1, 20.3, 87.5, 20.2 and 0 cm, the average says 29.6 cm, the median says
      20.2 cm.
  - date: 6 Nov 2026
    title: The measurement in its own function
    short: 'Moved the measurement into measureDistance() and learned scope the hard way.'
    text: >-
      Moved the trigger pulse, the timing and the maths into measureDistance(), which returns the distance in
      centimetres or -1 when no echo comes back. Moving code around taught me scope the hard way: duration
      only exists inside the function, and a constant can only be declared once.
  - date: 6 Nov 2026
    title: The spikes came from the desk
    short: 'The random spikes were echoes from the desk, not the code. Raising the sensor fixed them.'
    key: true
    text: >-
      With an object standing still, some readings were wildly wrong and some said "Out of range". The code was
      fine: the sound cone hit the desk next to the sensor and the reflections came back first. Raising the sensor
      off the desk made the spikes disappear. Fix the physical cause first, then filter in software.
  - date: 6 Nov 2026
    title: First readings
    short: 'Wired it up, moved Trig and Echo to D8 and D7 to keep the PWM pins free, and fixed the first typos.'
    text: >-
      Wired it on a breadboard, first on D9/D10, then moved Trig and Echo to D8 and D7 so the PWM pins stay free
      for the servos later. A 10 µs pulse on Trig starts a measurement and pulseIn() times how long Echo stays high,
      with a 30 ms timeout so it never waits forever. distance = time × 0.0343 / 2, because the sound goes there
      and back. The first errors were typos (pulseIN, prinIn) and a wire that didn't match the pin in the code.

schematic: /projects/desk-robot/hc-sr04-wiring.svg

code: |
  const int TRIG_PIN = 8;
  const int ECHO_PIN = 7;

  // One measurement: cm, or -1 if no echo came back
  float measureDistance()
  {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    // 10 µs HIGH on Trig = "measure now"
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    // Round trip in µs, 30 ms timeout
    unsigned long duration =
        pulseIn(ECHO_PIN, HIGH, 30000);

    if (duration == 0)
    {
      return -1;  // a real distance is never negative
    }
    return duration * 0.0343 / 2;
  }

  // loop(): 5 readings, bubble sort, take the middle
  float d = readings[2];  // the median

problem: The readings jumped by tens of centimetres at random, even with nothing moving in front of the sensor.
lesson: >-
  Check the physical setup before the code. The sensor was too close to the desk, and the desk was answering
  before I was.

progress: 75
steps:
  - label: Wire it and read on Serial
    state: done
    date: 6 Nov 2026
  - label: Find where the spikes come from
    state: done
    date: 6 Nov 2026
  - label: measureDistance() function
    state: done
    date: 6 Nov 2026
  - label: Median filter of 5 readings
    state: done
    date: 6 Nov 2026
  - label: Schematic in KiCad 10, ERC clean
    state: done
    date: 9 Nov 2026
  - label: '"Too close!" warning under 10 cm'
    state: done
    date: 9 Nov 2026
  - label: Ruler test at 10, 20 and 50 cm
    state: doing
  - label: Add it to the robot firmware
    state: next

parts:
  - name: Arduino Uno R3 (clone)
    qty: ×1
  - name: HC-SR04 ultrasonic sensor
    qty: ×1
  - name: Breadboard
    qty: ×1
  - name: Jumper wires (male-male)
    qty: ×4

github: '[GitHub link]'
---
