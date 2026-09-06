
// The page intentionally uses normal browser scrolling.
// On an iPhone, swiping up/down will scroll this page naturally just like the reference.
document.querySelectorAll('a[href="#"]').forEach((link) => {
  link.addEventListener('click', (event) => event.preventDefault());
});
