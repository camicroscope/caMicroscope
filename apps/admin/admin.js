function calculateMainHeight() {
    const height = $(window).height() - $('#nav-bar').height();
    $('#main').height(height);
}
calculateMainHeight();
$(window).resize(function () {
    calculateMainHeight();
});