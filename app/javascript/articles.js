---
layout: null
sitemap:
  exclude: 'yes'
---
export default
{
  {%- for doc in site.documents -%}
  "{{ doc.path }}":"{{ doc.id }}"{% unless forloop.last %},{% endunless %}
  {%- endfor -%}
};
