export const replaceStream = (msgs) => {
  return `<turbo-stream action="replace" target="love-incubator__messages">
    <template>
      <div id="love-incubator__messages">
        ${renderMsg(msgs)}
      </div>
    </template>
  </turbo-stream>`;
};

export const prependStream = (msgs) => {
  return `<turbo-stream action="prepend" target="love-incubator__messages">
    <template>
      ${renderMsg(msgs)}
    </template>
  </turbo-stream>`;
};

const renderMsg = (msgs) => {
  return msgs.map((msg, index) => `<div class="love-incubator__message" style="animation-delay: ${index * .1}s;">
    <blockquote class="g_bq">${msg.message}</blockquote>
    <em>Sent by ${msg.username}</em>
  </div>`).join('');
};