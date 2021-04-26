import { Controller } from "stimulus";

export default class extends Controller {

  connect() {
    fetch("/api/love/get", {
      headers: new Headers({Accept: "text/vnd.turbo-stream.html, text/html, application/xhtml+xml"}),
    })
      .then(res => {
        if (!res.ok) throw Error("Fetch failed");
        return res.text();
      })
      .then(text => document.body.insertAdjacentHTML("beforeend", text))
      .catch(err => console.log(err));
  }
}