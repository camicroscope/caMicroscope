const pipe = document.querySelector(".pipe");
const container = document.querySelector(".container-pipe");
const icon = document.querySelector(".container-pipe i");

pipe.addEventListener("click", function () {
	container.classList.toggle("move");

	icon.classList.toggle("fa-sun");
	icon.classList.toggle("fa-moon");

	document.body.classList.toggle("change-bg");
});
