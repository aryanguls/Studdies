document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.name) {
        const firstName = user.name.split(' ')[0];
        document.getElementById('username').textContent = firstName;
    }

    if (user && user.classes) {
        const classes = user.classes;

        if (classes.length >= 4) {
            document.getElementById('nav-class1-text').textContent = classes[0];
            document.getElementById('nav-class2-text').textContent = classes[1];
            document.getElementById('nav-class3-text').textContent = classes[2];
            document.getElementById('nav-class4-text').textContent = classes[3];

            document.getElementById('class1-text').textContent = classes[0];
            document.getElementById('class2-text').textContent = classes[1];
            document.getElementById('class3-text').textContent = classes[2];
            document.getElementById('class4-text').textContent = classes[3];

            loadClassUsers(1, classes[0], user.id);
            loadClassUsers(2, classes[1], user.id);
            loadClassUsers(3, classes[2], user.id);
            loadClassUsers(4, classes[3], user.id);
        }
    }
});

function loadClassUsers(classNumber, className, userId) {
    fetch('/users')
        .then(response => response.json())
        .then(users => {
            const classUsers = users.filter(user => user.classes.includes(className) && user.id !== userId);
            const classContainer = document.getElementById(`class${classNumber}-people`);
            classContainer.innerHTML = '';

            if (classUsers.length > 0) {
                classUsers.forEach(user => {
                    const userButton = document.createElement('button');
                    userButton.className = 'modal-button';
                    userButton.innerHTML = `
                        <img src="static/images/no-profile.png" alt="Preview of the image">
                        <div class="connect-button">Email</div>
                        <span class="button-text">
                            <strong>${user.name}</strong><br>
                            ${user.year}<br>
                            <em>Academic Info:</em> ${user.academicInfo}<br>
                            <em>Personal Info:</em> ${user.personalInfo}
                        </span>
                        <div class="status-badge ${user.partnerStatus.includes('yes') ? 'taken' : 'free'}">
                            ${user.partnerStatus.includes('yes') ? 'Has Partner' : 'Need Partner'}
                        </div>
                    `;
                    classContainer.appendChild(userButton);

                    // Add event listener for opening modal (if you want to use modals)
                    userButton.addEventListener('click', (event) => {
                        openModal(userButton, event);
                    });
                });
            } else {
                document.getElementById(`no-results-class${classNumber}`).style.display = 'block';
            }
        });
}

function filterNames(className) {
    const searchInput = document.getElementById(`search-${className}`).value.toLowerCase();
    const filterValue = document.getElementById(`filter-${className}`).value.toLowerCase();
    
    const buttons = document.querySelectorAll(`#${className}-content .modal-button`);
    let hasResults = false;

    buttons.forEach(button => {
        const nameText = button.querySelector('.button-text strong').textContent.toLowerCase();
        const yearText = button.querySelector('.button-text').innerHTML.toLowerCase().includes('senior') ? 'senior' : 'junior';
        const statusText = button.querySelector('.status-badge').textContent.toLowerCase();

        let matchesSearch = !searchInput || nameText.includes(searchInput);
        let matchesFilter = !filterValue || 
            yearText.includes(filterValue) || 
            statusText.includes(filterValue);

        if (matchesSearch && matchesFilter) {
            button.style.display = 'block';
            hasResults = true;
        } else {
            button.style.display = 'none';
        }
    });

    const noResults = document.getElementById(`no-results-${className}`);
    if (hasResults) {
        noResults.style.display = 'none';
    } else {
        noResults.style.display = 'block';
    }
}

function showClass(selectedClass) {
    document.querySelector('.welcome').style.display = 'none';
    document.querySelector('.content-full-width').style.display = 'none';

    var expectationsBox = document.querySelector('.right-content');
    if (expectationsBox) {
        expectationsBox.style.display = 'none';
    }

    document.querySelector('.left-content').classList.add('full-width');

    var classSections = document.querySelectorAll('.class-section');
    classSections.forEach(function(section) {
        section.style.display = 'none';
    });

    var selectedContent = document.getElementById(selectedClass + "-content");
    selectedContent.style.display = "block";
    document.querySelector('.class-content').style.display = "block";

    var navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(function(button) {
        button.classList.remove('active');
    });
    
    var activeButton = document.querySelector(`.nav-btn[onclick="showClass('${selectedClass}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

function goHome() {
    window.location.href = "homepage.html";
}

function toggleLike(button) {
    if (button.classList.contains("connect-button")) {
        button.classList.remove("connect-button");
        button.classList.add("liked-button");
        button.textContent = "Liked";
    } else {
        button.classList.remove("liked-button");
        button.classList.add("connect-button");
        button.textContent = "Email";
    }
}

function openModal(modal, event) {
    if (event.target.classList.contains("connect-button")) {
        return;
    }
    modal.style.display = "block";
    overlay.style.display = "block";
}

function closeModal(modal) {
    modal.style.display = "none";
    overlay.style.display = "none";
}

function openMail(email) {
    window.location.href = `mailto:${email}`;
}

function openReportModal() {
    document.getElementById('reportModal').style.display = 'block';
}

function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
}

function confirmReport() {
    alert('The user has been reported for inappropriate conduct.');
    closeReportModal();
}

function addFriend() {
    var popup = document.getElementById('friendPopup');
    popup.style.display = 'block';
    setTimeout(function() {
        popup.style.display = 'none';
    }, 3000);
}

// Function to dynamically generate user buttons for a given class
function generateUserButtons(className, classIndex) {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user.id;

    fetch('/users')
        .then(response => response.json())
        .then(users => {
            const classPeopleContainer = document.getElementById(`${className}-people`);
            classPeopleContainer.innerHTML = ''; // Clear existing content

            let hasResults = false;

            users.forEach(otherUser => {
                if (otherUser.id !== userId && otherUser.classes.includes(user.classes[classIndex])) {
                    hasResults = true;

                    const partnerStatus = otherUser.partnerStatus[classIndex];
                    const statusBadgeClass = partnerStatus === 'yes' ? 'taken' : 'free';
                    const statusBadgeText = partnerStatus === 'yes' ? 'Has Partner' : 'Need Partner';

                    const button = document.createElement('button');
                    button.classList.add('modal-button');
                    button.innerHTML = `
                        <img src="static/images/no-profile.png" alt="Profile image of ${otherUser.firstName}">
                        <div class="connect-button" onclick="openGroupRequestModal('${user.email}')">Email</div>
                        <span class="button-text">
                            <strong>${otherUser.name}</strong><br>
                            ${otherUser.year}<br>
                            <em>Academic Info:</em> ${otherUser.academicInfo}<br>
                            <em>About Me:</em> ${otherUser.personalInfo}
                        </span>
                        <div class="status-badge ${statusBadgeClass}">${statusBadgeText}</div>
                        <button class="icon-button flag-icon" onclick="openReportModal(${otherUser.id})">
                            <img src="static/images/report (1).png" alt="Report Icon" class="icon">
                        </button>
                    `;

                    classPeopleContainer.appendChild(button);
                }
            });

            const noResults = document.getElementById(`no-results-${className}`);
            if (hasResults) {
                noResults.style.display = 'none';
            } else {
                noResults.style.display = 'block';
            }
        })
        .catch(error => console.error('Error fetching users:', error));
}

// Call this function for each class on page load
document.addEventListener('DOMContentLoaded', () => {
    generateUserButtons('class1', 0);
    generateUserButtons('class2', 1);
    generateUserButtons('class3', 2);
    generateUserButtons('class4', 3);

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.name) {
        const firstName = user.name.split(' ')[0];
        document.getElementById('username').textContent = firstName;
    }

    if (user && user.classes) {
        let classes = user.classes;
        if (typeof classes === 'string') {
            classes = classes.split(',').map(cls => cls.trim());
        }

        if (classes.length >= 4) {
            document.getElementById('nav-class1-text').textContent = classes[0];
            document.getElementById('nav-class2-text').textContent = classes[1];
            document.getElementById('nav-class3-text').textContent = classes[2];
            document.getElementById('nav-class4-text').textContent = classes[3];

            document.getElementById('class1-text').textContent = classes[0];
            document.getElementById('class2-text').textContent = classes[1];
            document.getElementById('class3-text').textContent = classes[2];
            document.getElementById('class4-text').textContent = classes[3];

            document.getElementById('search-class1').placeholder = `Search ${classes[0]}...`;
            document.getElementById('search-class2').placeholder = `Search ${classes[1]}...`;
            document.getElementById('search-class3').placeholder = `Search ${classes[2]}...`;
            document.getElementById('search-class4').placeholder = `Search ${classes[3]}...`;

            document.getElementById('class1-people-heading').textContent = `${classes[0]} People`;
            document.getElementById('class2-people-heading').textContent = `${classes[1]} People`;
            document.getElementById('class3-people-heading').textContent = `${classes[2]} People`;
            document.getElementById('class4-people-heading').textContent = `${classes[3]} People`;
        }
    }
});

function sendGroupRequest() {
    const message = document.getElementById('groupRequestMessage').value;
    const recipientEmail = document.getElementById('groupRequestModal').dataset.email;

    fetch('/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            recipientEmail: recipientEmail,
            message: message
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Email sent successfully!');
            closeGroupRequestModal();
        } else {
            alert('Failed to send email. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to send email. Please try again.');
    });
}

function openGroupRequestModal(email) {
    const modal = document.getElementById('groupRequestModal');
    modal.dataset.email = email;
    modal.style.display = 'block';
    overlay.style.display = 'block';
}

function closeGroupRequestModal() {
    document.getElementById('groupRequestModal').style.display = 'none';
    overlay.style.display = 'none';
}
