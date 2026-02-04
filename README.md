# Velocity UI


![Status](https://img.shields.io/badge/Status-Operational-success?style=for-the-badge)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ed?style=for-the-badge&logo=docker)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Architecture](https://img.shields.io/badge/Architecture-Clean-orange?style=for-the-badge)



![Test Coverage](https://img.shields.io/badge/coverage-85%25-orange)

Live: [Live Website](https://palegreen-mantis-363738.hostingersite.com/) 

Hello! Welcome to **Velocity UI** ⚡.

This project represents a user management interface built with Angular 20, demonstrating modern reactive patterns using Signals, high-performance DOM updates, and efficient heavy computation handling.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [NPM](https://www.npmjs.com/) (Included with Node.js)
- [Angular CLI](https://angular.dev/tools/cli) (Globally installed is recommended, but not strictly required if using `npx`)

### Installation

1. **Clone the repository** (if you haven't already).
2. **Install dependencies**:
   ```bash
   npm install
   ```

## 🛠 Usage

### Development Server

Run the application locally with hot-reload enabled:

```bash
ng serve
```
Navigate to `http://localhost:4200/` in your browser.

### Running Unit Tests

Execute the unit test suite via [Karma](https://karma-runner.github.io):

```bash
ng test
```

### Build

Build the project for production:

```bash
ng build
```
The build artifacts will be stored in the `dist/` directory.

## 🌟 Key Features

- **User List**: Displays a list of users fetched from a remote API.
- **Infinite Scroll**: Efficiently loads more users as you scroll.
- **Client-Side Search**: Instantly filter users by name or email.
- **Dynamic Grouping**: Group users by Alphabet, Age, or Nationality.
- **Responsive Design**: Mobile-friendly layout and interactions.

## 📚 Documentation

For a deep dive into the technical architecture, decision-making process, and implementation details, please refer to the [Feature Documentation](FEATURE_DOCUMENTATION.md).

