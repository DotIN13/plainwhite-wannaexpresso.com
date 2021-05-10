import { Controller } from "stimulus";
import QRCode from 'qrcode';

export default class extends Controller {

  static targets = [
    "message",
    "server",
    "room",
    "messageArea",
    "connectedAction",
    "qrcode"
  ]

  static values = {
    connected: Boolean,
    qr: Boolean
  }

  connect() {
    if (this.currentQuery) {
      this.websocket = this.currentQuery.server;
      this.websocket.addEventListener("open", () => this.websocket.send(`PUT ${this.currentQuery.room}`));
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
    if (e.data.startsWith("PUT")) {
      this.roomTarget.value = e.data.split(" ")[1];
      this.qrValue = true;
      this.buildQR();
    } else if (e.data.startsWith("CLIP")) {
      this.pendingClip = e.data.slice(5);
      this.applyClipboard();
    }
    const msg = document.createElement('div');
    msg.innerHTML = e.data;
    this.messageAreaTarget.appendChild(msg);
  }
  
  onopen() {
    this.connectedActionTargets.forEach(el => el.disabled = false);
    this.connectedValue = !!this.websocket;
  }
  
  onclose() {
    this.connectedActionTargets.forEach(el => el.disabled = true);
    this.clearWebsocket();
    this.connectedValue = !!this.websocket;
  }  
  
  // Button functions
  establish() {
    this.websocket = this.serverTarget.value;
    // Debug
    // console.log(this.websocket);
  }

  join() {
    this.websocket.send(`PUT ${this.roomTarget.value}`);
  }

  signal() {
    // console.log(this.messageTarget.value);
    this.websocket.send(this.messageTarget.value);
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
    QRCode.toCanvas(this.qrcodeTarget, this.location.href, { width: 180 });
  }

  disconnect() {
    this.clearWebsocket();
  }
}