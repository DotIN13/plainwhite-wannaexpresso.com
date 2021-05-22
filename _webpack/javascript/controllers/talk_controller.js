import { Controller } from "stimulus";
import { saveAs } from "file-saver";
import QRCode from 'qrcode';
import * as Jdenticon from "jdenticon";
import randomName from "../shared/talk_name.js";
import Identity from "../shared/identity";

export default class extends Controller {

  static targets = [
    "message",
    "server",
    "serverSelect",
    "room",
    "logArea",
    "connectedAction",
    "qrcode",
    "file",
    "filename",
    "progress",
    "peer"
  ]

  static values = {
    connected: Boolean,
    name: String,
    peerName: String,
    qr: Boolean,
    room: String,
    locale: String,
    // Keep record of the number of unsent messages
    // Detect and send message on queue change
    queue: Number,
    progress: Number,
    roomTemplate: String,
    clipTemplate: String,
    pendTemplate: String,
    fileInTemplate: String,
    fileOutTemplate: String,
    peerTemplate: String,
    poutTemplate: String
  }

  get commands() {
    return [
      "ROOM",
      "CLIP",
      "PEND",
      "PEER",
      "POUT"
    ];
  } 

  connect() {
    this.nameValue = randomName(this.localeValue);
    if (this.currentQuery) {
      this.websocket = this.currentQuery.server;
      this.websocket.addEventListener("open", () => this.websocket.send(`ROOM ${this.currentQuery.room}`));
    } else {
      this.openConfig();
    }
    this.fillServer();
  }

  // Websocket getter and setter
  set websocket(val) {
    if (new URL(this.wss?.url || "ws://localhost").href != new URL(val).href) {
      this.clearWebsocket();
      this.wss = new WebSocket(val);
      this.wss.onmessage = e => this.onmessage(e);
      this.wss.onopen = () => this.onopen();
      this.wss.onclose = () => this.onclose();
      this.wss.onerror = () => this.clearWebsocket();
    }
  }

  get websocket() {
    return this.wss || undefined;
  }

  clearWebsocket() {
    this.websocket?.close();
    this.wss = undefined;
  }

  // Websocket callbacks
  onmessage(e) {
    // Debug
    // console.log(e);
    let templateValue = e.data, command = null, log = true;
    if (typeof(e.data) == "string") {
      command = this.isCommand(e.data);
      if (command === 'room') {
        this.roomValue = this.roomTarget.value = e.data.slice(5);
        templateValue = `<a href=${this.location.href}>#${e.data.slice(5)}</a>`;
        this.buildQR();
      } else if (command === 'clip') {
        templateValue = this.pendingClip = e.data.slice(5);
        this.applyClipboard();
      } else if (command === 'pend') {
        templateValue = e.data.slice(5);
      } else if (command === 'peer') {
        this.peerNameValue = templateValue = e.data.slice(5);
      } else if (command === 'pout') {
        this.peerNameValue = "";
        templateValue = e.data.slice(5);
      } else if (command === 'pong') {
        log = false;
      }
      if (log) this.log_message(templateValue, "incoming", command);
    } else {
      this.receiveFile(e.data);
    }
  }
  
  async onopen() {
    this.connectedActionTargets.forEach(el => el.removeAttribute("disabled"));
    this.connectedValue = !!this.websocket;
    // On open, always notify server of client name and uuid
    this.queue(`NAME ${this.nameValue} ${await new Identity().get()}`);
    this.unQueue();
  }
  
  onclose() {
    this.connectedActionTargets.forEach(el => el.setAttribute("disabled", ""));
    this.clearWebsocket();
    this.connectedValue = !!this.websocket;
  }  
  
  // Button functions
  config(e) {
    e.stopPropagation();
    this.openConfig();
  }

  openConfig() {
    this.element.classList.add('config-open');
  }

  closeConfig(e) {
    e.stopPropagation();
    this.element.classList.remove('config-open');
  }

  fillServer() {
    this.serverTarget.value = this.serverSelectTarget.value;
  }

  join() {
    this.websocket = this.serverTarget.value;
    // Debug
    // console.log(this.websocket);
    if (this.roomTarget.value != this.roomValue) this.queue(`ROOM ${this.roomTarget.value}`);
  }

  send() {
    // console.log(this.messageTarget.value);
    if (this.messageTarget.value != "") {
      this.websocket.send(this.messageTarget.value);
      this.log_message(this.messageTarget.value, "outgoing");
      this.messageTarget.value = "";
    }
    if (this.fileTarget.files.length == 1) {
      this.log_message(this.sendFile(), "outgoing", "fileOut");
      this.fileTarget.value = '';
      this.updateFileName();
    }
  }

  chooseFile() {
    this.fileTarget.click();
  }

  updateFileName() {
    this.filenameTarget.innerHTML = this.fileTarget.files[0]?.name || '';
  }

  sendFile() {
    const file = this.fileTarget.files[0];
    // Disable file transfer for large files until server supports it
    // console.log(file.size);
    if (file.size > 50 * 1000 * 1000) return console.log("File too large.");
    const encodedName = new TextEncoder().encode(file.name);
    // Debug
    // console.log(file);
    // console.log(file.name, "encoded into", encodedName);
    const fileBlob = new Blob([new Uint8Array([encodedName.length]), encodedName, file]);
    this.websocket.send(fileBlob);
    this.fileInterval = setInterval(() => this.updateProgress(fileBlob.size), 1000);
    return file.name;
  }

  updateProgress(total) {
    this.progressValue = 1 - (this.websocket.bufferedAmount / total);
  }

  async receiveFile(data) {
    const nameLengthBuffer = await data.slice(0, 1).arrayBuffer();
    const fileNameLength = new Uint8Array(nameLengthBuffer)[0];
    // Debug
    // console.log("filename length: ", nameLengthBuffer);
    const nameBuffer = await data.slice(1, fileNameLength + 1).arrayBuffer();
    const fileName = new TextDecoder("utf-8").decode(new Uint8Array(nameBuffer));
    this.log_message(fileName, "incoming", "fileIn");
    saveAs(data.slice(fileNameLength + 1), fileName);
  }

  syncClipboard() {
    navigator.clipboard.readText()
      .then(clipText => this.websocket.send(`CLIP ${clipText}`));
  }

  // Apply pending clipboard both after receiving message in #onmessage
  // and after getting focus in inline data-action.
  // Set 300ms timeout to wait for focus on window after maximizing window.
  applyClipboard() {
    setTimeout(() => {
      if (document.hasFocus() && this.pendingClip) navigator.clipboard.writeText(this.pendingClip);
    }, 300);
  }

  shareRoomLink() {
    navigator.clipboard.writeText(this.location.href);
  }

  get currentQuery() {
    const params = new URL(window.location).searchParams;
    const server = params.get("server");
    const room = params.get("room");
    if (server && room) return {
      server: params.get("server"),
      room: params.get("room")
    };
    
    return null;
  }

  get location() {
    const url = new URL(window.location);
    if (this.websocket) url.searchParams.set("server", this.websocket?.url);
    if (this.roomTarget.value != "") url.searchParams.set("room", this.roomTarget.value);
    return url;
  }

  buildQR() {
    this.qrValue = true;
    QRCode.toCanvas(this.qrcodeTarget, this.location.href, {
      width: 180,
      color: {
        light: "#ffffff00",
      },
    });
  }

  // Messaging methods
  log_message(data, dir, command = null) {
    const msg = (command ? this.commandHTML(data, command) : this.messageHTML(data, dir));
    this.logAreaTarget.insertAdjacentHTML("afterbegin", msg);
    const avatar = this.logAreaTarget.firstElementChild.querySelector("svg");
    if (avatar) Jdenticon.update(avatar, avatar.parentElement.dataset.name);
  }

  commandHTML(data, type) {
    return `<div class="talk__log talk__log-command">
      <div class="talk__log-command-text">
        ${type ? this[`${type}TemplateValue`].replace('#{TEMPLATE}', data) : data}
      </div>
    </div>`;
  }

  messageHTML(data, dir) {
    return `<div class="talk__log talk__log--${dir}">
      <div class="talk__log-avatar" data-name="${dir === "outgoing" ? this.nameValue : this.peerNameValue}">
        <svg width="48" height="48"></svg>
      </div>
      <div class="talk__log-text talk__log-text--${dir}">
        ${data}
      </div>
    </div>`;
  }

  isCommand(msg) {
    for (const cmd of this.commands) {
      if (msg.startsWith(cmd)) return cmd.toLowerCase();
    }
    return false;
  }

  // Value changed methods
  progressValueChanged(val) {
    this.element.style.setProperty("--progress", val);
    if (val >= 1) {
      clearInterval(this.fileInterval);
      this.element.querySelectorAll('.progress').forEach(el => el.classList.remove('progress'));
      this.element.style.setProperty("--progress", 0);
    }
  }

  peerNameValueChanged(val) {
    this.peerTarget.innerHTML = val === '' ? this.peerTarget.dataset.placeholder : this.peerNameValue;
  }

  // Queue Methods
  queue(msg) {
    this.queueValue ||= 0;
    this.messageQueue ||= [];
    this.queueValue += 1;
    this.messageQueue.push(msg);
  }

  queueValueChanged() {
    if (this.queueValue <= 0) return;

    // debugger
    // console.log("Unloading messages from queue.");
    this.unQueue();
  }

  unQueue() {
    if (this.websocket?.readyState != 1) return;

    // debugger
    // console.log(this.messageQueue);
    this.websocket.send(this.messageQueue.shift());
    this.queueValue -= 1;
  }

  disconnect() {
    this.clearWebsocket();
  }
}