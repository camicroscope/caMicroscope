// navbar.js
document.addEventListener('DOMContentLoaded', function() {
  const navbar = `
        <div class="navbar">
            <h1>My Website</h1>
            <nav>
                <ul>
                    <li><span class="material-icons" aria-label="home" role="img">home</span><a href="./Info.html">Home</a></li>
                </ul>
            </nav>
        </div>
    `;
  document.body.insertAdjacentHTML('afterbegin', navbar);
});
