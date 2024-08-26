5x5 Chess Game
This is a simple 5x5 chess game implemented using Node.js, Express, Socket.io, and Chess.js. The game allows two players to play against each other, with spectators able to watch the game in real-time.

Features
5x5 Chessboard with custom pieces.
Real-time gameplay using Socket.io.
Support for spectators who can watch the game live.
Custom move logic for non-standard chess pieces.
Prerequisites
Before you start, ensure you have the following installed:

Node.js (v14 or later)
npm (comes with Node.js)
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/yourusername/chessgame.git
cd chessgame
Install dependencies:

bash
Copy code
npm install
Running the Application
1. Server Setup
Start the server:

bash
Copy code
npm start
The server will start on port 5500 by default. You can change the port by modifying the server.listen call in app.js.

Visit the game:

Open your browser and go to http://localhost:5500/ to start the game.

2. Client Setup
No additional setup is required for the client side. The client code is served automatically by the Express server when you visit the URL.

3. Game Play
The first two players to connect will be assigned the roles of "white" and "black."
Additional players will be spectators.
Drag and drop pieces to make your move. Invalid moves will not be processed, and you'll receive an "Invalid move" message.
Folder Structure
app.js: The main server file that handles socket connections and game logic.
public/: Contains static assets and client-side JavaScript (chessgame.js).
views/: Contains the index.ejs file that renders the HTML page.
node_modules/: Contains all the npm dependencies (created after running npm install).
Deployment
To deploy this app on a live server:

Ensure the server has Node.js and npm installed.
Upload the files to the server.
Install dependencies on the server by running npm install.
Start the application using npm start.
Configure your web server (e.g., Nginx, Apache) to forward traffic to the Node.js application running on the specified port.
Troubleshooting
Port already in use: If port 5500 is already in use, either change the port in app.js or stop the other service using that port.
Socket.io connection issues: Ensure your firewall or network settings allow WebSocket connections on the port being used.
Contributing
Feel free to fork this project, make improvements, and submit pull requests.

License
This project is licensed under the MIT License.![image](https://github.com/user-attachments/assets/c1e60f53-de6d-43fe-b9ad-b3ad28ca91bc)
