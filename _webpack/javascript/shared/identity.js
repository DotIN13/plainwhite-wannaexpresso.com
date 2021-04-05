const asyncLocalStorage = {
  async setItem (key, value) {
    await null;
    return localStorage.setItem(key, value);
  },
  async getItem (key) {
    await null;
    return localStorage.getItem(key);
  }
};

export default class {

  async get() {
    let identity = await asyncLocalStorage.getItem("wanna_id");
    identity ||= this.generate();
    return identity;
  }

  generate() {
    const timeHash = ~~(Date.now() / 1000).toString();
    // https://stackoverflow.com/a/47496558
    const randomHash = [...Array(9)].map(() => Math.random().toString(36)[2]).join('');
    const identity = `WA1.${randomHash}.${timeHash}`;
    asyncLocalStorage.setItem("wanna_id", identity);
    return identity;
  }
}