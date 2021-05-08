import { Controller } from "stimulus";

export default class extends Controller {

  static targets = [
    "message",
    "server",
    "room",
    "messageArea",
    "connectedAction"
  ]

  set websocket(val) {
    const newurl = new URL(val);
    if (this.url?.origin != newurl.origin) {
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
    console.log(this.messageTarget.value);
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
}