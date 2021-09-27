import { Controller } from "@hotwired/stimulus";
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
    pong: Boolean,
    receiving: Boolean,
    messageSize: Number,
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
      "POUT",
      "PONG"
    ];
  } 

  connect() {
    this.nameValue = randomName(this.localeValue);
    if (this.currentQuery) {
      this.serverTarget.value = this.currentQuery.server;
      this.roomTarget.value = this.currentQuery.room;
      this.join();
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
      this.wss.onerror = e => this.clearWebsocket(e);
    }
  }

  get websocket() {
    return this.wss || undefined;
  }

  clearWebsocket(e = false) {
    if (e) console.log("WebSocket disconnected on error:", e);
    clearInterval(this.keepAlive);
    this.websocket?.close();
    this.roomValue = this.wss = undefined;
  }

  // Websocket callbacks
  onmessage(e) {
    // Debug
    // console.log(e);
    let templateValue = e.data, command = null, log = true;
    this.receivingValue = false;
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
        this.receivingValue = true;
        templateValue = e.data.slice(5);
      } else if (command === 'peer') {
        this.peerNameValue = templateValue = e.data.slice(5);
      } else if (command === 'pout') {
        this.peerNameValue = "";
        templateValue = e.data.slice(5);
      } else if (command === 'pong') {
        this.pongValue = true;
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
    // Always send NAME frame before other frames
    this.websocket.send(`NAME ${this.nameValue} ${await new Identity().get()}`);
    this.keepAlive = setInterval(() => this.queue("PING"), 13000);
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
    if (this.roomTarget.value != this.roomValue) this.queue(`ROOM ${this.roomTarget.value}`);
    this.websocket = this.serverTarget.value;
    // Debug
    // console.log(this.websocket);
  }

  send() {
    // console.log(this.messageTarget.value);
    if (this.messageTarget.value != "") {
      this.queue(this.messageTarget.value);
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
    this.queue(fileBlob);
    return file.name;
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
      .then(clipText => this.queue(`CLIP ${clipText}`));
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
    if (server && room) return { server, room };

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
    if (avatar) Jdenticon.update(avatar, avatar.closest('.talk__log').dataset.name);
  }

  commandHTML(data, type) {
    return `<div class="talk__log talk__log-command">
      <div class="talk__log-command-text">
        ${type ? this[`${type}TemplateValue`].replace('#{TEMPLATE}', data) : data}
      </div>
    </div>`;
  }

  messageHTML(data, dir) {
    return `<div class="talk__log talk__log--${dir}" data-name="${dir === "outgoing" ? this.nameValue : this.peerNameValue}">
      <div class="talk__log-avatar">
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
      this.element.style.setProperty("--progress", 0);
    }
  }

  nameValueChanged(val) {
    this.messageTarget.placeholder = `${val}说...`;
  }

  peerNameValueChanged(val) {
    this.peerTarget.innerHTML = val != '' ? val : this.peerTarget.dataset.connectedTemplate;
  }

  connectedValueChanged(val) {
    this.peerTarget.innerHTML = val ? this.peerTarget.dataset.connectedTemplate : this.peerTarget.dataset.disconnectedTemplate;
    this.peerTarget.classList.toggle("talk__log-peer--active", val);
  }

  // Queue Methods
  queue(msg) {
    this.queueValue ||= 0;
    this.messageQueue ||= [];
    this.queueValue += 1;
    this.messageQueue.push(msg);
  }

  queueValueChanged() {
    if (this.progressMonitor) return;
    if (this.websocket?.readyState != 1 || this.queueValue <= 0) return;

    // debugger
    // console.log("Unloading messages from queue.");
    this.unQueue();
  }

  unQueue() {
    // debugger
    // console.log(this.messageQueue);
    const msg = this.messageQueue.shift();
    // Handle pings
    if (msg === "PING") setTimeout(() => this.receivePong(), 5000);
    this.messageSizeValue = new Blob([msg]).size;
    this.websocket.send(msg);
    this.progressMonitor = setInterval(() => this.sendBuffer = this.websocket?.bufferedAmount, 200);
  }

  /**
   * @param {number} val
   */
  set sendBuffer(val) {
    this.progressValue = 1 - (val / this.messageSizeValue);
    if (val === 0) {
      clearInterval(this.progressMonitor);
      this.progressMonitor = null;
      this.queueValue -= 1;
    }
  }

  receivePong() {
    if (this.receivingValue === true) return;

    if (this.pongValue === true) {
      this.pongValue = false;
    } else {
      this.clearWebsocket("No pong received in 5 seconds.");
      this.join();
    }
  }

  disconnect() {
    this.clearWebsocket();
  }
}