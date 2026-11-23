---
title: Desk Robot
summary: A personal assistant robot for my desk that keeps track of my day with me. It greets me in the morning and when I walk in, shows a face and small screens, and sums up my day at night.
keyFacts: ['Built part by part', '2 sensors working together', 'Arduino Uno, then ESP32']
status: in-progress
order: 3
year: 2026
started: 3 Nov 2026
lastUpdated: 23 Nov 2026
stack: [C/C++, Arduino, ESP32]

hero:
  photo: /projects/desk-robot/presence.jpg
  photoCaption: 'The first two senses working together: PIR and distance sensor on one Uno, powered from the breadboard rails. 23 Nov 2026'

why: >-
  After the LED cascade I wanted one big project that pulls everything together instead of many small ones, and
  something I would actually use every day. In the morning it tells me the weather and my plan, it greets me when
  I come into the room, it wakes up when I touch its head, and at night it tells me how much of my plan I got done.
  Each part teaches one new piece of embedded work, and the robot is where they have to work together.

devlog:
  - date: 23 Nov 2026
    title: 'Two parts working together: presence'
    short: 'PIR and distance sensor on one Uno: it greets me when I walk in and knows when I sit down or leave the desk.'
    key: true
    text: >-
      First time two parts work together. Both sensors on one Uno, powered from the breadboard rails: walking in
      prints "Welcome back!", sitting down closer than 50 cm prints "You sat down", getting up prints "You left the
      desk". At first it greeted me again and again while I was typing, because the PIR drops after its 15 s hold
      when I sit still and the next small movement looks like someone walking in. Now it greets only if the
      distance sensor says I'm not already at the desk. Before that, a loose wire gave a constant 0.9 cm reading,
      which looked exactly like a bug in the code. It has its own page under Integrations.
  - date: 15 Nov 2026
    title: 'Second part: the motion sensor'
    short: 'Added a PIR motion sensor that notices when I walk in. It has its own page under Components.'
    text: >-
      The robot's second sense is a PIR motion sensor on the Uno. It reacts to body heat moving across its view, so
      it can tell when I walk into the room, but it can't see someone sitting still. That split the job in two: the
      PIR for "someone came in", the distance sensor for "someone is at the desk". It has its own page under
      Components.
  - date: 11 Nov 2026
    title: What the robot is for
    short: 'Wrote down a whole day with the robot: morning briefing, greeting, screens, and a summary at night.'
    key: true
    text: >-
      Wrote down what a day with the robot should look like. When I turn off my phone alarm it says good morning,
      tells me the weather and reads my plan from my calendar, and plays a song I ask for. When I walk into the
      room it greets me with what's left of the day, then just shows a face. At the desk I touch its head to talk to
      it, and small screens on its arms show the weather, my Claude usage and the alarm. At night I say good night
      and it tells me what I got done. That also gave each sensor its job.
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
    motion.update();   // PIR: did someone come in?
    distance.update(); // HC-SR04: is someone at the desk?
    touch.update();    // touch pad on the head
    face.update();     // screen on the head
    screens.update();  // small screens on the arms
    voice.update();    // speaker and microphone
  }

problem: >-
  It is too much to build in one go. Voice, servos, screens and sensors wired up at once would be impossible to
  debug, because I would never know which part is at fault.
lesson: >-
  Build and understand one part at a time on the breadboard, then add it to the robot as a clean module and
  check that everything that already worked still works.

progress: 25
steps:
  - label: 8-LED cascade, the starting point
    state: done
    date: 16 Oct 2026
  - label: Distance sensor (HC-SR04)
    state: done
    date: 11 Nov 2026
  - label: Motion sensor (HC-SR501)
    state: done
    date: 16 Nov 2026
  - label: Both sensors working together
    state: done
    date: 23 Nov 2026
  - label: Touch on the head
    state: next
  - label: Face screen on the head
    state: next
  - label: Screens on the arms
    state: next
  - label: Speaker and microphone
    state: next
  - label: Phone alarm, calendar, weather and Spotify
    state: next

parts:
  - name: Arduino Uno R3 (clone)
    qty: ×1
  - name: HC-SR04 distance sensor
    qty: ×1
  - name: HC-SR501 PIR motion sensor
    qty: ×1
  - name: ESP32 (next)
    qty: ×1

github: https://github.com/Matei-Iliuta/desk-robot
---
