//Aqui vamos importar as dependências do IPC para gerenciar as mensagens que estão a chegar através do main.

const { ipcRenderer, shell, remote } = require("electron");

console.log(shell);
const path = require("path");
console.log(path);
console.log(remote);
console.log(window.process.argv[1]);

//ELEMENTOS
const title = document.getElementById("title");
const textarea = document.getElementById("text");

//SET FILE (evento que criámos no main)

ipcRenderer.on("set-file", function (event, data) {
  textarea.value = data.content;
  title.innerHTML = "Nothy - " + data.name;
  console.log(data);
});

//UPDATE TEXTAREA (sempre que algo for ecrito no renderizador, vai enviar para o main)
function handleChangeText() {
  ipcRenderer.send("update-content", textarea.value);
}
