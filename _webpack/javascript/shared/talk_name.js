import { components } from './talk_name_components.js';

const randomItem = (arr) => arr[~~(Math.random() * arr.length)];

export default function generate(locale) {
  const first = components[locale].first;
  const last = components[locale].last;
  if (locale === 'cn') return `${randomItem(first)}${randomItem(last)}`;
  return "Saul Bellow";
}