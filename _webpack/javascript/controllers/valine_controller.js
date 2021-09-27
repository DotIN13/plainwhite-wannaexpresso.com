import Valine from 'valine';
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {

  connect() {
    this.valine ||= new Valine();
  
    this.valine.init({
      el: this.element,
      appId: 'PSy1tmiW2mx0DpKo7psk67EN-9Nh9j0Va',
      appKey: 'MskLH2QYVC2Kqj8aG3XJ7x7o',
      placeholder: 'Your comment here...',
      avatar: 'identicon',
      visitor: true,
      lang: 'en',
      path: window.location.pathname
    });

    if (document.querySelector('.vicon')) {
      document.querySelector(".vicon.vemoji-btn").innerHTML = '';
      document.querySelector(".vicon.vpreview-btn").innerHTML = '';
      let markdownLink = document.querySelector(".vpanel .markdown").parentElement;
      markdownLink.ariaLabel = "Markdown Guidelines";
      markdownLink.rel = "nofollow noopener noreferrer";
      document.querySelector(".vpower.txt-right")?.remove();
    }
  }
}