# UTARI: Unified Teaching Assistant Reply Interface

## Introduction

UTARI is an email-based support system for students to ask questions to teaching assistants.

## Architecture

UTARI is modularized and serverless.

### Middleware and Hook

There are two types of UTARI components: middleware and hook.

- Middleware is a part of the pipeline, which means that it will be executed and modified the data.
- Hook is triggered by an event, and it can be used to send notifications or do other things.

You can see [the flowchart](https://www.figma.com/file/ZwVIFYD75slPBIlmWrx1lr/UTARI?type=whiteboard&node-id=0%3A1&t=Mi6w2EGFXycju42D-1) to understand the middleware and hook.
