//3 LIBARY
const io = require("socket.io-client"); //MENGHUBUNGKAN CLIENT DAN SERVER
const readline = require("readline"); // MENERIMA PROCESS INPUT, OUTPUT DAN PROM
const crypto = require("crypto"); // LIBARY HASH

const socket = io("http://localhost:3000"); // UNTUK MENGHUBUNGKAN CLIENT KE LOCALHOST YANG MEMPUNYAI PORT 3000

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> "
});

let username = "";

function hashMessage(message) {
    return crypto.createHash('sha256').update(message).digest('hex');
} // UNTUNG MENG ENCYPTCY MESSAGE MENGUNAKAN SHA256, yaitu sebuah cryptography

socket.on("connect", () => {
    console.log("Connected to the server");

    rl.question("Enter your username: ", (input) => {
        username = input;
        console.log(`Welcome, ${username} to the chat`);
        rl.prompt();

        rl.on("line", (message) => {
            if (message.trim()) {//ini CARA KERJA HASH UNTUK MENGDETEKSI SERVER YANG MENG MODIFIED TEXT
                const hashedMessage = hashMessage(message); // MESSAGE AKAN DI HASH DAN DISIMPAN DI VARIABLE HASHMESSAGE
                socket.emit("message", { username, message, hash: hashedMessage }); 
                //UNTUK KIRIM USERNAME MESSAGE DAN HASH MELALUI CHANNEL MESSSAGE KE SERVER
            } 
            rl.prompt();
        });
    });
});

// UNTUK PENERIMA CHAT
socket.on("message", (data) => {
    const { username: senderUsername, message: senderMessage, hash: senderHash } = data;
//INI AKAN MENERIMA USERNAME,MESSAGE, HASH DARI SERVER

    if (senderUsername !== username) {
        const computedHash = hashMessage(senderMessage);
// SENDER MESSAGE AKAN DI HASH DAN DI SIMPAN DI COMPUTEDHASH

        if (computedHash === senderHash) {
            console.log(`${senderUsername} (verified): ${senderMessage}`);//JIKA COCOK AKAN MENAMPILKAN VERIVIED
        } else {
            console.log(`${senderUsername} (warning): ${senderMessage}`);//JIKA TIDAK COCOK AKAN MENAMPILKAN WARNING
        }
        rl.prompt();
    }//UNTUK MENCOCOKAN COMPUTED HASH DAN SENDER HASH
});

socket.on("disconnect", () => {
    console.log("Server disconnected, Exiting...");
    rl.close();
    process.exit(0);
});

rl.on("SIGINT", () => {
    console.log("\nExiting...");
    socket.disconnect();
    rl.close();
    process.exit(0);
});