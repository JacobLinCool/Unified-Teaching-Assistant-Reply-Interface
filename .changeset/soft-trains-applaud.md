---
"utari": minor
---

Add parser and sender to UTARI config

Since parser and sender are the backbone of the UTARI, they should not be implemented as a middleware. Now, people can use their own parser and sender by setting the config, if not set, the default parser (portal-mime) and sender (mailchannels) will be used.
