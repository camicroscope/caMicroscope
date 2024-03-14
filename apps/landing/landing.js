document.addEventListener('DOMContentLoaded', function() {
  // Your toggleTheme function here

  function toggleTheme() {
    // Get the icon element
    const icon = document.querySelector('.toggle-icon');
    const contentsButton = document.querySelectorAll('.button');
    const paragraphs = document.querySelectorAll('p');
    const heading2 = document.querySelectorAll('h2');
    const heading3 = document.querySelectorAll('h3');

    // Toggle dark mode class on body
    document.body.classList.toggle('dark-mode');

    // Toggle custom color class on elements
    paragraphs.forEach((p) => p.classList.toggle('p-color'));
    heading2.forEach((h2) => h2.classList.toggle('h2-color'));
    heading3.forEach((h3) => h3.classList.toggle('h3-color'));
    contentsButton.forEach((button) =>
      button.classList.toggle('content-buttoncolor'),
    );

    // Toggle dark class on the icon
    if (icon.classList.contains('fa-moon')) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
  }
});


module.exports = {toggleTheme};
