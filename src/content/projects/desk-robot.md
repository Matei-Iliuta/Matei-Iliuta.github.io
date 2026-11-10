---
title: Desk Robot
summary: A small robot that lives on my desk. It turns its head towards me, shows its mood on two OLED eyes, reacts when I touch its head and understands spoken commands on the chip itself.
keyFacts: ['Voice on the chip', 'Built part by part', 'Clear acrylic body']
status: in-progress
order: 3
year: 2026
started: 3 Nov 2026
lastUpdated: 9 Nov 2026
stack: [C/C++, Arduino, ESP32, TinyML]

hero:
  photoPlaceholder: '[Photo of the robot, once the first parts come together]'
  photoCaption: Starting with the senses, one part at a time.

why: >-
  After the LED cascade I wanted one big project that pulls everything together instead of many small ones.
  A desk robot does exactly that: sensors, servos, screens, sound, a touch sensor and on-device voice recognition,
  all in one thing I can actually use every day. Each part teaches one new piece of embedded work, and the
  robot is where they have to work together.

devlog:
  - date: 9 Nov 2026
    title: One repo, one folder per part
    short: 'One repo for the robot, with a folder per part: sketch, schematic, photo and build log.'
    text: >-
      Set up the robot's repository: a README with the plan and a components folder where every part gets its own
      sketch, wiring schematic, photo and build log. The distance sensor moved in first, with its full history, and
      its schematic is now drawn by me in KiCad 10.
  - date: 6 Nov 2026
    title: 'First part: the distance sensor'
    short: 'Started with the HC-SR04 distance sensor. It has its own page under Components.'
    text: >-
      The robot needs to know when someone is in front of it. I started with an HC-SR04 ultrasonic sensor on the
      Arduino Uno: timing the echo with pulseIn, chasing random spikes that turned out to be echoes from my desk,
      and moving the measurement into its own function. It has its own page under Components.
  - date: 4 Nov 2026
    title: Parts, body and the assistant
    short: 'Went through my kit, chose a clear acrylic body and a Raspberry Pi for the future assistant.'
    text: >-
      Went through every part in my kit and what each one is for. Decided the body will be clear laser-cut acrylic,
      so the wiring and later my own PCB are part of the look. The future assistant (alarm, weather, calendar,
      conversation) will run on a Raspberry Pi, and the robot will hold two or three small screens in its hands
      for widgets like the time and the weather.
  - date: 3 Nov 2026
    title: From room monitor to desk robot
    short: 'A room monitor with an alarm turned into a desk robot: a moving head, OLED eyes, touch and voice commands on the chip.'
    key: true
    text: >-
      The plan started as a room monitor with an alarm. It turned into a robot: it stays on the desk instead of
      driving around, has a pan-tilt head, two OLED eyes, a touch sensor on its head and a speaker, and recognises
      a few English words on the chip itself, without internet. Nine steps, each one a single part tested on the
      breadboard before it joins the rest.

schematicPlaceholder: '[Block diagram of the robot, once the parts come together]'

code: |
  // Planned firmware: one non-blocking module
  // per part. loop() only lets each one run.
  void loop() {
    senses.update();  // motion, distance, temp, light
    neck.update();    // pan-tilt servos, smooth moves
    touch.update();   // capacitive pad on the head
    face.update();    // two OLED eyes
    voice.update();   // I2S speaker
    ears.update();    // keyword spotting (TinyML)
  }

problem: >-
  It is too much to build in one go. Voice, servos, screens and sensors wired up at once would be impossible to
  debug, because I would never know which part is at fault.
lesson: >-
  Build and understand one part at a time on the breadboard, then add it to the robot as a clean module and
  check that everything that already worked still works.

progress: 15
steps:
  - label: 8-LED cascade, the starting point
    state: done
    date: 16 Oct 2026
  - label: 'Senses: motion, distance, temperature, light'
    state: doing
  - label: 'Neck: pan-tilt servos'
    state: next
  - label: ESP32 and touch on the head
    state: next
  - label: 'Face: two OLED eyes'
    state: next
  - label: 'Voice: I2S speaker'
    state: next
  - label: Robot v1 in a clear acrylic body
    state: next
  - label: 'Ears: on-device keywords (TinyML)'
    state: next
  - label: Assistant v2 on a Raspberry Pi
    state: next

parts:
  - name: Arduino Uno, then ESP32-S3
    qty: ×1
  - name: HC-SR04, PIR, DHT11, LDR
    qty: ×4
  - name: OLED SSD1306 0.96" (eyes)
    qty: ×2
  - name: Pan-tilt bracket + servos
    qty: ×2
  - name: Copper tape (touch pad)
    qty: ×1
  - name: INMP441 microphone
    qty: ×1
  - name: MAX98357A amp + 3 W speaker
    qty: ×1
  - name: Raspberry Pi 5 (assistant, later)
    qty: ×1

github: '[GitHub link]'
---
