const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const moment = require('moment');
const app = express();
const port = 6060; // port pour https
const hostname = '192.168.0.107';
const webSockets = {};

app.get('/', (req, res) => {
    res.send("Bonjour tout le monde");
});

const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

const wss = new WebSocket.Server({ server });


wss.on('connection', function (ws, req) {
    var userID = req.url.substr(1); // obtient l'ID utilisateur à partir de l'URL ip:6060/userid
    webSockets[userID] = ws; // ajoute un nouvel utilisateur à la liste de connexion

    console.log('Utilisateur ' + userID + ' connecté');

    ws.on('message', message => { // s'il y a un message
        console.log(message);
        var datastring = message.toString();
        if (datastring.charAt(0) == "{") {
            datastring = datastring.replace(/\'/g, '"');
            try {
                var data = JSON.parse(datastring);
                if (data.auth == "chatapphdfgjd34534hjdfk") {
                    if (data.cmd == 'send') {
                        var boardws = webSockets[data.userid]; // vérifie s'il y a une connexion réceptrice
                        if (boardws) {
                            var cdata = `{"cmd":"${data.cmd}","userid":"${data.userid}", "msgtext":"${data.msgtext}"}`;
                            boardws.send(cdata); // envoie le message au destinataire
                            ws.send(data.cmd + ":success");
                        } else {
                            console.log("Aucun utilisateur destinataire trouvé.");
                            ws.send(data.cmd + ":error");
                        }
                    } else {
                        console.log("Aucune commande d'envoi");
                        ws.send(data.cmd + ":error");
                    }
                } else {
                    console.log("Erreur d'authentification de l'application");
                    ws.send(data.cmd + ":error");
                }
            } catch (error) {
                console.log("Erreur lors de l'analyse du JSON:", error);
                ws.send(data.cmd + ":error");
            }
        } else {
            console.log("Type de données non JSON");
            ws.send(data.cmd + ":error");
        }
    });

    ws.on('close', function () {
        var userID = req.url.substr(1);
        delete webSockets[userID]; // lors de la fermeture de la connexion, supprime le récepteur de la liste de connexion
        console.log('Utilisateur déconnecté: ' + userID);
    });

    ws.send('connecté'); // message de retour de connexion initial
});


app.on('error', error => console.error(error));