const { makeid } = require('./gen-id');
const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");
const axios = require('axios');

// Session Folder එක මකා දැමීමේ ශ්‍රිතය
function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    // 💡 සෑම නව උත්සාහයකටම අලුත් ID එකක් ජනනය වේ
    const id = makeid();
    
    async function GIFTED_MD_PAIR_CODE() {
        // Session දත්ත තාවකාලික ෆෝල්ඩරයක (temp/id) සුරකිනවා
        const {
            state,
            saveCreds
        } = await useMultiFileAuthState('./temp/' + id); 
        try {
            var items = ["Safari"];
            function selectRandomItem(array) {
                var randomIndex = Math.floor(Math.random() * array.length);
                return array[randomIndex];
            }
            var randomItem = selectRandomItem(items);
            
            let sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({
                    level: "silent"
                }),
                browser: Browsers.macOS("Desktop"),
            });
            
            // 💾 Session දත්ත Update වන විට සුරැකීම
            sock.ev.on('creds.update', saveCreds); 

            sock.ev.on("connection.update", async (s) => {
                const {
                    connection,
                    lastDisconnect,
                    qr
                } = s;

                if (qr) await res.end(await QRCode.toBuffer(qr));

                if (connection == "open") {
                    
                    // ⏳ Baileys මඟින් creds.json ලිවීම අවසන් වන තෙක් තත්පර 2ක ප්‍රමාදයක්
                    await delay(2000); 
                    
                    try {
                        // 📂 creds.json ගොනුව කියවීම
                        let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                        const base64Session = Buffer.from(data.toString()).toString('base64');
                        let md = "ANJU-XPRO~" + base64Session; // Base64 Session ID
                        
                        // ✉️ Session ID එක පණිවිඩයක් ලෙස යැවීම
                        let code = await sock.sendMessage(sock.user.id, { text: md });
                        
                        let cap = `
🔐 *𝙳𝙾 𝙽𝙾𝚃 𝚂𝙷𝙰𝚁𝙴 𝚃𝙷𝙸𝚂 𝙲𝙾𝙾𝙳𝙴 𝚆𝙸𝚃𝙷 𝙽𝚈𝙾𝙽𝙴!!*

Use this code to create your own *𝚀𝚄𝙴𝙴𝙽 𝙰𝙽𝙹𝚄 𝚇𝙿𝚁𝙾* WhatsApp User Bot. 🤖

📂 *WEBSITE:*  
👉 https://xpro-botz-ofc.vercel.app/

🛠️ *To add your SESSION_ID:*  
1. Open the \`session.js\` file in the repo.  
2. Paste your session like this:  
\`\`\`js
module.exports = {
  SESSION_ID: 'PASTE_YOUR_SESSION_ID_HERE'
}
\`\`\`  
3. Save the file and run the bot. ✅

⚠️ *NEVER SHARE YOUR SESSION ID WITH ANYONE!*
`;
                    
                    await sock.sendMessage(sock.user.id, {
                        text: cap,
                        contextInfo: {
                            externalAdReply: {
                                title: "QUEEN ANJU XPRO",
                                thumbnailUrl: "https://telegra.ph/file/adc46970456c26cad0c15.jpg",
                                sourceUrl: "https://whatsapp.com/channel/0029Vaj5XmgFXUubAjlU5642",
                                mediaType: 2,
                                renderLargerThumbnail: true,
                                showAdAttribution: true,
                            },
                        },
                    }, { quoted: code });

                    // 🗑️ Session ID යැවීමෙන් පසු තාවකාලික ගොනු මකා දැමීම
                    await delay(8000); // 👈 💡 මෙහි ප්‍රමාදය 8000ms දක්වා වැඩි කරන ලදී
                    await sock.ws.close();
                    await removeFile('./temp/' + id); 
                    
                    console.log(`👤 ${sock.user.id} 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱 ✅ 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗽𝗿𝗼𝗰𝗲𝘀𝘀...`);
                    await delay(100);
                    process.exit();

                    } catch (e) {
                        // 🐞 Session ID යැවීමේදී දෝෂයක් ඇති වුවහොත්
                        console.error("Session ID Send Error (inside open block):", e); // <-- Console Log එක
                        
                        let ddd = await sock.sendMessage(sock.user.id, { text: `ERROR: Failed to read session file or send message: ${e.toString()}` });
                        
                        // ... [අවවාදාත්මක පණිවිඩය]
                        let cap = `
🔐 *𝙳𝙾 𝙽𝙾𝚃 𝚂𝙷𝙰𝚁𝙴 𝚃𝙷𝙸𝚂 𝙲𝙾𝙳𝙴 𝚆𝙸𝚃𝙷 𝙰𝙽𝚈𝙾𝙽𝙴!!*

Use this code to create your own *𝚀𝚄𝙴𝙴𝙽 𝙰𝙽𝙹𝚄 𝚇𝙿𝚁𝙾* WhatsApp User Bot. 🤖

📂 *WEBSITE:*  
👉 https://xpro-botz-ofc.vercel.app/

🛠️ *To add your SESSION_ID:*  
1. Open the \`session.js\` file in the repo.  
2. Paste your session like this:  
\`\`\`js
module.exports = {
  SESSION_ID: 'PASTE_YOUR_SESSION_ID_HERE'
}
\`\`\`  
3. Save the file and run the bot. ✅

⚠️ *NEVER SHARE YOUR SESSION ID WITH ANYONE!*
`;
                    await sock.sendMessage(sock.user.id, {
                        text: cap,
                        contextInfo: {
                            externalAdReply: {
                                title: "QUEEN ANJU XPRO",
                                thumbnailUrl: "https://telegra.ph/file/adc46970456c26cad0c15.jpg",
                                sourceUrl: "https://whatsapp.com/channel/0029Vaj5XmgFXUubAjlU5642",
                                mediaType: 2,
                                renderLargerThumbnail: true,
                                showAdAttribution: true,
                            },
                        },
                    }, { quoted: ddd });

                    await delay(8000); // 👈 💡 මෙහිද 8000ms දක්වා වැඩි කරන ලදී
                    await sock.ws.close();
                    await removeFile('./temp/' + id); 
                    console.log(`👤 ${sock.user.id} 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱 (But failed to send Session ID) ✅ 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗽𝗿𝗼𝗰𝗲𝘀𝘀...`);
                    await delay(100);
                    process.exit();
                    }

                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10);
                    GIFTED_MD_PAIR_CODE();
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode == 401) {
                    // 401: Unauthorized error (Session Invalid) - temp folder එක මකා නැවත ආරම්භ කරන්න
                    console.log(`401 Unauthorized: Restarting and cleaning session for ID: ${id}`);
                    await removeFile('./temp/' + id);
                    await delay(100);
                    GIFTED_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log("service restarted (Outer Catch):", err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "❗ Service Unavailable" });
            }
        }
    }
    await GIFTED_MD_PAIR_CODE();
});

setInterval(() => {
    console.log("☘️ 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗽𝗿𝗼𝗰𝗲𝘀𝘀...");
    process.exit();
}, 180000);

module.exports = router;
