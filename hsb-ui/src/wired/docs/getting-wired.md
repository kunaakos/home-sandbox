Wire is a design language, UI kit, and approach to UX built for modern display devices.

It was inspired by neon signs over a night sky and early CRT displays, hence the name. You might find these metaphors outdated but these were the first truly post-paper displays.

It was conceived for users on the move, handheld devices and energy efficiency in mind.

If something follows this guide, you can call it a wired design.

Wired interfaces are inviting, but not meant for being stared at for extended periods. Instead they're designed to be snappy and energizing.

It also makes for user interfaces that can be projected over any dark or opaque background, and if the technology comes along, used on tactile screens by people who cannot see - and this is at the core of why everything is the way it is in Wire.

Despite the inspiration, Wire tries not to rely on visual metaphors, they are a thing of the past. Though these designs rely heavily on color, notice how a series of colors is used: from cool to warm. This is easy enough to translate to other properties: weight, elevation, texture, intonation. Users with different abilities will experience them differently, but all experiences should be equal in quality. Don't make anyone miss out.

Wire UI should be easy enough to describe in sentences: *a light switch that is turned off*, *tomorrow's weather in Mumbai: sunny with chances of rain in the evening* or *breaking news from The Guardian: vaccines are proving to be efficient*.

## Structuring and naming things

Information is grouped in **Verse**s. Their content should not be more than what can described in a compound sentence.

**Verse**s displayed together make for Scrolls, which will be rendered on displays.

A **Scroll** is vertical and is always thought of in its entire length, not just the currently diplayed portion. It can have Sections, but pages are a thing of the past.

The width and size of content depends on displays. Always start off with the narrowest display, and limit the width of **Scroll**s to what's comfortably readable by the user. If a wide display is available, render several **Scroll**s at once if you must, but don't stretch content too much.

Last but not least everything is built from components, which should be modular, but should not offer too many ways to use them. Don't build swiss army knives, build forks and spoons and screwdrivers.

When referring to any specific component, say a **Scroll** or a **ThermostatVerse**, always emphasize and use the properly capitalized name. When referring to the concept itself, use the word how you normally would.

A short list of rules to guide you:

* wired designs should be readable with the tip of your finger
* forget cursors, think touch and speech
* you should always use the minimum amount of pixels
* avoid redundancy at all costs
* grouping can be done using negative space instead of borders and backgrounds &emdash; don't build walls around content
* rely on widely known and popular visual metaphors and keep icons and glyphs to a minimal amount, used system-wide
* if it's not text, it probably should be in text
* content is pure light, so it's fast and almost weightless and should behave accordingly
* even if you can't see sunlight, you can feel the warmth of it on your skin 
* component UI should have states but the app UI shouldn't

## Code examples

There will be no code exaples rendered in the guide, because the guide itself is the code example. Check the source files of the guide!
