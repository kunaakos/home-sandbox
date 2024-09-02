# UPDATE

This project is deprecated, but (as of 2024) it's still on duty in my home, watering my plants, controlling my lights and monitoring the temperatures of my rooms. It's been stable, and does its thing well, but I opted for a different approach to writing this for many different reasons.

This readme is a post-mortem of sorts. I have learned a lot, and will continue working on this, but in a different repo (closed-source for now).

## Infrastructure and hardware learnings

While the project had users other than me and ran in more than one location, it was deployed using [the Balena Platform](https://etcher.balena.io/). This handled OTA updates and remote management perfectly, and I had fully working continuous deployment. It was a bit slow (to build several docker images in the cloud and pull updates to remote devices), and would've been a bit costly to run for more than 10 users.

The Raspberry Pi platform proved to be slightly unreliable: they chew through SD cards, especially if there's a lot of logging going on, which there was with this project. No other issues (well, other than the inherent lack of security), but this did knock devices out once or twice every year, which was extremely confusing for non-tech people.

## What wasn't solved

### multi-node capability
Checking off everything the way I wanted to is best done in a way that required writing a custom actor model implementation with delay tolerant networking in mind. *This was the final conclusion of this project, and led me to start work on said library*.

### everything being functional without an internet connection

Think mobile homes in the wild! Unfortunately I learned that HTTPS over private networks is messy. I do have solutions in mind, but they're either very complex, or require a secure web server for dealing with certificates. This is still very much an open question, and I currently sidestep it by tunneling through a secure third party server (ngrok or the balena infrastructure). Multi-node also changes everything.

I came to accept that the best way of doing this is still using a secure, public server operated as a service.

## Why the UI is so: accessibility!

Sooo, in short, the main remote UI was designed for the visually impaired. Substitute fonts for braille, colors for different levels of embossing or textures on a *Haptic Screen* and you'll see (or rather, feel) why this is the way it is. It's completely theoretical, because I didn't have access to this type of screen (still very niche as of 2024), nor any visually impaired friends to test with - but I'm confident that this is a working approach.

The weirdness you might notice in the UI library (`verse`s and `scroll`s instead of `card`s and `screen`s, for example) is also because this same UI is designed to be  easily comprehensible using a screen reader. This aspect isn't as well thought-out as accessibility for the visually impaired, but it's certainly doable with this design and codebase. In short, one could either improve the tagging and formatting of current UI elements, or if it becomes too complex, just substitute the UI renderer with a text-based one.

**I might work this UI library out as a separate project if I can get my hands on a haptic display.** But it will be dropped from the next iteration of this project because it's a whole thing on its own.

Fun fact: the initial version used to be nothing but text and emojis, without any CSS (!).

# HOME 🏘 AUTOMATION 🤖 SANDBOX 💥

It was an experiment. If you're planning to use this, don't.

But if you're curious, this is a JS home automation project (fully functional) running on a Raspberry Pi, that supports IKEA smart thingies, Xiaomi bluetooth sensors, DIY devices and simple switches/lights connected via GPIO.

Things that are interesting, or even unique about it:

* completely self-hosted, without any personal data stored outside of anyone's home, but connecting to 3rd party APIs is possible (e.g. piping data to a service that logs, visualizes)
* easy access control, multiple users (think family homes, airbnbs, offices, hotels...)
* possible to interoperate devices from different brands and even DIY gadgets to create automations
* microservice arhitecture wuith a GraphQL API
* a React front-end and a unique UI language
