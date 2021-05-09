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

  connect() {
    if (this.query) {
      this.websocket = this.query.server;
      this.websocket.addEventListener("open", () => this.websocket.send(`PUT ${this.query.room}`));
    }
  }

  set websocket(val) {
    if (!val) {
      this.wss?.close();
      this.wss = undefined;
      return;
    }
    if (new URL(this.wss?.url || "ws://localhost").href != new URL(val).href) {
      this.wss?.close();
      this.wss = new WebSocket(val);
      this.wss.onmessage = e => this.onmessage(e);
      this.wss.onopen = () => this.onopen();
      this.wss.onclose = () => this.onclose();
    }
  }

  get websocket() {
    return this.wss || undefined;
  }

  establish(e) {
    e.preventDefault();
    this.websocket = this.serverTarget.value;
    // Debug
    // console.log(this.websocket);
  }

  onmessage(e) {
    // For debug purpose
    // console.log(e);
    if (e.data.startsWith("PUT")) {
      this.roomTarget.value = e.data.split(" ")[1];
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
  }

  onclose() {
    this.connectedActionTargets.forEach(el => el.disabled = true);
    this.websocket = null;
  }

  join(e) {
    e.preventDefault();
    this.websocket.send(`PUT ${this.roomTarget.value}`);
  }

  signal(e) {
    e.preventDefault();
    // console.log(this.messageTarget.value);
    this.websocket.send(this.messageTarget.value);
  }

  syncClipboard(e) {
    e.preventDefault();
    navigator.clipboard.readText()
      .then(clipText => this.websocket.send(`CLIP ${clipText}`));
  }

  applyClipboard() {
    if (!document.hasFocus() && this.pendingClip) navigator.clipboard.writeText(this.pendingClip);
  }

  get query() {
    const params = new URL(window.location).searchParams;
    const server = params.get("server");
    const room = params.get("room");
    if (server && room) return {
      server: params.get("server"),
      room: params.get("room")
    };
    
    return null;
  }

  buildQR() {
    const url = new URL(window.location);
    url.searchParams.set("server", this.wss.url);
    url.searchParams.set("room", this.roomTarget.value);
    QRCode.toCanvas(this.qrcodeTarget, url.href);
  }

  disconnect() {
    this.websocket = null;
  }
}