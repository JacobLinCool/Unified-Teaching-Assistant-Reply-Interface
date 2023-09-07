# utari

## 0.1.0

### Minor Changes

-   [`da99b26`](https://github.com/JacobLinCool/Unified-Teaching-Assistant-Reply-Interface/commit/da99b26829b7c1f3879b51b1b6de2a50e5555719) Thanks [@JacobLinCool](https://github.com/JacobLinCool)! - Add parser and sender to UTARI config

    Since parser and sender are the backbone of the UTARI, they should not be implemented as a middleware. Now, people can use their own parser and sender by setting the config, if not set, the default parser (portal-mime) and sender (mailchannels) will be used.

-   [`da99b26`](https://github.com/JacobLinCool/Unified-Teaching-Assistant-Reply-Interface/commit/da99b26829b7c1f3879b51b1b6de2a50e5555719) Thanks [@JacobLinCool](https://github.com/JacobLinCool)! - Remove email-parser middleware, use config.parser to set other parser instead

### Patch Changes

-   [`07003a2`](https://github.com/JacobLinCool/Unified-Teaching-Assistant-Reply-Interface/commit/07003a278bb50a9b3b0e363ec0bf452d15772318) Thanks [@JacobLinCool](https://github.com/JacobLinCool)! - Add retry for default email sender

-   [`b533d1a`](https://github.com/JacobLinCool/Unified-Teaching-Assistant-Reply-Interface/commit/b533d1abe1379b62b2cc5108c30b8e91a65288f7) Thanks [@JacobLinCool](https://github.com/JacobLinCool)! - Add on-recieved hook

-   [`b533d1a`](https://github.com/JacobLinCool/Unified-Teaching-Assistant-Reply-Interface/commit/b533d1abe1379b62b2cc5108c30b8e91a65288f7) Thanks [@JacobLinCool](https://github.com/JacobLinCool)! - Add store to R2 module

## 0.0.2

### Patch Changes

-   [`e2bc713`](https://github.com/JacobLinCool/Unified-Teaching-Assistant-Reply-Interface/commit/e2bc713f0534b8fe00444aeadce4b94dc7da28a5) Thanks [@JacobLinCool](https://github.com/JacobLinCool)! - Customaize the system name in email

-   [`cd9922a`](https://github.com/JacobLinCool/Unified-Teaching-Assistant-Reply-Interface/commit/cd9922af9b1c53a00220f255cd6f54ccd36f63d8) Thanks [@JacobLinCool](https://github.com/JacobLinCool)! - Separate to field of seding email and remove "RE:" in title when send to others

-   [`7b75e34`](https://github.com/JacobLinCool/Unified-Teaching-Assistant-Reply-Interface/commit/7b75e34387f0626a69985f1123ec2d4b9fe180a9) Thanks [@JacobLinCool](https://github.com/JacobLinCool)! - Set subject at the begin of handle function

-   [`8637ac8`](https://github.com/JacobLinCool/Unified-Teaching-Assistant-Reply-Interface/commit/8637ac8191189dcba9275124417c161ee68e3c3f) Thanks [@JacobLinCool](https://github.com/JacobLinCool)! - fix the extract case id bug

-   [`f3ac89c`](https://github.com/JacobLinCool/Unified-Teaching-Assistant-Reply-Interface/commit/f3ac89cfb5f3142d5beca36469c885c9d49e7c21) Thanks [@JacobLinCool](https://github.com/JacobLinCool)! - Set sender at the begin of handle function

## 0.0.1

### Patch Changes

-   [`3c9e23b`](https://github.com/JacobLinCool/Unified-Teaching-Assistant-Reply-Interface/commit/3c9e23b8d155892f9d563657cf46a4a35ca8c9e6) Thanks [@JacobLinCool](https://github.com/JacobLinCool)! - Add no-auto-assign module

-   [`f0cb61b`](https://github.com/JacobLinCool/Unified-Teaching-Assistant-Reply-Interface/commit/f0cb61b12f5d65ec1ae98504b15c904dae828869) Thanks [@JacobLinCool](https://github.com/JacobLinCool)! - Use <br> when sending notify-support message with html content

-   [`ab75c6b`](https://github.com/JacobLinCool/Unified-Teaching-Assistant-Reply-Interface/commit/ab75c6b25cfc64efb1725ea76fac3bf1bc329014) Thanks [@JacobLinCool](https://github.com/JacobLinCool)! - Add email allowlist to base-pre-test
