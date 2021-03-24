/** Modules */
import Valine from 'valine';

window.addEventListener('DOMContentLoaded', () => {
  /* Valine */
  new Valine({
    el: '#vcomments',
    appId: 'PSy1tmiW2mx0DpKo7psk67EN-9Nh9j0Va',
    appKey: 'MskLH2QYVC2Kqj8aG3XJ7x7o',
    placeholder: 'Your comment here...',
    avatar: 'identicon',
    visitor: true,
    lang: 'en'
  });

  if (document.getElementById('vcomments')) {
    document.querySelector(".vicon.vemoji-btn").innerHTML = '';
    document.querySelector(".vicon.vpreview-btn").innerHTML = '';
    let markdownLink = document.querySelector(".vpanel .markdown").parentElement;
    markdownLink.ariaLabel = "Markdown Guidelines";
    markdownLink.rel = "nofollow noopener noreferrer";
    document.querySelector(".vpower.txt-right").remove();
  }
});