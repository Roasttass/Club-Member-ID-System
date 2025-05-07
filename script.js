cript>
(() => {
  // Sample initial data (would come from server in real app)
  const initialUsers = [
    {username: 'admin', password: 'adminpass', name: 'Administrator', role: 'admin', points: 0, ranking: 'N/A', profilePicture: 'default-profile.png', bio: ''},
    {username: 'john', password: 'john123', name: 'John Doe', role: 'member', points: 150, ranking: 'Silver', profilePicture: 'default-profile.png', bio: ''},
    {username: 'jane', password: 'jane321', name: 'Jane Smith', role: 'member', points: 230, ranking: 'Gold', profilePicture: 'default-profile.png', bio: ''},
    {username: 'alice', password: 'alicepw', name: 'Alice Johnson', role: 'member', points: 95, ranking: 'Bronze', profilePicture: 'default-profile.png', bio: ''},
  ];

  // Local storage keys
  const USERS_STORAGE_KEY = 'club_users';
  const SESSION_STORAGE_KEY = 'club_session';
  const CHAT_STORAGE_KEY = 'club_chat_messages';
  const QUESTION_STORAGE_KEY = 'current_question';
  const RESPONSES_STORAGE_KEY = 'question_responses';

  // DOM elements
  const loginFormEl = document.getElementById('login-form');
  const registerFormEl = document.getElementById('register-form');
  const dashboardEl = document.getElementById('dashboard');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const loginErrorEl = document.getElementById('login-error');
  const registerErrorEl = document.getElementById('register-error');
  const usernameInput = document.getElementById('username-input');
  const passwordInput = document.getElementById('password-input');
  const registerNameInput = document.getElementById('register-name-input');
  const registerUsernameInput = document.getElementById('register-username-input');
  const registerPasswordInput = document.getElementById('register-password-input');
  const membersTableBody = document.getElementById('members-table-body');
  const welcomeMsg = document.getElementById('welcome-msg');
  const showRegisterLink = document.getElementById('show-register-link');
  const showLoginLink = document.getElementById('show-login-link');

  // DOM elements for profile
  const profileSection = document.getElementById('profile-section');
  const profilePictureEl = document.getElementById('profile-picture');
  const profilePictureInput = document.getElementById('profile-picture-input');
  const bioInput = document.getElementById('bio-input');
  const saveProfileBtn = document.getElementById('save-profile-btn');

  // DOM elements for chat
  const chatSection = document.getElementById('chat-section');
  const chatMessagesEl = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendChatBtn = document.getElementById('send-chat-btn');

  // DOM elements for bio modal
  const bioModal = document.getElementById('bio-modal');
  const bioModalOverlay = document.getElementById('bio-modal-overlay');
  const bioModalName = document.getElementById('bio-modal-name');
  const bioModalBio = document.getElementById('bio-modal-bio');
  const closeBioModalBtn = document.getElementById('close-bio-modal');

  // DOM elements for admin question submission
  const adminQuestionSection = document.getElementById('admin-question-section');
  const adminQuestionInput = document.getElementById('admin-question-input');
  const submitQuestionBtn = document.getElementById('submit-question-btn');

  // DOM elements for admin results section
  const adminResultsSection = document.getElementById('admin-results-section');
  const resultsQuestionText = document.getElementById('results-question-text');
  const resultsYesCount = document.getElementById('results-yes-count');
  const resultsYesList = document.getElementById('results-yes-list');
  const resultsNoCount = document.getElementById('results-no-count');
  const resultsNoList = document.getElementById('results-no-list');

  // DOM elements for member question popup
  const memberQuestionPopup = document.getElementById('member-question-popup');
  const popupQuestionText = document.getElementById('popup-question-text');
  const answerYesBtn = document.getElementById('answer-yes-btn');
  const answerNoBtn = document.getElementById('answer-no-btn');

  // Utilities
  function saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }
  function getUsers() {
    let users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : null;
  }
  function saveSession(username) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, username);
  }
  function clearSession() {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
  function getSession() {
    return sessionStorage.getItem(SESSION_STORAGE_KEY);
  }

  // Load chat messages from localStorage
  function loadChatMessages() {
    const messages = localStorage.getItem(CHAT_STORAGE_KEY);
    return messages ? JSON.parse(messages) : [];
  }

  // Save chat messages to localStorage
  function saveChatMessages(messages) {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }

  // Find user by name
  function findUserByName(name) {
    const users = getUsers();
    return users ? users.find(u => u.name === name) : null;
  }

  // Render chat messages
  function renderChatMessages() {
    const messages = loadChatMessages();
    chatMessagesEl.innerHTML = messages
      .map(msg => {
        const user = findUserByName(msg.user); // Find the user by name
        const profilePicture = user?.profilePicture || 'default-profile.png';
        return `
          <div style="display: flex; align-items: center; margin-bottom: 1rem;">
            <img 
              src="${profilePicture}" 
              alt="${msg.user}'s Profile Picture" 
              style="width: 40px; height: 40px; border-radius: 50%; cursor: pointer; margin-right: 1rem;" 
              data-username="${user?.username}" 
            />
            <p style="margin: 0;"><strong>${msg.user}:</strong> ${msg.text}</p>
          </div>
        `;
      })
      .join('');

    // Add event listeners to profile pictures
    const profilePictures = chatMessagesEl.querySelectorAll('img[data-username]');
    profilePictures.forEach(img => {
      img.addEventListener('click', () => {
        const username = img.getAttribute('data-username');
        const user = findUser(username);
        if (user) {
          showBioModal(user);
        }
      });
    });

    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight; // Scroll to the bottom
  }

  // Send a chat message
  function sendChatMessage(user) {
    const text = chatInput.value.trim();
    if (!text) return;

    const messages = loadChatMessages();
    messages.push({ user: user.name, text }); // Include the user's name
    saveChatMessages(messages);

    chatInput.value = '';
    renderChatMessages();
  }

  // Event listener for sending chat messages
  sendChatBtn.addEventListener('click', () => {
    const currentUser = findUser(getSession());
    if (currentUser) {
      sendChatMessage(currentUser);
    }
  });

  // Allow pressing Enter to send chat messages
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentUser = findUser(getSession());
      if (currentUser) {
        sendChatMessage(currentUser);
      }
    }
  });

  // Initialize users if not exist
  function initializeUsers() {
    if (!getUsers()) {
      saveUsers(initialUsers);
    }
  }

  // Find user by username
  function findUser(username) {
    const users = getUsers();
    return users ? users.find(u => u.username === username) : null;
  }

  // Update user data (for points/ranking edits)
  function updateUser(updatedUser) {
    const users = getUsers();
    if (!users) return false;
    const index = users.findIndex(u => u.username === updatedUser.username);
    if (index !== -1) {
      users[index] = {...updatedUser};
      saveUsers(users);
      return true;
    }
    return false;
  }

  // Render members table
  function renderMembersTable(currentUser) {
    const users = getUsers() || [];
    membersTableBody.innerHTML = '';

    users.forEach(user => {
      // If the current user is a member, only show their own row
      if (currentUser.role === 'member' && user.username !== currentUser.username) {
        return;
      }

      const tr = document.createElement('tr');

      // Profile picture cell
      const profilePictureTd = document.createElement('td');
      const profilePictureImg = document.createElement('img');
      profilePictureImg.src = user.profilePicture || 'default-profile.png';
      profilePictureImg.alt = `${user.name}'s Profile Picture`;
      profilePictureImg.style.width = '50px';
      profilePictureImg.style.height = '50px';
      profilePictureImg.style.borderRadius = '50%';
      profilePictureImg.style.cursor = 'pointer';
      profilePictureImg.addEventListener('click', () => showBioModal(user));
      profilePictureTd.appendChild(profilePictureImg);
      tr.appendChild(profilePictureTd);

      // Member name cell
      const nameTd = document.createElement('td');
      nameTd.textContent = user.name;
      nameTd.setAttribute('data-label', 'Member Name');
      tr.appendChild(nameTd);

      // Username cell
      const usernameTd = document.createElement('td');
      usernameTd.textContent = user.username;
      usernameTd.setAttribute('data-label', 'Username');
      tr.appendChild(usernameTd);

      // Password cell (only visible to admin)
      const passwordTd = document.createElement('td');
      passwordTd.textContent = currentUser.role === 'admin' ? user.password : '******';
      passwordTd.setAttribute('data-label', 'Password');
      tr.appendChild(passwordTd);

      // Ranking cell (editable for admin)
      const rankingTd = document.createElement('td');
      rankingTd.textContent = user.ranking || '';
      rankingTd.setAttribute('data-label', 'Ranking');
      if (currentUser.role === 'admin' && user.username !== 'admin') {
        rankingTd.classList.add('editable');
        rankingTd.title = 'Click to edit Ranking';
        rankingTd.tabIndex = 0;
        rankingTd.addEventListener('click', () => makeEditable(rankingTd, user, 'ranking'));
        rankingTd.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            makeEditable(rankingTd, user, 'ranking');
          }
        });
      }
      tr.appendChild(rankingTd);

      // Points cell (editable for admin)
      const pointsTd = document.createElement('td');
      pointsTd.textContent = user.points != null ? user.points : '';
      pointsTd.setAttribute('data-label', 'Points');
      if (currentUser.role === 'admin' && user.username !== 'admin') {
        pointsTd.classList.add('editable');
        pointsTd.title = 'Click to edit Points';
        pointsTd.tabIndex = 0;
        pointsTd.addEventListener('click', () => makeEditable(pointsTd, user, 'points'));
        pointsTd.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            makeEditable(pointsTd, user, 'points');
          }
        });
      }
      tr.appendChild(pointsTd);

      // Actions cell (only for admin)
      const actionsTd = document.createElement('td');
      if (currentUser.role === 'admin' && user.username !== 'admin') {
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', () => deleteMember(user.username));
        actionsTd.appendChild(deleteBtn);
      }
      tr.appendChild(actionsTd);

      membersTableBody.appendChild(tr);
    });
  }

  // Make a cell editable for admin
  function makeEditable(td, user, field) {
    if (td.querySelector('input')) return; // already editing

    const oldValue = td.textContent;
    td.textContent = '';

    const input = document.createElement('input');
    input.type = (field === 'points') ? 'number' : 'text';
    input.value = oldValue;
    input.className = 'edit-input';
    input.setAttribute('aria-label', `Edit ${field} for ${user.name}`);

    td.appendChild(input);
    input.focus();

    function saveChange() {
      const newValue = input.value.trim();
      if (field === 'points') {
        // Validate points: must be a non-negative integer
        if (!/^\d+$/.test(newValue)) {
          alert('Points must be a non-negative whole number');
          input.focus();
          return;
        }
        user.points = parseInt(newValue, 10);
      } else {
        // For ranking just set as string, max length 20 chars
        if (newValue.length > 20) {
          alert('Ranking must be 20 characters or less');
          input.focus();
          return;
        }
        user.ranking = newValue;
      }
      updateUser(user);
      td.textContent = (field === 'points') ? user.points : user.ranking;
      input.removeEventListener('blur', onBlur);
      input.removeEventListener('keydown', onKeyDown);
    }
    function cancelChange() {
      td.textContent = oldValue;
      input.removeEventListener('blur', onBlur);
      input.removeEventListener('keydown', onKeyDown);
    }
    function onBlur() {
      saveChange();
    }
    function onKeyDown(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveChange();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelChange();
      }
    }
    input.addEventListener('blur', onBlur);
    input.addEventListener('keydown', onKeyDown);
  }

  // Delete member (admin only)
  function deleteMember(username) {
    if (!confirm(`Are you sure you want to delete the account for ${username}?`)) {
      return;
    }

    const users = getUsers();
    const updatedUsers = users.filter(user => user.username !== username);
    saveUsers(updatedUsers);

    alert(`Member ${username} has been deleted.`);
    const currentUser = findUser(getSession());
    renderMembersTable(currentUser);
  }

  // Get top 10 members by points
  function getTop10Members() {
    const users = getUsers() || [];
    return users
      .filter(user => user.role === 'member') // Only include members
      .sort((a, b) => b.points - a.points) // Sort by points in descending order
      .slice(0, 10); // Get the top 10
  }

  // Render top 10 members table
  function renderTop10Members() {
    const topMembers = getTop10Members();
    const topMembersTableBody = document.getElementById('top-members-table-body');
    topMembersTableBody.innerHTML = topMembers
      .map((member, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${member.name}</td>
          <td>${member.points}</td>
          <td>${member.ranking}</td>
        </tr>
      `)
      .join('');
  }

  // Show profile section
  function showProfile(user) {
    profileSection.style.display = 'block';
    profilePictureEl.src = user.profilePicture || 'default-profile.png';
    bioInput.value = user.bio || '';
  }

  // Save profile updates
  function saveProfile(user) {
    const file = profilePictureInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        user.profilePicture = e.target.result; // Save the image as a base64 string
        updateUser(user);
        profilePictureEl.src = user.profilePicture;
        alert('Profile picture updated successfully!');
      };
      reader.readAsDataURL(file);
    }

    user.bio = bioInput.value.trim();
    updateUser(user);
    alert('Bio updated successfully!');
  }

  // Event listener for saving profile
  saveProfileBtn.addEventListener('click', () => {
    const currentUser = findUser(getSession());
    if (currentUser) {
      saveProfile(currentUser);
    }
  });

  // Show bio modal
  function showBioModal(user) {
    if (!user) {
      alert('User not found.');
      return;
    }
    bioModalName.textContent = user.name;
    bioModalBio.textContent = user.bio || 'No bio available.';
    bioModal.style.display = 'block';
    bioModalOverlay.style.display = 'block';
  }

  // Hide the bio modal
  function hideBioModal() {
    bioModal.style.display = 'none';
    bioModalOverlay.style.display = 'none';
  }

  // Event listener for closing the bio modal
  closeBioModalBtn.addEventListener('click', hideBioModal);
  bioModalOverlay.addEventListener('click', hideBioModal);

  // Check for a new question and show the popup
  function checkForQuestion() {
    const question = localStorage.getItem(QUESTION_STORAGE_KEY);
    if (question) {
      popupQuestionText.textContent = question;
      memberQuestionPopup.style.display = 'block';
    }
  }

  // Handle member response
  function handleMemberResponse(response) {
    const currentUser = findUser(getSession());
    if (!currentUser) return;

    const responses = JSON.parse(localStorage.getItem(RESPONSES_STORAGE_KEY)) || { yes: [], no: [] };

    // Add the member's name to the appropriate response list
    if (response === 'Yes') {
      if (!responses.yes.includes(currentUser.name)) {
        responses.yes.push(currentUser.name);
      }
    } else if (response === 'No') {
      if (!responses.no.includes(currentUser.name)) {
        responses.no.push(currentUser.name);
      }
    }

    // Save updated responses to localStorage
    localStorage.setItem(RESPONSES_STORAGE_KEY, JSON.stringify(responses));

    alert(`You answered: ${response}`);
    memberQuestionPopup.style.display = 'none';

    // Clear the question from localStorage after the response
    localStorage.removeItem(QUESTION_STORAGE_KEY);
  }

  // Event listeners for Yes/No buttons
  answerYesBtn.addEventListener('click', () => handleMemberResponse('Yes'));
  answerNoBtn.addEventListener('click', () => handleMemberResponse('No'));

  // Update results for admin
  function updateAdminResults() {
    const question = localStorage.getItem(QUESTION_STORAGE_KEY);
    const responses = JSON.parse(localStorage.getItem(RESPONSES_STORAGE_KEY)) || { yes: [], no: [] };

    if (question) {
      resultsQuestionText.textContent = `Current Question: ${question}`;
      resultsYesCount.textContent = responses.yes.length;
      resultsNoCount.textContent = responses.no.length;

      // Update Yes list
      resultsYesList.innerHTML = responses.yes
        .map(name => `<li>${name}</li>`)
        .join('');

      // Update No list
      resultsNoList.innerHTML = responses.no
        .map(name => `<li>${name}</li>`)
        .join('');

      adminResultsSection.style.display = 'block';
    } else {
      resultsQuestionText.textContent = 'No question submitted yet.';
      resultsYesCount.textContent = '0';
      resultsNoCount.textContent = '0';
      resultsYesList.innerHTML = '';
      resultsNoList.innerHTML = '';
      adminResultsSection.style.display = 'none';
    }
  }

  // Show dashboard and hide login
  function showDashboard(user) {
    loginFormEl.style.display = 'none';
    registerFormEl.style.display = 'none';
    dashboardEl.style.display = 'block';
    welcomeMsg.textContent = `Welcome, ${user.name} (${user.role})`;

    if (user.role === 'admin') {
      // Admin view
      adminQuestionSection.style.display = 'block';
      adminResultsSection.style.display = 'block';
      document.querySelector('table[aria-describedby="members-desc"]').style.display = 'table';
      document.getElementById('top-members-section').style.display = 'none';
      profileSection.style.display = 'none';
      chatSection.style.display = 'block';
      renderMembersTable(user);
      updateAdminResults(); // Update results for admin
    } else {
      // Member view
      adminQuestionSection.style.display = 'none';
      adminResultsSection.style.display = 'none';
      document.querySelector('table[aria-describedby="members-desc"]').style.display = 'none';
      document.getElementById('top-members-section').style.display = 'block';
      profileSection.style.display = 'block';
      chatSection.style.display = 'block';
      showProfile(user);
      renderTop10Members();

      // Check for a question
      checkForQuestion();
    }

    renderChatMessages();
  }

  // Show login and hide dashboard
  function showLogin() {
    loginFormEl.style.display = 'block';
    registerFormEl.style.display = 'none';
    dashboardEl.style.display = 'none';
    loginErrorEl.textContent = '';
    usernameInput.value = '';
    passwordInput.value = '';
  }

  // Show registration form and hide login
  function showRegister() {
    loginFormEl.style.display = 'none';
    registerFormEl.style.display = 'block';
    registerErrorEl.textContent = '';
    registerNameInput.value = '';
    registerUsernameInput.value = '';
    registerPasswordInput.value = '';
  }

  // Login handler
  function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      loginErrorEl.textContent = 'Please enter username and password.';
      return;
    }
    const users = getUsers();
    if (!users) {
      loginErrorEl.textContent = 'No users found - please reset app.';
      return;
    }
    const user = users.find(u => u.username === username);
    if (!user || user.password !== password) {
      loginErrorEl.textContent = 'Invalid username or password.';
      return;
    }
    // Successful login
    saveSession(user.username);
    showDashboard(user);
  }

  // Registration handler
  function handleRegister() {
    const name = registerNameInput.value.trim();
    const username = registerUsernameInput.value.trim();
    const password = registerPasswordInput.value;

    if (!name || !username || !password) {
      registerErrorEl.textContent = 'All fields are required.';
      return;
    }

    const users = getUsers() || [];
    if (users.find((u) => u.username === username)) {
      registerErrorEl.textContent = 'Username already exists.';
      return;
    }

    const newUser = {
      username,
      password,
      name,
      role: 'member',
      points: 0,
      ranking: 'Bronze',
      profilePicture: 'default-profile.png', // Default profile picture
      bio: '', // Default bio
    };

    users.push(newUser);
    saveUsers(users);
    alert('Registration successful! You can now log in.');
    showLogin();
  }

  // Logout handler
  function handleLogout() {
    clearSession();
    showLogin();

    // Sembunyikan fitur-fitur setelah logout
    profileSection.style.display = 'none';
    chatSection.style.display = 'none';
    document.getElementById('top-members-section').style.display = 'none';
    document.getElementById('admin-question-section').style.display = 'none';
    adminResultsSection.style.display = 'none';
  }

  // Submit question
  submitQuestionBtn.addEventListener('click', () => {
    const question = adminQuestionInput.value.trim();
    if (!question) {
      alert('Please enter a question.');
      return;
    }

    // Save the question to localStorage
    localStorage.setItem(QUESTION_STORAGE_KEY, question);

    // Clear previous responses
    localStorage.setItem(RESPONSES_STORAGE_KEY, JSON.stringify({ yes: [], no: [] }));

    // Notify members
    alert('Question submitted successfully!');
    adminQuestionInput.value = '';

    // Update admin results section
    updateAdminResults();
  });

  // Init flow
  function init() {
    initializeUsers();
    const sessionUser = getSession();
    if (sessionUser) {
      const user = findUser(sessionUser);
      if (user) {
        showDashboard(user);
        return;
      } else {
        clearSession();
      }
    }
    showLogin(); // Jika tidak ada sesi, tampilkan form login
  }

  // Event listeners
  loginBtn.addEventListener('click', handleLogin);
  registerBtn.addEventListener('click', handleRegister);
  logoutBtn.addEventListener('click', handleLogout);
  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    showRegister();
  });
  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showLogin();
  });

  // Allow pressing Enter to submit login form
  [usernameInput, passwordInput].forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLogin();
      }
    });
  });

  // Allow pressing Enter to submit registration form
  [registerNameInput, registerUsernameInput, registerPasswordInput].forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleRegister();
      }
    });
  });

  // Initialize app
  init();

})();
</script>
</body>
</html>
