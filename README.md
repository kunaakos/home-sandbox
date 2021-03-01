# HOME 🏘 AUTOMATION 🤖 SANDBOX 💥

It's an experiment. If you're planning to use this, don't.

But if you're curious, this is a JS home automation project (fully functional) running on a Raspberry Pi, that supports IKEA smart thingies, Xiaomi bluetooth sensors, DIY devices and simple switches/lights connected via GPIO.

Things that are interesting, or even unique about it:

* (basic) access control, so everyone in a household (or their guests) can get separate accounts
* possible to mix devices from different brands and even DIY gadgets to create automations
* all data is self-hosted, no external APIS needed (but the project is currently deployed via Balena, sot there's that)
* it is made up of microservices and yes there is a federated GraphQL setup in here
* has a React front-end
