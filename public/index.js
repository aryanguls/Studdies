function toggleDropdown() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

window.addEventListener('resize', function() {
    if (window.innerWidth > 1000) {
        // If the width is greater than 1000 pixels, remove the .active class
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.remove('active');
    }
});

const loadFile = (event) => {
    const output = document.getElementById('profile-image');
    output.src = URL.createObjectURL(event.target.files[0]);
    output.onload = () => {
        URL.revokeObjectURL(output.src); // free memory
    };
    document.querySelector('.image-upload label').classList.add('image-uploaded');
};
