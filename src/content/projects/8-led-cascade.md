---
title: 8-LED Cascade
summary: Eight hand-soldered LEDs on an Arduino, lighting up one after another. My first soldering project, built at TechForge, the IT & Robotics Club at ETTI.
keyFacts: ['8 LEDs, all working', '1 solder bridge fixed', 'Hand-soldered']
status: completed
order: 1
year: 2026
started: 11 Oct 2026
finished: 16 Oct 2026
duration: 6 days
lastUpdated: 16 Oct 2026
stack: [C/C++, Arduino, Soldering]

hero:
  photo: /projects/8-led-cascade/hero.jpg
  photo2: /projects/8-led-cascade/wiring.jpg
  photo2Alt: The board wired to an Arduino through a breadboard
  photoCaption: The finished board at ETTI, and wired to the Arduino. 16 Oct 2026

result: >-
  A hand-soldered board with 8 LEDs that light up one after another from an Arduino. All eight channels work
  after tracking down a solder bridge that was shorting LED 8 to ground.

why: >-
  After blinking my first LED on an Arduino, I wanted to build a circuit with my own hands instead of just plugging
  parts into a breadboard. The TechForge soldering session was the chance: something small but real that I could
  draw, solder, wire and program end to end, and learn to debug when it didn't work the first time.

finalEntry:
  date: 16 Oct 2026
  title: Final check, project done
  text: >-
    Went over the board one last time: a continuity test on all eight channels (no shorts to GND),
    then ran the cascade for a few minutes. All eight LEDs light up in order and switch off in order.
    First hardware project finished, with one real bug found and fixed along the way.
  short: 'A continuity test on every channel, then the cascade ran for minutes. All eight LEDs work.'

metrics:
  - value: 8 / 8
    label: LEDs working
  - value: '1'
    label: solder bridge found and fixed
  - value: ~9 mA
    label: per LED (220 Ω at 5 V)

devlog:
  - date: 15 Oct 2026
    title: 'Found it: all 8 light up'
    short: 'The continuity test beeped: the ground bus touched LED 8''s joint. I pulled the solder bridge apart and all eight LEDs lit up.'
    key: true
    text: >-
      The suspect was right. With the Arduino unplugged, the continuity test beeped between the GND pin and LED 8's
      resistor-LED joint: the ground bus was touching it, so LED 8 was shorted to ground. I heated the spot and pulled
      the extra solder away until the two were separate, checked again (no beep), then plugged the Arduino back in.
      All eight LEDs now light up in the cascade. First real hardware bug, found by reasoning about where the current goes.
  - date: 15 Oct 2026
    title: 'Main suspect: a solder bridge'
    short: 'The thick ground bus seemed to touch LED 8''s resistor joint, so the current skipped the LED and went straight to GND.'
    key: true
    text: >-
      Looking at the back again, the top end of the thick ground bus seems to touch the joint where LED 8's resistor meets the LED.
      If it does, that point sits at GND, so the current takes the easy path (pin → 220 Ω → GND) and never goes through the LED.
      That would explain why only LED 8 is dark while the pin and the code are fine. The other channels don't have the bus that close.
      Next: a continuity test with the Arduino unplugged (GND pin vs. that joint should not beep; LED 7 as the reference),
      then pull the bridge apart with the iron or some desoldering wick and test again before powering up.
      A short through 220 Ω is only about 23 mA, so nothing should be damaged.
  - date: 14 Oct 2026
    title: The 8th LED stays dark
    short: 'Seven LEDs lit in order and the eighth stayed dark, so the fault had to be in that one channel.'
    key: true
    text: >-
      Powered up and ran the cascade: seven LEDs light one after another, the top one stays dark.
      Since the other seven work, the code loop and the shared ground are fine, so the fault is in that one channel.
      Next checks, in order: the solder joint on its header pin and resistor, whether the LED went in backwards
      (long leg to the resistor), the jumper wire on the breadboard, and the pin number in the code.
    photo:
      src: /projects/8-led-cascade/lit.jpg
      webp: /projects/8-led-cascade/lit.webp
      width: 901
      height: 1600
      alt: Seven of the eight LEDs lit on the perfboard, the top one dark
      caption: 7 of 8 lit. The top one is LED 8.
  - date: 14 Oct 2026
    title: Wired to the Arduino
    short: 'Eight pins and one GND wire through a breadboard. It worked, but the jumper wires became a small nest.'
    text: >-
      Connected the board to an Arduino Uno-compatible board through a breadboard:
      eight digital pins go to the eight signal header pins, and one wire goes from the Arduino's GND to the ground pin.
      It works, but the jumper wires turned into a small nest, which makes it harder to trace a single channel when something is off.
  - date: 13 Oct 2026
    title: One shared ground, on the back
    short: 'Soldered the header pins and joined all eight cathodes into one ground bus on the back. Messy, but it conducts.'
    text: >-
      Day two: soldered a row of 9 header pins (8 signals + GND), the red ones the jumper wires plug into.
      On the back, every LED's cathode is joined into one solder bus that runs down to the GND header pin,
      so all eight LEDs share a single ground. Each resistor leg is bent over and soldered straight onto its LED's leg,
      no extra wire needed. Honestly, the soldering is a bit messy: the ground bus is a thick, lumpy bead
      and a few joints have too much solder. It holds and conducts, but next time I want smaller, cleaner joints.
    photo:
      src: /projects/8-led-cascade/back.jpg
      webp: /projects/8-led-cascade/back.webp
      width: 1600
      height: 1200
      alt: Back of the perfboard with the header pin joints and a thick solder bus joining the LED cathodes to ground
      caption: The ground bus on the right. Messy, but it holds.
  - date: 12 Oct 2026
    title: All 8 LEDs soldered
    short: 'My first soldering job: eight LEDs, each with its own 220 Ω resistor, about 9 mA each.'
    text: >-
      First soldering job, at the TechForge lab. On a perfboard: a 220 Ω resistor for each LED,
      and 8 LEDs alternating blue and green. Iron at about 350 °C.
      With 5 V from a pin and roughly 3 V across a blue or green LED, each one draws about (5 − 3) / 220 ≈ 9 mA,
      comfortably under what an Arduino pin can give.
    photo:
      src: /projects/8-led-cascade/front.jpg
      webp: /projects/8-led-cascade/front.webp
      width: 901
      height: 1600
      alt: Front of the perfboard with header pins, eight resistors and alternating blue and green LEDs, soldering station behind
      caption: Fresh off the iron, TechForge lab.
  - date: 11 Oct 2026
    title: Schematic first
    short: 'Drew the circuit before soldering: eight identical pin → 220 Ω → LED channels on one shared ground.'
    text: >-
      Before touching the iron I drew the circuit: each Arduino pin (Pin 1 to Pin 8) goes through its own 220 Ω resistor
      to one LED, and all the cathodes meet on a common GND. Eight identical channels, one shared ground.

schematic: /projects/8-led-cascade/schematic.svg

code: |
  // 8-LED cascade: on one by one, then off in order.
  // LED 1 on pin 2 ... LED 8 on pin 9
  const int leds[8] = {2, 3, 4, 5, 6, 7, 8, 9};
  const int STEP_MS = 100;  // ms between two LEDs

  void setup() {
    for (int i = 0; i < 8; i++) {
      pinMode(leds[i], OUTPUT);
    }
  }

  void loop() {
    for (int i = 0; i < 8; i++) {  // fill up
      digitalWrite(leds[i], HIGH);
      delay(STEP_MS);
    }
    for (int i = 0; i < 8; i++) {  // empty out
      digitalWrite(leds[i], LOW);
      delay(STEP_MS);
    }
  }

problem: 'LED 8 stayed dark while the other seven lit up. The messy ground bus was touching the joint between its resistor and the LED (a solder bridge), so the LED was shorted to GND. Found with a continuity test and fixed by removing the extra solder.'
lesson: 'Use less solder, keep the ground bus clear of the other joints, and run a continuity check on every channel before the first power-up.' 

progress: 100
steps:
  - label: Draw the schematic
    state: done
    date: 11 Oct 2026
  - label: Solder the LEDs and resistors
    state: done
    date: 12 Oct 2026
  - label: Solder the header pins and ground bus
    state: done
    date: 13 Oct 2026
  - label: Wire it to the Arduino
    state: done
    date: 14 Oct 2026
  - label: Program the cascade
    state: done
    date: 14 Oct 2026
  - label: Fix the solder bridge on LED 8
    state: done
    date: 15 Oct 2026
  - label: Final check and write-up
    state: done
    date: 16 Oct 2026

parts:
  - name: Arduino Uno-compatible board
    qty: ×1
  - name: 5 mm LEDs (4 blue, 4 green)
    qty: ×8
  - name: 220 Ω resistors
    qty: ×8
  - name: Perfboard
    qty: ×1
  - name: Header pins
    qty: ×9
  - name: Solderless breadboard
    qty: ×1
  - name: Male-to-male jumper wires (Arduino → breadboard, 8 signals + GND)
    qty: ×9
  - name: Male-to-female jumper wires (breadboard → header pins, 8 signals + GND)
    qty: ×9
  - name: USB-B cable (power + upload)
    qty: ×1

github: '[GitHub link]'
---
