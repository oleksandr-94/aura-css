// Aura docs — renders the shared sidebar, handles theme/skin switching
// (persisted across pages) and copy-to-clipboard.
(function () {
  // Single source of truth for the component nav, grouped by category.
  var NAV = [
    { title: 'Actions',      items: [
      { href: 'button.html',       label: 'Button' },
      { href: 'button-group.html', label: 'Group' },
    ] },
    { title: 'Data display', items: [
      { href: 'card.html',      label: 'Card' },
      { href: 'badge.html',     label: 'Badge' },
      { href: 'table.html',     label: 'Table' },
      { href: 'avatar.html',    label: 'Avatar' },
      { href: 'accordion.html', label: 'Accordion' },
    ] },
    { title: 'Data input',   items: [
      { href: 'input.html',    label: 'Input' },
      { href: 'select.html',   label: 'Select' },
      { href: 'switch.html',   label: 'Switch' },
      { href: 'checkbox.html', label: 'Checkbox' },
      { href: 'radio.html',    label: 'Radio' },
      { href: 'range.html',    label: 'Range' },
      { href: 'file.html',     label: 'File input' },
      { href: 'rating.html',   label: 'Rating' },
    ] },
    { title: 'Navigation',   items: [
      { href: 'tabs.html',       label: 'Tabs' },
      { href: 'pagination.html', label: 'Pagination' },
    ] },
    { title: 'Overlay',      items: [
      { href: 'modal.html',    label: 'Modal' },
      { href: 'dropdown.html', label: 'Dropdown' },
    ] },
    { title: 'Feedback',     items: [
      { href: 'alert.html',    label: 'Alert' },
      { href: 'progress.html', label: 'Progress' },
      { href: 'tooltip.html',  label: 'Tooltip' },
      { href: 'toast.html',    label: 'Toast' },
    ] },
  ];

  var page = location.pathname.split('/').pop() || 'index.html';

  // Persisted preferences (shared across all docs pages).
  var theme = localStorage.getItem('aura-doc-theme') || 'aura-dark';
  var skin  = localStorage.getItem('aura-doc-skin')  || '../dist/aura.css';
  document.documentElement.setAttribute('data-theme', theme);
  var cssLink = document.getElementById('aura-css');
  if (cssLink) cssLink.href = skin;

  function navLinks(items) {
    return items.map(function (it) {
      return '<a href="' + it.href + '"' + (it.href === page ? ' class="active"' : '') + '>' + it.label + '</a>';
    }).join('');
  }
  function seg(id, items, current) {
    return '<div class="doc-seg" id="' + id + '">' + items.map(function (it) {
      return '<button data-v="' + it.v + '"' + (it.v === current ? ' class="on"' : '') + '>' + it.label + '</button>';
    }).join('') + '</div>';
  }

  var getStarted = [
    { href: 'index.html',            label: 'Overview' },
    { href: 'install.html',          label: 'Install' },
    { href: 'frameworks.html',       label: 'React / Vue' },
    { href: 'theme-generator.html',  label: 'Theme generator' },
  ];

  var componentsNav = NAV.map(function (cat) {
    return '<div class="doc-navtitle">' + cat.title + '</div>'
         + '<nav class="doc-nav">' + navLinks(cat.items) + '</nav>';
  }).join('');

  var host = document.getElementById('doc-side');
  if (host) host.innerHTML =
    '<div class="doc-brand"><span class="m">A</span> Aura</div>'
    + '<div>'
    +   '<div class="doc-navtitle">Get started</div>'
    +   '<nav class="doc-nav">' + navLinks(getStarted) + '</nav>'
    +   componentsNav
    + '</div>'
    + '<div class="doc-controls">'
    +   '<span class="doc-seglabel">Theme</span>'
    +   seg('doc-theme', [{ v: 'aura-dark', label: 'Dark' }, { v: 'aura-light', label: 'Light' }], theme)
    +   '<span class="doc-seglabel">Skin</span>'
    +   seg('doc-skin', [
          { v: '../dist/aura.css',      label: 'Glass' },
          { v: '../dist/aura-flat.css', label: 'Flat' },
          { v: '../dist/aura-neu.css',  label: 'Neu' },
        ], skin)
    + '</div>';

  document.getElementById('doc-theme').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    document.documentElement.setAttribute('data-theme', b.dataset.v);
    localStorage.setItem('aura-doc-theme', b.dataset.v);
    [].forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
  });

  document.getElementById('doc-skin').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    document.getElementById('aura-css').href = b.dataset.v;
    localStorage.setItem('aura-doc-skin', b.dataset.v);
    [].forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
  });

  document.querySelectorAll('.doc-copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var code = btn.parentElement.querySelector('code');
      navigator.clipboard.writeText(code.textContent).then(function () {
        var t = btn.textContent; btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = t; }, 1200);
      });
    });
  });
})();
