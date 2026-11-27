// The site remains fully readable and navigable without JavaScript.

// Email links. The address is not written in the HTML, so scrapers that read the
// source cannot harvest it: data-mail holds "domain|user", each part reversed.
// Without JavaScript these links stay plain text (or hidden, inside a [hidden] item).
for (const link of document.querySelectorAll('[data-mail]')) {
  const [domain, user] = link.dataset.mail.split('|').map(part => [...part].reverse().join(''));
  link.href = `mailto:${user}@${domain}`;
  link.closest('[hidden]')?.removeAttribute('hidden');
}

// Colour theme. Pages follow the system setting until the visitor presses the theme
// button. A choice that differs from the system is stored and applied before first
// paint by the inline script in each page's <head>; choosing the theme the system
// already uses clears the stored choice, so the page follows the system again.
(() => {
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return;
  const root = document.documentElement;
  const system = matchMedia('(prefers-color-scheme: dark)');
  const systemTheme = () => (system.matches ? 'dark' : 'light');
  const current = () => root.dataset.theme || systemTheme();
  const save = theme => {
    try { theme ? localStorage.setItem('theme', theme) : localStorage.removeItem('theme'); } catch {}
  };
  const render = () => {
    const theme = current();
    const next = theme === 'dark' ? 'light' : 'dark';
    button.dataset.current = theme;
    button.setAttribute('aria-label', `Switch to ${next} theme`);
    button.title = `Switch to ${next} theme`;
  };
  button.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    if (next === systemTheme()) {
      delete root.dataset.theme;
      save(null);
    } else {
      root.dataset.theme = next;
      save(next);
    }
    render();
  });
  system.addEventListener('change', render);
  render();
  button.hidden = false;
})();

// Essay section navigation. The bar is open by default so it works as plain links
// without JavaScript; on small screens it starts collapsed and closes after a jump.
// While reading, the link for the section on screen is marked as current.
(() => {
  const nav = document.querySelector('.toc');
  if (!nav) return;
  const details = nav.querySelector('details');
  const narrow = matchMedia('(max-width: 760px)');
  const fit = () => { details.open = !narrow.matches; };
  narrow.addEventListener('change', fit);
  fit();
  nav.addEventListener('click', event => {
    if (narrow.matches && event.target.closest('a')) details.open = false;
  });

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const headings = links.map(link => document.getElementById(decodeURIComponent(link.hash.slice(1))));
  let frame = 0;
  const update = () => {
    frame = 0;
    // The current section is the last heading that has scrolled into the top third of the window.
    let current = -1;
    headings.forEach((heading, i) => { if (heading && heading.getBoundingClientRect().top <= innerHeight / 3) current = i; });
    links.forEach((link, i) => (i === current ? link.setAttribute('aria-current', 'true') : link.removeAttribute('aria-current')));
  };
  addEventListener('scroll', () => { frame ||= requestAnimationFrame(update); }, { passive: true });
  addEventListener('resize', update);
  update();
})();
