# [1.5.0](https://github.com/caiopizzol/whatsapp-web-api/compare/v1.4.0...v1.5.0) (2025-11-29)


### Bug Fixes

* lint ([ee8fec4](https://github.com/caiopizzol/whatsapp-web-api/commit/ee8fec45695ec87853214987579c1a2d37f658a6))
* match session id for whatsapp-login ([e26a63d](https://github.com/caiopizzol/whatsapp-web-api/commit/e26a63d1cdb845d9d18b147a94082eff9a310f97))
* sending chat messages ([98d20d4](https://github.com/caiopizzol/whatsapp-web-api/commit/98d20d482a79d6ccd5d7e9a5b22a95bbb9e848a7))
* session dir for volume persist ([aad16d5](https://github.com/caiopizzol/whatsapp-web-api/commit/aad16d58eb2dde77ed063e9a38f65b235e990bfa))


### Features

* new groups endpoint ([09f9f34](https://github.com/caiopizzol/whatsapp-web-api/commit/09f9f34362c11409c560a91921e36def058092e8))
* new verify endpoint ([d8aab5f](https://github.com/caiopizzol/whatsapp-web-api/commit/d8aab5f09b7ccfc30d2132b1d1fe8acd0588696c))

# [1.4.0](https://github.com/caiopizzol/whatsapp-web-api/compare/v1.3.1...v1.4.0) (2025-07-26)

### Features

- unify message sending to support text and media ([940f9ec](https://github.com/caiopizzol/whatsapp-web-api/commit/940f9ec336fd65119daf90b8cb5c41752cc212f0))

## [1.3.1](https://github.com/caiopizzol/whatsapp-web-api/compare/v1.3.0...v1.3.1) (2025-07-24)

### Bug Fixes

- add MacOS support for Puppeteer executable path ([4c3599b](https://github.com/caiopizzol/whatsapp-web-api/commit/4c3599b321dc02ee53eebfdf41f3cd3f84a85e4c))

# [1.3.0](https://github.com/caiopizzol/whatsapp-web-api/compare/v1.2.0...v1.3.0) (2025-07-24)

### Features

- enhance session recovery for disconnected sessions ([2e77f3c](https://github.com/caiopizzol/whatsapp-web-api/commit/2e77f3c938dca8db89f32b63ecb72717f3ded979))

# [1.2.0](https://github.com/caiopizzol/whatsapp-web-api/compare/v1.1.3...v1.2.0) (2025-07-24)

### Features

- enhance session management with disk persistence ([3bc712a](https://github.com/caiopizzol/whatsapp-web-api/commit/3bc712a0f57618cb9a46258e49dd307022f7701b))

## [1.1.3](https://github.com/caiopizzol/whatsapp-web-api/compare/v1.1.2...v1.1.3) (2025-07-24)

### Bug Fixes

- update qrMaxRetries in SessionManager for improved session handling ([06010bb](https://github.com/caiopizzol/whatsapp-web-api/commit/06010bb686a611765ba8ee7912fca573b1cbff69))

## [1.1.2](https://github.com/caiopizzol/whatsapp-web-api/compare/v1.1.1...v1.1.2) (2025-07-24)

### Bug Fixes

- enhance session creation logic to allow for optional session ID ([2f3712c](https://github.com/caiopizzol/whatsapp-web-api/commit/2f3712c9c448d1b78008365d69bfc91a64fb8ecd))

## [1.1.1](https://github.com/caiopizzol/whatsapp-web-api/compare/v1.1.0...v1.1.1) (2025-07-24)

### Bug Fixes

- simplify session creation and update README for clearer usage instructions ([d059f4f](https://github.com/caiopizzol/whatsapp-web-api/commit/d059f4f893c7eadedf0e7468621abfec2bce2c83))

# [1.1.0](https://github.com/caiopizzol/whatsapp-web-api/compare/v1.0.0...v1.1.0) (2025-07-24)

### Features

- update Dockerfile and package.json for improved structure and dependencies; add session management features and middleware ([213150d](https://github.com/caiopizzol/whatsapp-web-api/commit/213150d89c7afbcdf3f9b0d2ae3b278f0183da88))

# 1.0.0 (2025-07-23)

### Bug Fixes

- update API endpoint prefixes in README, test-local.sh, and app.ts ([14f6b3b](https://github.com/caiopizzol/whatsapp-web-api/commit/14f6b3befd571a2766c11e83b703d432153dadf4))
- update Brazilian phone number formatting for WhatsApp compatibility by removing the 9th digit ([34491e5](https://github.com/caiopizzol/whatsapp-web-api/commit/34491e5549b3e4c64bac9b247d9dde46d178e28b))

### Features

- add .env.example file for environment variable configuration and update session route from /session to /sessions ([143c7cd](https://github.com/caiopizzol/whatsapp-web-api/commit/143c7cd971aae6d39d0531ef391db33e5ab79562))
- add Caddy labels for reverse proxy configuration in docker-compose ([977e232](https://github.com/caiopizzol/whatsapp-web-api/commit/977e23246ee4558428c4cdb1c49b54bcb0cc8bec))
- add CONTRIBUTING.md, SECURITY.md, and LICENSE files; update README for clarity and structure ([f8ff2d5](https://github.com/caiopizzol/whatsapp-web-api/commit/f8ff2d581f0c73ae3e1bbcb125e4dbba56d7e7ba))
- add load and reliability testing scripts, enhance API authentication ([cb6d210](https://github.com/caiopizzol/whatsapp-web-api/commit/cb6d2104a95ff5bc502bbe64b0b84ce7d2da9c01))
- add QR code display functionality to test-local.sh ([4ec56b9](https://github.com/caiopizzol/whatsapp-web-api/commit/4ec56b9b774d598c34784c1b31185d94071377a3))
- add root route for API information and update auth hook to skip root route ([3c3fd0b](https://github.com/caiopizzol/whatsapp-web-api/commit/3c3fd0bfecb9861fc853070074a72a7d78f24d5e))
- enhance session management in WhatsApp service; update README and add SESSION_USAGE.md for detailed session handling instructions ([25da677](https://github.com/caiopizzol/whatsapp-web-api/commit/25da677976d071875b58bb5a45941a4659a0ae6b))
- implement phone number formatting for WhatsApp compatibility, including handling Brazilian numbers ([ef8de5e](https://github.com/caiopizzol/whatsapp-web-api/commit/ef8de5ea7ddec3b46554d264d89f9927d648ddb6))
