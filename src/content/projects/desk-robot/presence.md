---
title: Presence (PIR + HC-SR04)
summary: The first two parts working together. The robot greets me when I walk in and knows when I sit down at the desk or leave it.
keyFacts: ['First integration', 'Two sensors helping each other', 'Arduino Uno']
status: in-progress
parent: desk-robot
kind: integration
order: 3
year: 2026
started: 23 Nov 2026
lastUpdated: 23 Nov 2026
stack: [C/C++, Arduino]

hero:
  photo: /projects/desk-robot/presence.jpg
  photoCaption: Both sensors on one Uno, powered from the breadboard rails. 23 Nov 2026

why: >-
  Each sensor worked on its own, but the robot needs to know three things about me at once: that I walked into the
  room, that I sat down at the desk and that I left it. This is the first time two parts share one sketch, and it
  turned out they need each other.

devlog:
  - date: 23 Nov 2026
    title: Greet me only if I am not at the desk
    short: 'The PIR kept saying "Welcome back!" while I was typing. Now the distance sensor decides.'
    key: true
    text: >-
      Sitting still at the desk, the PIR drops after its 15 s hold, and the next small movement looked like someone
      walking in, so it kept saying "Welcome back!" while I was typing. Now it greets only when the motion starts
      and the distance sensor says I'm not already at the desk: motion == HIGH && !lastAtDesk. Walking in, sitting
      down, leaving and typing at the desk all give the right message, once.
  - date: 23 Nov 2026
    title: A loose wire that looked like a bug
    short: 'Nothing worked through the breadboard, then a constant 0.9 cm. Rewired from zero, one sensor at a time.'
    text: >-
      After "Ready" nothing happened: a debug line showed the PIR always at 0 and the distance always at -1, so
      neither sensor had power through the breadboard. I rewired everything from zero, one sensor at a time, testing
      after each. Then the distance was stuck at about 0.9 cm, which is impossible because the HC-SR04 starts at about
      2 cm. My old distance sketch worked with the same wires, and after checking the wiring the combined sketch did
      too. Most likely a wire that wasn't pushed in all the way.
  - date: 23 Nov 2026
    title: Both sensors on one Uno
    short: 'Both sensors on the breadboard rails, same pins as before, edge detection on both.'
    text: >-
      The Uno has only one 5V pin, so its 5V and GND go to the breadboard rails and both sensors take power from
      there. Same pins as in the single sketches: PIR on D2, HC-SR04 Trig on D8 and Echo on D7. The desk part uses
      the same idea as the PIR, a lastAtDesk variable outside loop(), and a message only when the state changes. "At
      the desk" means a valid reading closer than 50 cm. A 60 s warm-up in setup() lets the PIR calibrate. I also
      wrote if (atDesk = true) at first, which assigns instead of comparing, so it was always true.

schematicPlaceholder: '[Wiring schematic in KiCad, coming soon]'

code: |
  // PIR: did someone just walk in?
  // Greet only if I am NOT already at the desk
  int motion = digitalRead(PIR_PIN);
  if (motion != lastMotion)
  {
    if (motion == HIGH && !lastAtDesk)
      Serial.println("Welcome back!");
    lastMotion = motion;
  }

  // HC-SR04: am I at the desk?
  float d = medianDistance();
  bool atDesk = (d != -1 && d < DESK_DISTANCE);
  if (atDesk != lastAtDesk)
  {
    if (atDesk)
      Serial.println("You sat down");
    else
      Serial.println("You left the desk");
    lastAtDesk = atDesk;
  }

problem: >-
  Two sensors and a breadboard full of wires: when nothing worked, I couldn't tell if it was the code, the wiring or
  one of the sensors. A loose wire gave a reading that looked exactly like a bug in the code.
lesson: >-
  Check the hardware first, one piece at a time, with a sketch I know works. And two sensors together can fix each
  other's blind spots: the distance sensor stops the PIR from greeting me while I'm already sitting there.

progress: 70
steps:
  - label: Both sensors on the breadboard rails
    state: done
    date: 23 Nov 2026
  - label: Detect sitting down and leaving the desk
    state: done
    date: 23 Nov 2026
  - label: 60 s warm-up for the PIR
    state: done
    date: 23 Nov 2026
  - label: Greet only if I am not at the desk
    state: done
    date: 23 Nov 2026
  - label: Photo of the setup
    state: done
    date: 23 Nov 2026
  - label: Schematic in KiCad
    state: next
  - label: millis() instead of delay()
    state: next

parts:
  - name: Arduino Uno R3 (clone)
    qty: ×1
  - name: HC-SR501 PIR motion sensor
    qty: ×1
  - name: HC-SR04 distance sensor
    qty: ×1
  - name: Breadboard
    qty: ×1

github: https://github.com/Matei-Iliuta/desk-robot/tree/main/integrations/presence
---
