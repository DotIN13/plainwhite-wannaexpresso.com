import { Controller } from "stimulus";
import { saveAs } from "file-saver";
import QRCode from 'qrcode';
import * as Jdenticon from "jdenticon";

export default class extends Controller {

  static targets = [
    "message",
    "server",
    "room",
    "logArea",
    "connectedAction",
    "qrcode",
    "file",
    "filename"
  ]

  static values = {
    connected: Boolean,
    qr: Boolean
  }

  connect() {
    if (this.currentQuery) {
      this.websocket = this.currentQuery.server;
      this.websocket.addEventListener("open", () => this.websocket.send(`PUT ${this.currentQuery.room}`));
    } else {
      this.openConfig();
    }
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
    if (typeof(e.data) == "string") {
      if (e.data.startsWith("PUT")) {
        this.roomTarget.value = e.data.split(" ")[1];
        this.qrValue = true;
        this.buildQR();
      } else if (e.data.startsWith("CLIP")) {
        this.pendingClip = e.data.slice(5);
        this.applyClipboard();
      // } else if (e.data.startsWith("FILE")) {
      //   this.pendingFile = e.data.slice(5);
      }
      this.log_message(e.data, "incoming");
    } else {
      this.receiveFile(e.data);
    }
  }
  
  onopen() {
    this.connectedActionTargets.forEach(el => el.removeAttribute("disabled"));
    this.connectedValue = !!this.websocket;
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

  join() {
    this.websocket = this.serverTarget.value;
    // Debug
    // console.log(this.websocket);
    if (this.roomTarget.value) this.websocket.send(`PUT ${this.roomTarget.value}`);
  }

  send() {
    // console.log(this.messageTarget.value);
    if (this.messageTarget.value != "") {
      this.websocket.send(this.messageTarget.value);
      this.log_message(this.messageTarget.value, "outgoing");
      this.messageTarget.value = "";
    }
    if (this.fileTarget.files.length == 1) {
      this.log_message(this.sendFile(), "outgoing", "file");
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
    return file.name;
  }

  async receiveFile(data) {
    const nameLengthBuffer = await data.slice(0, 1).arrayBuffer();
    const fileNameLength = new Uint8Array(nameLengthBuffer)[0];
    // Debug
    // console.log("filename length: ", nameLengthBuffer);
    const nameBuffer = await data.slice(1, fileNameLength + 1).arrayBuffer();
    const fileName = new TextDecoder("utf-8").decode(new Uint8Array(nameBuffer));
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
    QRCode.toCanvas(this.qrcodeTarget, this.location.href, {
      width: 180,
      color: {
        light: "#ffffff00",
      },
    });
  }

  // Messaging methods
  log_message(data, dir, type = null) {
    const msg = `<div class="talk__log talk__log--${dir}">
      <div class="talk__log-avatar">
        <svg width="48" height="48" data-jdenticon-value="${dir}"></svg>
      </div>
      <div class="talk__log-text talk__log-text--${dir}">
        ${type == "file" ? "<span class='icon-attach-outline'></span>": ''}
        ${data}
      </div>
    </div>`;
    this.logAreaTarget.insertAdjacentHTML("afterbegin", msg);
    Jdenticon.update(this.logAreaTarget.firstElementChild.querySelector("svg"));
  }

  disconnect() {
    this.clearWebsocket();
  }
}