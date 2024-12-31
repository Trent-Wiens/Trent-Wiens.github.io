document.getElementById("button").addEventListener("click", function () {
    document.getElementById("demo").style.color = "blue";
    document.getElementById("demo").textContent = "You clicked the button!";
});

window.addEventListener("load", () => {
    window.scrollTo(0, 0); // Reset scroll position to the top
});

// Handle all "Show Album" buttons
document.querySelectorAll('.overlay-button').forEach(button => {
    button.addEventListener('click', () => {
        // Find the related album container
        const albumContainer = button.nextElementSibling;

        // Fade out the button
        button.classList.add('hidden');

        // Fade in the album container
        albumContainer.classList.add('visible');

        // Optionally, hide the button entirely after fading out
        setTimeout(() => {
            button.style.display = 'none';
        }, 500); // Match the CSS transition duration
    });
});

// Handle all "Show Album" buttons
document.querySelectorAll('.h-overlay-button').forEach(button => {
    button.addEventListener('click', () => {
        // Find the related album container
        const albumContainer = button.nextElementSibling;

        // Fade out the button
        button.classList.add('hidden');

        // Fade in the album container
        albumContainer.classList.add('visible');

        // Optionally, hide the button entirely after fading out
        setTimeout(() => {
            button.style.display = 'none';
        }, 500); // Match the CSS transition duration
    });
});

// Handle all "Show Tracklist" buttons
document.querySelectorAll('.tracklist-dropdown').forEach(button => {
    button.addEventListener('click', () => {
        // Find the related tracklist
        const tracklist = button.nextElementSibling;

        // Toggle visibility
        if (tracklist.classList.contains('hidden')) {
            tracklist.classList.remove('hidden');
            tracklist.classList.add('visible');
            button.textContent = 'Hide Tracklist';
        } else {
            tracklist.classList.add('hidden');
            tracklist.classList.remove('visible');
            button.textContent = 'Show Tracklist';
        }
    });
});


// const revealAllButton = document.getElementById('reveal-all-button');

// revealAllButton.addEventListener('click', () => {
//     const albums = document.querySelectorAll('.album');
//     const honorableMentions = document.querySelector('.hms');
//     const allButtons = document.querySelectorAll('.overlay-button, .h-overlay-button');

//     if (revealAllButton.textContent === 'Reveal All') {
//         // Reveal all albums
//         albums.forEach(album => album.classList.add('visible'));
//         // Reveal honorable mentions
//         if (honorableMentions) honorableMentions.classList.add('visible');
//         // Hide all individual buttons
//         allButtons.forEach(button => {
//             button.classList.add('hidden');
//             button.style.display = 'none';
//         });
//         // Change button text to "Hide All"
//         revealAllButton.textContent = 'Hide All';
//     } else {
//         // Hide all albums
//         albums.forEach(album => album.classList.remove('visible'));
//         // Hide honorable mentions
//         if (honorableMentions) honorableMentions.classList.remove('visible');
//         // Show all individual buttons
//         allButtons.forEach(button => {
//             button.classList.remove('hidden');
//             button.style.display = 'block';
//         });
//         // Change button text back to "Reveal All"
//         revealAllButton.textContent = 'Reveal All';
//     }
// });

// Select the reveal and hide buttons
const revealAllButton = document.getElementById('reveal-all-button');
const hideAllButton = document.getElementById('hide-all-button');

// Reveal All functionality
revealAllButton.addEventListener('click', () => {
    const albums = document.querySelectorAll('.album');
    const honorableMentions = document.querySelector('.hms');
    const allButtons = document.querySelectorAll('.overlay-button, .h-overlay-button');

    // Reveal all albums
    albums.forEach(album => album.classList.add('visible'));
    // Reveal honorable mentions
    if (honorableMentions) honorableMentions.classList.add('visible');
    // Hide all individual buttons
    allButtons.forEach(button => {
        button.classList.add('hidden');
        button.style.display = 'none';
    });

    // Show the hide button and hide the reveal button
    // revealAllButton.style.display = 'none';
    hideAllButton.style.display = 'block';
});

// Hide All functionality
hideAllButton.addEventListener('click', () => {
    const albums = document.querySelectorAll('.album');
    const honorableMentions = document.querySelector('.hms');
    const allButtons = document.querySelectorAll('.overlay-button, .h-overlay-button');

    // Hide all albums
    albums.forEach(album => album.classList.remove('visible'));
    // Hide honorable mentions
    if (honorableMentions) honorableMentions.classList.remove('visible');
    // Show all individual buttons
    allButtons.forEach(button => {
        button.classList.remove('hidden');
        button.style.display = 'block';
    });

    // Show the reveal button and hide the hide button
    // hideAllButton.style.display = 'none';
    revealAllButton.style.display = 'block';
});