# The Pawn Gambit

<img width="350" height="178" alt="Group 1" src="https://github.com/user-attachments/assets/d6b82ad3-c2bd-4119-8baa-06e5e888bbbe" />


Welcome to **The Pawn Gambit**, a minimalist, chess-inspired survival roguelike. In this challenging game, you control a single black piece and must survive as long as possible against an ever-growing army of white pieces. Every move counts as you collect experience, gather gems, and upgrade your piece to become more powerful.

### 🔴 [**Play the Game**](https://pawn-gambit.netlify.app/)
## 🔐 Access Information
### 🧾 Password Format
- The **base password** is: `190725`
- For different rounds, append the **round number** to the base password.

**Examples:**
| Round | Password |
|--------|-----------|
| Round 1 | `1907251` |
| Round 2 | `1907252` |
| Round 3 | `1907253` |
| Round 4 | `1907254` |

> 💡 *Use the corresponding password wherever authentication is required*

---


## ## Features ✨

* **Chess-Based Mechanics:** All pieces move and capture according to standard chess rules.
* **Endless Survival:** Face increasingly difficult waves of enemy pieces. The game ends when you are captured.
* **Piece Progression:** Start as a Pawn and use collected gems to upgrade to a Knight, Rook, Bishop, and finally, the powerful Queen.
* **Resource Management:** Gain XP and Gems for surviving turns and capturing pieces.
* **Multiple Difficulty Levels:** Choose from Easy, Normal, Hard, Insane, and the special **DUOS** mode.
* **Reactive UI:** Threat indicators show which squares are under attack, helping you plan your moves.
* **Persistent Settings:** Your chosen difficulty and indicator preferences are saved in your browser's local storage.

---

## ## Tech Stack 🛠️

* **Frontend:** [Vite](https://vitejs.dev/) + [React 19](https://react.dev/)
* **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
* **Styling:** [SCSS Modules](https://sass-lang.com/) with a globally injected theme.
* **Linting:** [ESLint 9](https://eslint.org/) (Flat Config)


---

## ## Getting Started

To get a local copy up and running, follow these simple steps.

### ### Prerequisites

You'll need [Node.js](https://nodejs.org/en/) (v18.x or later) and [npm](https://www.npmjs.com/) installed on your computer.

### ### Installation & Setup

1.  Clone the repository to your local machine:
    ```sh
    git clone [https://github.com/coded-circuit/The-Pawn-Gambit-](https://github.com/coded-circuit/The-Pawn-Gambit-)
    ```
2.  Navigate into the project directory:
    ```sh
    cd The-Pawn-Gambit-
    ```
3.  Install the NPM packages:
    ```sh
    npm install
    ```
4.  Start the local development server:
    ```sh
    npm run dev
    ```
    The application should now be running on `http://localhost:5173`.

---

## ## Available Scripts

This project includes several scripts to help with development and deployment:

| Script        | Description                                                              |
| :------------ | :----------------------------------------------------------------------- |
| `npm run dev` | Starts the Vite development server with hot-reloading.                   |
| `npm run build`   | Bundles the app for production into the `dist` folder.                 |
| `npm run lint`    | Lints all files in the `src` directory.                                |
| `npm run preview` | Serves the production build locally to preview before deployment.      |
| `npm run deploy`  | Runs the `build` script and deploys the `dist` folder to GitHub Pages. |
