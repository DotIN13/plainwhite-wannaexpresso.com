import { Controller } from "stimulus";

export default class extends Controller {

  static targets = [
    "message",
    "server",
    "room",
    "messageArea",
    "connectedAction"
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
    } else if (e.data.startsWith("CLIP")) {
      this.pendingClip = e.data.slice(5);
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
    if (this.pendingClip) navigator.clipboard.writeText(this.pendingClip);
    this.pendingClip = undefined;
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

  disconnect() {
    this.websocket = null;
  }
}