// Elevate AI - Complete Application with Friends & Leaderboard
const APP_VERSION = '2.1.0';
const today = new Date().toISOString().split('T')[0];

// Default user structure
let userData = {
  version: APP_VERSION,
  isSetupComplete: false,
  userCode: generateUserCode(),
  profile: {
    name: '',
    goals: [],
    calorieTarget: 2000,
    proteinTarget: 150,
    theme: 'dark',
    reminderTime: ''
  },
  level: 1,
  xp: 0,
  totalXP: 0,
  habits: [],
  meals: {},
  workouts: [],
  habitChecks: {},
  streak: 0,
  lastCheckDate: null,
  friends: [],
  joinDate: new Date().toISOString()
};

// XP Constants
const XP_PER_LEVEL = 100;
const XP_HABIT_COMPLETE = 10;
const XP_MEAL_LOG = 5;
const XP_WORKOUT_LOG = 15;

let selectedGoals = [];

// Generate unique user code
function generateUserCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

// Initialize app
async function initApp() {
  await loadUserData();
  
  if (!userData.isSetupComplete) {
    showOnboarding();
  } else {
    showMainApp();
  }
  
  setupEventListeners();
}

// Data persistence
async function loadUserData() {
  try {
    const stored = localStorage.getItem('elevate-ai-v2-data');
    if (stored) {
      const parsed = JSON.parse(stored);
      userData = { ...userData, ...parsed };
      
      if (!userData.userCode) {
        userData.userCode = generateUserCode();
      }
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

async function saveUserData() {
  try {
    userData.version = APP_VERSION;
    localStorage.setItem('elevate-ai-v2-data', JSON.stringify(userData));
    
    // Share data to simulated cloud (localStorage)
    shareToLeaderboard();
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Leaderboard sharing
function shareToLeaderboard() {
  try {
    const leaderboardData = JSON.parse(localStorage.getItem('elevate-ai-leaderboard') || '{}');
    leaderboardData[userData.userCode] = {
      name: userData.profile.name,
      level: userData.level,
      totalXP: userData.totalXP,
      streak: userData.streak,
      code: userData.userCode
    };
    localStorage.setItem('elevate-ai-leaderboard', JSON.stringify(leaderboardData));
  } catch (error) {
    console.error('Error sharing to leaderboard:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  const getStartedBtn = document.getElementById('get-started-btn');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', startSetup);
  }
  
  const step1Next = document.getElementById('step1-next');
  if (step1Next) {
    step1Next.addEventListener('click', () => nextStep(2));
  }
  
  const step2Next = document.getElementById('step2-next');
  if (step2Next) {
    step2Next.addEventListener('click', () => nextStep(3));
  }
  
  const step2Back = document.getElementById('step2-back');
  if (step2Back) {
    step2Back.addEventListener('click', () => previousStep(1));
  }
  
  const step3Next = document.getElementById('step3-next');
  if (step3Next) {
    step3Next.addEventListener('click', () => nextStep(4));
  }
  
  const step3Back = document.getElementById('step3-back');
  if (step3Back) {
    step3Back.addEventListener('click', () => previousStep(2));
  }
  
  const step4Back = document.getElementById('step4-back');
  if (step4Back) {
    step4Back.addEventListener('click', () => previousStep(3));
  }
  
  const completeSetupBtn = document.getElementById('complete-setup-btn');
  if (completeSetupBtn) {
    completeSetupBtn.addEventListener('click', completeSetup);
  }
}

// Onboarding Flow
function showOnboarding() {
  document.getElementById('onboarding-screen').style.display = 'flex';
  document.getElementById('setup-screen').style.display = 'none';
  document.getElementById('main-app').style.display = 'none';
}

function startSetup() {
  document.getElementById('onboarding-screen').style.display = 'none';
  document.getElementById('setup-screen').style.display = 'block';
  
  // Build goal cards
  const goalsGrid = document.getElementById('goals-grid');
  const goals = [
    { id: 'fitness', icon: '💪', title: 'Fitness & Health', desc: 'Get in shape and stay healthy' },
    { id: 'nutrition', icon: '🥗', title: 'Nutrition', desc: 'Track meals and hit targets' },
    { id: 'productivity', icon: '📚', title: 'Productivity', desc: 'Build better work habits' },
    { id: 'mindset', icon: '🧠', title: 'Mindset & Growth', desc: 'Improve confidence and mental health' },
    { id: 'social', icon: '👥', title: 'Social Skills', desc: 'Build better relationships' }
  ];
  
  goalsGrid.innerHTML = goals.map(goal => `
    <div class="goal-card" data-goal="${goal.id}">
      <div class="goal-icon">${goal.icon}</div>
      <div class="goal-content">
        <div class="goal-title">${goal.title}</div>
        <div class="goal-description">${goal.desc}</div>
      </div>
      <div class="goal-check"></div>
    </div>
  `).join('');
  
  // Add click handlers to goal cards
  document.querySelectorAll('.goal-card').forEach(card => {
    card.addEventListener('click', function() {
      toggleGoal(this);
    });
  });
}

function toggleGoal(element) {
  const goal = element.getAttribute('data-goal');
  
  if (selectedGoals.includes(goal)) {
    selectedGoals = selectedGoals.filter(g => g !== goal);
    element.classList.remove('selected');
  } else {
    selectedGoals.push(goal);
    element.classList.add('selected');
  }
}

function nextStep(step) {
  if (step === 2) {
    const name = document.getElementById('setup-name').value.trim();
    if (!name) {
      alert('Please enter your name');
      return;
    }
    userData.profile.name = name;
  }
  
  if (step === 3) {
    if (selectedGoals.length === 0) {
      alert('Please select at least one goal');
      return;
    }
    userData.profile.goals = selectedGoals;
  }
  
  if (step === 4) {
    const calories = parseInt(document.getElementById('setup-calories').value) || 2000;
    const protein = parseInt(document.getElementById('setup-protein').value) || 150;
    userData.profile.calorieTarget = calories;
    userData.profile.proteinTarget = protein;
  }
  
  document.querySelectorAll('.setup-step').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.progress-dot').forEach(d => d.classList.remove('active'));
  
  document.getElementById(`step-${step}`).classList.add('active');
  
  for (let i = 1; i <= step; i++) {
    document.getElementById(`progress-${i}`).classList.add('active');
  }
}

function previousStep(step) {
  nextStep(step);
}

async function completeSetup() {
  const theme = document.getElementById('setup-theme').value;
  const reminder = document.getElementById('setup-reminder').value;
  
  userData.profile.theme = theme;
  userData.profile.reminderTime = reminder;
  userData.isSetupComplete = true;
  
  addDefaultHabits();
  
  await saveUserData();
  showMainApp();
}

function addDefaultHabits() {
  const defaultHabits = {
    fitness: [
      { name: 'Morning workout', icon: '💪' },
      { name: 'Evening walk', icon: '🚶' }
    ],
    nutrition: [
      { name: 'Track all meals', icon: '🍽️' },
      { name: 'Drink 8 glasses of water', icon: '💧' }
    ],
    productivity: [
      { name: 'Review daily goals', icon: '📝' },
      { name: 'Deep work session', icon: '🎯' }
    ],
    mindset: [
      { name: 'Morning meditation', icon: '🧘' },
      { name: 'Gratitude journal', icon: '📔' }
    ],
    social: [
      { name: 'Connect with a friend', icon: '👋' },
      { name: 'Practice active listening', icon: '👂' }
    ]
  };
  
  userData.profile.goals.forEach(goal => {
    if (defaultHabits[goal]) {
      defaultHabits[goal].forEach(habit => {
        userData.habits.push({
          id: Date.now().toString() + Math.random(),
          name: habit.name,
          icon: habit.icon,
          category: goal,
          createdAt: new Date().toISOString(),
          streak: 0
        });
      });
    }
  });
}

// Main App
function showMainApp() {
  document.getElementById('onboarding-screen').style.display = 'none';
  document.getElementById('setup-screen').style.display = 'none';
  document.getElementById('main-app').style.display = 'block';
  
  buildMainApp();
  renderDashboard();
  renderHabits();
  renderMeals();
  renderWorkouts();
  renderLeaderboard();
  updateAllStats();
  checkStreak();
  
  setupMainAppListeners();
}

function buildMainApp() {
  const initials = userData.profile.name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  document.getElementById('main-app').innerHTML = `
    <div class="header">
      <div class="header-top">
        <div class="user-profile">
          <div class="user-avatar">${initials}</div>
          <div class="user-info">
            <h2>Hey, ${userData.profile.name}!</h2>
            <p>Level ${userData.level} • ${userData.totalXP} XP</p>
          </div>
        </div>
        <button class="settings-btn" onclick="showSettings()">⚙️</button>
      </div>
      <div class="xp-bar-container">
        <div class="xp-bar" id="xp-bar" style="width: 0%"></div>
      </div>
    </div>

    <div class="container">
      <div id="dashboard-section" class="section active">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value" id="streak-stat">0</div>
            <div class="stat-label">Day Streak</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="habits-stat">0/0</div>
            <div class="stat-label">Habits Today</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="calories-stat">0</div>
            <div class="stat-label">Calories</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="workouts-stat">0</div>
            <div class="stat-label">This Week</div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">🎯 Today's focus</div>
          <div id="daily-tasks-container"></div>
        </div>
      </div>

      <div id="habits-section" class="section">
        <div class="card">
          <div class="card-title">➕ Add new habit</div>
          <div class="input-group">
            <input type="text" id="new-habit-input" placeholder="e.g., Morning workout, Read 10 pages">
          </div>
          <div class="input-group">
            <label class="input-label">Category</label>
            <select id="new-habit-category">
              <option value="fitness">💪 Fitness</option>
              <option value="nutrition">🥗 Nutrition</option>
              <option value="productivity">📚 Productivity</option>
              <option value="mindset">🧠 Mindset</option>
              <option value="social">👥 Social</option>
              <option value="custom">✨ Custom</option>
            </select>
          </div>
          <button class="btn btn-primary" onclick="addHabit()">Add Habit</button>
        </div>

        <div class="card">
          <div class="card-title">✅ Your habits</div>
          <div id="habits-list"></div>
        </div>
      </div>

      <div id="nutrition-section" class="section">
        <div class="card">
          <div class="card-title">🍽️ Log meal</div>
          <div class="input-group">
            <input type="text" id="meal-name-input" placeholder="Meal name">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div class="input-group">
              <input type="number" id="meal-calories-input" placeholder="Calories" step="1">
            </div>
            <div class="input-group">
              <input type="number" id="meal-protein-input" placeholder="Protein (g)" step="1">
            </div>
          </div>
          <button class="btn btn-primary" onclick="addMeal()">Log Meal</button>
        </div>

        <div class="card">
          <div class="card-title">📊 Today's nutrition</div>
          <div class="stats-grid" style="margin-bottom: 1.5rem;">
            <div class="stat-card">
              <div class="stat-value" id="total-calories-display">0</div>
              <div class="stat-label">Calories</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" id="total-protein-display">0g</div>
              <div class="stat-label">Protein</div>
            </div>
          </div>
          <div id="nutrition-progress"></div>
          <div id="meals-list"></div>
        </div>
      </div>

      <div id="workouts-section" class="section">
        <div class="card">
          <div class="card-title">🏋️ Log workout</div>
          <div class="input-group">
            <input type="text" id="workout-name-input" placeholder="Workout name">
          </div>
          <div class="input-group">
            <textarea id="workout-notes-input" placeholder="Notes (exercises, sets, reps)"></textarea>
          </div>
          <button class="btn btn-primary" onclick="addWorkout()">Log Workout</button>
        </div>

        <div class="card">
          <div class="card-title">📝 Recent workouts</div>
          <div id="workouts-list"></div>
        </div>
      </div>

      <div id="coach-section" class="section">
        <div class="card">
          <div class="card-title">🤖 AI coach chat</div>
          <div class="chat-container" id="chat-container">
            <div class="chat-message assistant">
              <div class="chat-bubble">
                Hey ${userData.profile.name}! I'm your AI coach. What would you like to work on today?
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <input type="text" id="chat-input" placeholder="Ask for advice, motivation, or guidance..." style="flex: 1; margin-bottom: 0;">
            <button class="btn btn-primary" style="padding: 0.875rem; width: auto;" onclick="sendChatMessage()">➤</button>
          </div>
        </div>

        <div class="card">
          <div class="card-title">💡 Quick actions</div>
          <div style="display: grid; gap: 0.75rem;">
            <button class="btn" onclick="quickPrompt('Give me motivation for today')">Get daily motivation</button>
            <button class="btn" onclick="quickPrompt('Create a workout plan for me')">Create workout plan</button>
            <button class="btn" onclick="quickPrompt('Help me build better habits')">Build better habits</button>
          </div>
        </div>
      </div>

      <div id="leaderboard-section" class="section">
        <div class="card">
          <div class="card-title">🎮 Your Friend Code</div>
          <div class="friend-code-box">
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Share this code with friends:</p>
            <div class="friend-code">${userData.userCode}</div>
            <button class="btn" onclick="copyFriendCode()" style="margin-top: 0.75rem;">📋 Copy Code</button>
          </div>
        </div>

        <div class="card">
          <div class="card-title">➕ Add Friend</div>
          <div class="input-group">
            <input type="text" id="friend-code-input" placeholder="Enter friend's code" style="text-transform: uppercase;">
          </div>
          <button class="btn btn-primary" onclick="addFriend()">Add Friend</button>
        </div>

        <div class="card">
          <div class="card-title">🏆 Leaderboard</div>
          <div id="leaderboard-list"></div>
        </div>

        <div class="card" id="friends-list-card">
          <div class="card-title">👥 Your Friends</div>
          <div id="friends-list"></div>
        </div>
      </div>

      <div id="settings-section" class="section">
        <div class="card">
          <div class="card-title">👤 Profile</div>
          <div class="input-group">
            <label class="input-label">Name</label>
            <input type="text" id="settings-name" value="${userData.profile.name}">
          </div>
          <button class="btn btn-primary" onclick="updateProfile()">Save Profile</button>
        </div>

        <div class="card">
          <div class="card-title">🎯 Goals & Targets</div>
          <div class="input-group">
            <label class="input-label">Daily Calorie Target</label>
            <input type="number" id="settings-calories" value="${userData.profile.calorieTarget}" step="50">
          </div>
          <div class="input-group">
            <label class="input-label">Daily Protein Target (grams)</label>
            <input type="number" id="settings-protein" value="${userData.profile.proteinTarget}" step="5">
          </div>
          <button class="btn btn-primary" onclick="updateTargets()">Save Targets</button>
        </div>

        <div class="card">
          <div class="card-title">📊 Statistics</div>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Your Code</span>
              <span style="font-weight: 600; font-family: 'Space Mono', monospace;">${userData.userCode}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Member since</span>
              <span style="font-weight: 600;">${new Date(userData.joinDate).toLocaleDateString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Total XP earned</span>
              <span style="font-weight: 600;">${userData.totalXP}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Current level</span>
              <span style="font-weight: 600;">Level ${userData.level}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Friends added</span>
              <span style="font-weight: 600;">${userData.friends.length}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">⚠️ Data Management</div>
          <button class="btn" onclick="exportData()">📥 Export My Data</button>
          <button class="btn" onclick="importData()" style="margin-top: 0.75rem;">📤 Import Data</button>
          <button class="btn" onclick="resetApp()" style="margin-top: 0.75rem; color: var(--accent-danger); border-color: var(--accent-danger);">🗑️ Reset App</button>
          <input type="file" id="import-file" style="display: none;" accept=".json" onchange="handleImport(event)">
        </div>
      </div>
    </div>

    <div class="bottom-nav">
      <button class="bottom-nav-item active" onclick="switchSection('dashboard')">
        <div class="nav-icon">🏠</div>
        <div class="nav-label">Home</div>
      </button>
      <button class="bottom-nav-item" onclick="switchSection('habits')">
        <div class="nav-icon">✓</div>
        <div class="nav-label">Habits</div>
      </button>
      <button class="bottom-nav-item" onclick="switchSection('nutrition')">
        <div class="nav-icon">🍽️</div>
        <div class="nav-label">Nutrition</div>
      </button>
      <button class="bottom-nav-item" onclick="switchSection('workouts')">
        <div class="nav-icon">💪</div>
        <div class="nav-label">Workouts</div>
      </button>
      <button class="bottom-nav-item" onclick="switchSection('coach')">
        <div class="nav-icon">🤖</div>
        <div class="nav-label">Coach</div>
      </button>
      <button class="bottom-nav-item" onclick="switchSection('leaderboard')">
        <div class="nav-icon">🏆</div>
        <div class="nav-label">Leaderboard</div>
      </button>
    </div>
  `;
}

function setupMainAppListeners() {
  const habitInput = document.getElementById('new-habit-input');
  if (habitInput) {
    habitInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addHabit();
    });
  }
  
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendChatMessage();
    });
  }
}

// Navigation
function switchSection(section) {
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active');
  });
  
  event.currentTarget.classList.add('active');
  document.getElementById(`${section}-section`).classList.add('active');
  
  if (section === 'dashboard') renderDashboard();
  if (section === 'habits') renderHabits();
  if (section === 'nutrition') renderMeals();
  if (section === 'workouts') renderWorkouts();
  if (section === 'leaderboard') renderLeaderboard();
}

function showSettings() {
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active');
  });
  
  document.getElementById('settings-section').classList.add('active');
}

// XP and Level System
function addXP(amount) {
  userData.xp += amount;
  userData.totalXP += amount;
  
  while (userData.xp >= XP_PER_LEVEL) {
    userData.xp -= XP_PER_LEVEL;
    userData.level++;
    showLevelUpAnimation();
  }
  
  updateLevelDisplay();
  saveUserData();
}

function updateLevelDisplay() {
  const xpPercent = (userData.xp / XP_PER_LEVEL) * 100;
  const xpBar = document.getElementById('xp-bar');
  if (xpBar) {
    xpBar.style.width = `${xpPercent}%`;
  }
}

function showLevelUpAnimation() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #3B82F6, #8B5CF6);
    color: white;
    padding: 2rem 3rem;
    border-radius: 1rem;
    font-size: 1.5rem;
    font-weight: 700;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    z-index: 1000;
  `;
  notification.textContent = `🎉 Level ${userData.level}!`;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 2000);
}

// Streak System
function checkStreak() {
  const lastDate = userData.lastCheckDate;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (lastDate === today) {
    return;
  } else if (lastDate === yesterdayStr) {
    const todayHabits = userData.habits.length;
    const completedToday = Object.keys(userData.habitChecks[today] || {}).filter(
      id => userData.habitChecks[today][id]
    ).length;
    
    if (todayHabits > 0 && completedToday === todayHabits) {
      userData.streak++;
    } else {
      userData.streak = 0;
    }
  } else if (lastDate !== null) {
    userData.streak = 0;
  }
  
  userData.lastCheckDate = today;
  saveUserData();
}

function updateStreak() {
  const streakEl = document.getElementById('streak-stat');
  if (streakEl) {
    streakEl.textContent = userData.streak;
  }
}

// Habits
async function addHabit() {
  const input = document.getElementById('new-habit-input');
  const categorySelect = document.getElementById('new-habit-category');
  const name = input.value.trim();
  const category = categorySelect?.value || 'custom';
  
  if (!name) {
    alert('Please enter a habit name');
    return;
  }
  
  const habit = {
    id: Date.now().toString() + Math.random(),
    name: name,
    category: category,
    createdAt: new Date().toISOString(),
    streak: 0
  };
  
  userData.habits.push(habit);
  input.value = '';
  
  await saveUserData();
  renderHabits();
  updateAllStats();
  
  input.placeholder = '✓ Habit added!';
  setTimeout(() => {
    input.placeholder = 'e.g., Morning workout, Read 10 pages';
  }, 2000);
}

async function toggleHabit(habitId) {
  if (!userData.habitChecks[today]) {
    userData.habitChecks[today] = {};
  }
  
  const wasChecked = userData.habitChecks[today][habitId];
  userData.habitChecks[today][habitId] = !wasChecked;
  
  if (!wasChecked) {
    addXP(XP_HABIT_COMPLETE);
  }
  
  await saveUserData();
  renderHabits();
  updateAllStats();
  checkStreak();
}

async function deleteHabit(habitId) {
  if (!confirm('Are you sure you want to delete this habit?')) return;
  
  userData.habits = userData.habits.filter(h => h.id !== habitId);
  
  await saveUserData();
  renderHabits();
  updateAllStats();
}

function renderHabits() {
  const container = document.getElementById('habits-list');
  if (!container) return;
  
  if (userData.habits.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <div class="empty-text">No habits yet. Add one above to get started!</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = userData.habits.map(habit => {
    const isChecked = userData.habitChecks[today]?.[habit.id] || false;
    const streak = calculateHabitStreak(habit.id);
    
    return `
      <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.75rem; transition: all 0.3s ease; cursor: pointer; ${isChecked ? 'opacity: 0.7;' : ''}" onclick="toggleHabit('${habit.id}')">
        <div style="width: 24px; height: 24px; border: 2px solid ${isChecked ? 'var(--accent-success)' : 'var(--border-color)'}; border-radius: 50%; cursor: pointer; transition: all 0.3s ease; position: relative; flex-shrink: 0; background: ${isChecked ? 'linear-gradient(135deg, var(--accent-success), #059669)' : 'transparent'};">
          ${isChecked ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-weight: 700; font-size: 0.875rem;">✓</div>' : ''}
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 500;">${habit.name}</div>
          ${streak > 0 ? `<div style="font-size: 0.75rem; color: var(--text-secondary);">🔥 ${streak} day streak</div>` : ''}
        </div>
        ${streak > 0 ? `<span style="background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 0.25rem 0.625rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600;">🔥 ${streak}</span>` : ''}
        <button style="background: transparent; border: none; color: var(--accent-danger); cursor: pointer; font-size: 1.25rem; padding: 0.25rem; opacity: 0.6;" onclick="event.stopPropagation(); deleteHabit('${habit.id}')">×</button>
      </div>
    `;
  }).join('');
}

function calculateHabitStreak(habitId) {
  let streak = 0;
  let date = new Date();
  
  for (let i = 0; i < 365; i++) {
    const dateStr = date.toISOString().split('T')[0];
    if (userData.habitChecks[dateStr]?.[habitId]) {
      streak++;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

// Meals
async function addMeal() {
  const name = document.getElementById('meal-name-input').value.trim();
  const calories = parseInt(document.getElementById('meal-calories-input').value) || 0;
  const protein = parseInt(document.getElementById('meal-protein-input').value) || 0;
  
  if (!name) {
    alert('Please enter a meal name');
    return;
  }
  
  if (!userData.meals[today]) {
    userData.meals[today] = [];
  }
  
  const meal = {
    id: Date.now().toString() + Math.random(),
    name,
    calories,
    protein,
    time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  };
  
  userData.meals[today].push(meal);
  addXP(XP_MEAL_LOG);
  
  document.getElementById('meal-name-input').value = '';
  document.getElementById('meal-calories-input').value = '';
  document.getElementById('meal-protein-input').value = '';
  
  await saveUserData();
  renderMeals();
  updateAllStats();
}

async function deleteMeal(mealId) {
  if (!confirm('Delete this meal?')) return;
  
  userData.meals[today] = userData.meals[today].filter(m => m.id !== mealId);
  
  await saveUserData();
  renderMeals();
  updateAllStats();
}

function renderMeals() {
  const todayMeals = userData.meals[today] || [];
  const totalCals = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalProt = todayMeals.reduce((sum, m) => sum + m.protein, 0);
  
  const calDisplay = document.getElementById('total-calories-display');
  const protDisplay = document.getElementById('total-protein-display');
  
  if (calDisplay) calDisplay.textContent = Math.round(totalCals);
  if (protDisplay) protDisplay.textContent = Math.round(totalProt) + 'g';
  
  const progressContainer = document.getElementById('nutrition-progress');
  if (progressContainer) {
    const calPercent = Math.min((totalCals / userData.profile.calorieTarget) * 100, 100);
    const protPercent = Math.min((totalProt / userData.profile.proteinTarget) * 100, 100);
    
    progressContainer.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem;">
          <span>Calories</span>
          <span style="color: var(--text-secondary);">${Math.round(totalCals)}/${userData.profile.calorieTarget}</span>
        </div>
        <div style="background: rgba(148, 163, 184, 0.1); height: 8px; border-radius: 50px; overflow: hidden;">
          <div style="height: 100%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); border-radius: 50px; width: ${calPercent}%; transition: width 0.5s ease;"></div>
        </div>
      </div>
      <div style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem;">
          <span>Protein</span>
          <span style="color: var(--text-secondary);">${Math.round(totalProt)}g/${userData.profile.proteinTarget}g</span>
        </div>
        <div style="background: rgba(148, 163, 184, 0.1); height: 8px; border-radius: 50px; overflow: hidden;">
          <div style="height: 100%; background: linear-gradient(90deg, var(--accent-success), #059669); border-radius: 50px; width: ${protPercent}%; transition: width 0.5s ease;"></div>
        </div>
      </div>
    `;
  }
  
  const container = document.getElementById('meals-list');
  if (!container) return;
  
  if (todayMeals.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🍴</div>
        <div class="empty-text">No meals logged today</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = todayMeals.map(meal => `
    <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1rem; margin-bottom: 0.75rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 0.9375rem; margin-bottom: 0.25rem;">${meal.name}</div>
          <div style="font-size: 0.8125rem; color: var(--text-secondary);">${Math.round(meal.calories)} cal • ${Math.round(meal.protein)}g protein • ${meal.time}</div>
        </div>
        <button style="background: transparent; border: none; color: var(--accent-danger); cursor: pointer; font-size: 1.25rem; padding: 0.25rem; opacity: 0.6;" onclick="deleteMeal('${meal.id}')">×</button>
      </div>
    </div>
  `).join('');
}

// Workouts
async function addWorkout() {
  const name = document.getElementById('workout-name-input').value.trim();
  const notes = document.getElementById('workout-notes-input').value.trim();
  
  if (!name) {
    alert('Please enter a workout name');
    return;
  }
  
  const workout = {
    id: Date.now().toString() + Math.random(),
    name,
    notes,
    date: new Date().toLocaleDateString(),
    timestamp: Date.now()
  };
  
  userData.workouts.unshift(workout);
  
  if (userData.workouts.length > 50) {
    userData.workouts = userData.workouts.slice(0, 50);
  }
  
  addXP(XP_WORKOUT_LOG);
  
  document.getElementById('workout-name-input').value = '';
  document.getElementById('workout-notes-input').value = '';
  
  await saveUserData();
  renderWorkouts();
  updateAllStats();
}

async function deleteWorkout(workoutId) {
  if (!confirm('Delete this workout?')) return;
  
  userData.workouts = userData.workouts.filter(w => w.id !== workoutId);
  
  await saveUserData();
  renderWorkouts();
  updateAllStats();
}

function renderWorkouts() {
  const container = document.getElementById('workouts-list');
  if (!container) return;
  
  if (userData.workouts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💪</div>
        <div class="empty-text">No workouts logged yet</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = userData.workouts.map(workout => `
    <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1rem; margin-bottom: 0.75rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 0.9375rem; margin-bottom: 0.25rem;">${workout.name}</div>
          <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.25rem;">${workout.date}</div>
          ${workout.notes ? `<div style="font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.5rem;">${workout.notes}</div>` : ''}
        </div>
        <button style="background: transparent; border: none; color: var(--accent-danger); cursor: pointer; font-size: 1.25rem; padding: 0.25rem; opacity: 0.6;" onclick="deleteWorkout('${workout.id}')">×</button>
      </div>
    </div>
  `).join('');
}

// Dashboard
function renderDashboard() {
  updateAllStats();
  
  const tasksContainer = document.getElementById('daily-tasks-container');
  if (!tasksContainer) return;
  
  const completedHabits = Object.keys(userData.habitChecks[today] || {}).filter(
    id => userData.habitChecks[today][id]
  ).length;
  
  if (userData.habits.length === 0) {
    tasksContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-text">Create some habits first!</div>
      </div>
    `;
  } else {
    const tasks = [
      {
        time: 'Morning',
        title: 'Complete your habits',
        description: `${completedHabits}/${userData.habits.length} done today`,
        completed: completedHabits === userData.habits.length
      },
      {
        time: 'Afternoon',
        title: 'Log your nutrition',
        description: userData.meals[today]?.length ? `${userData.meals[today].length} meals logged` : 'Track what you eat',
        completed: (userData.meals[today]?.length || 0) > 0
      },
      {
        time: 'Evening',
        title: 'Review your progress',
        description: 'Reflect and plan tomorrow',
        completed: false
      }
    ];
    
    tasksContainer.innerHTML = tasks.map(task => `
      <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1rem; margin-bottom: 0.75rem; ${task.completed ? 'opacity: 0.6;' : ''}">
        <div style="font-size: 0.75rem; color: var(--accent-primary); font-weight: 600; margin-bottom: 0.5rem;">${task.time}</div>
        <div style="font-weight: 600; margin-bottom: 0.25rem;">${task.completed ? '✓ ' : ''}${task.title}</div>
        <div style="font-size: 0.875rem; color: var(--text-secondary);">${task.description}</div>
      </div>
    `).join('');
  }
}

function updateAllStats() {
  const todayChecks = userData.habitChecks[today] || {};
  const completedToday = Object.keys(todayChecks).filter(id => todayChecks[id]).length;
  
  const habitsEl = document.getElementById('habits-stat');
  if (habitsEl) habitsEl.textContent = `${completedToday}/${userData.habits.length}`;
  
  const todayMeals = userData.meals[today] || [];
  const totalCals = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  
  const calsEl = document.getElementById('calories-stat');
  if (calsEl) calsEl.textContent = Math.round(totalCals);
  
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const workoutsThisWeek = userData.workouts.filter(w => w.timestamp > weekAgo).length;
  
  const workoutsEl = document.getElementById('workouts-stat');
  if (workoutsEl) workoutsEl.textContent = workoutsThisWeek;
  
  updateStreak();
  updateLevelDisplay();
}

// Leaderboard & Friends
function copyFriendCode() {
  navigator.clipboard.writeText(userData.userCode).then(() => {
    alert('Friend code copied! Share it with your friends.');
  }).catch(() => {
    alert('Your friend code is: ' + userData.userCode);
  });
}

async function addFriend() {
  const input = document.getElementById('friend-code-input');
  const code = input.value.trim().toUpperCase();
  
  if (!code) {
    alert('Please enter a friend code');
    return;
  }
  
  if (code === userData.userCode) {
    alert('You cannot add yourself as a friend!');
    return;
  }
  
  if (userData.friends.includes(code)) {
    alert('You already added this friend!');
    return;
  }
  
  const leaderboardData = JSON.parse(localStorage.getItem('elevate-ai-leaderboard') || '{}');
  if (!leaderboardData[code]) {
    alert('Friend code not found. Make sure they have used the app at least once!');
    return;
  }
  
  userData.friends.push(code);
  input.value = '';
  
  await saveUserData();
  renderLeaderboard();
  
  alert(`Added ${leaderboardData[code].name} as a friend!`);
}

function renderLeaderboard() {
  const leaderboardData = JSON.parse(localStorage.getItem('elevate-ai-leaderboard') || '{}');
  
  // Get all users including yourself and friends
  const allUsers = Object.values(leaderboardData);
  
  // Sort by totalXP descending
  allUsers.sort((a, b) => b.totalXP - a.totalXP);
  
  const leaderboardList = document.getElementById('leaderboard-list');
  if (!leaderboardList) return;
  
  if (allUsers.length === 0) {
    leaderboardList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏆</div>
        <div class="empty-text">No users on the leaderboard yet</div>
      </div>
    `;
    return;
  }
  
  leaderboardList.innerHTML = allUsers.slice(0, 10).map((user, index) => {
    const rank = index + 1;
    const isYou = user.code === userData.userCode;
    const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
    
    return `
      <div class="leaderboard-item" style="${isYou ? 'border: 2px solid var(--accent-primary);' : ''}">
        <div class="leaderboard-rank ${rankClass}">
          ${rank <= 3 ? (rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉') : rank}
        </div>
        <div class="leaderboard-content">
          <div class="leaderboard-name">${user.name}${isYou ? ' (You)' : ''}</div>
          <div class="leaderboard-stats">Level ${user.level} • ${user.streak} day streak</div>
        </div>
        <div class="leaderboard-xp">${user.totalXP}</div>
      </div>
    `;
  }).join('');
  
  // Render friends list
  const friendsList = document.getElementById('friends-list');
  if (!friendsList) return;
  
  if (userData.friends.length === 0) {
    friendsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">👥</div>
        <div class="empty-text">No friends added yet. Add friends using their code!</div>
      </div>
    `;
    return;
  }
  
  friendsList.innerHTML = userData.friends.map(friendCode => {
    const friend = leaderboardData[friendCode];
    if (!friend) return '';
    
    const friendRank = allUsers.findIndex(u => u.code === friendCode) + 1;
    
    return `
      <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 1rem;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem;">
          #${friendRank}
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 0.25rem;">${friend.name}</div>
          <div style="font-size: 0.875rem; color: var(--text-secondary);">Level ${friend.level} • ${friend.totalXP} XP</div>
        </div>
        <button style="background: transparent; border: none; color: var(--accent-danger); cursor: pointer; font-size: 1.25rem; padding: 0.25rem; opacity: 0.6;" onclick="removeFriend('${friendCode}')">×</button>
      </div>
    `;
  }).join('');
}

async function removeFriend(friendCode) {
  if (!confirm('Remove this friend?')) return;
  
  userData.friends = userData.friends.filter(f => f !== friendCode);
  
  await saveUserData();
  renderLeaderboard();
}

// AI Chat
async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  
  if (!message) return;
  
  input.value = '';
  
  const container = document.getElementById('chat-container');
  if (!container) return;
  
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-message user';
  userMsg.innerHTML = `<div class="chat-bubble">${message}</div>`;
  container.appendChild(userMsg);
  container.scrollTop = container.scrollHeight;
  
  const loadingMsg = document.createElement('div');
  loadingMsg.className = 'chat-message assistant loading';
  loadingMsg.innerHTML = '<div class="chat-bubble">Thinking...</div>';
  container.appendChild(loadingMsg);
  container.scrollTop = container.scrollHeight;
  
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `You are a supportive, energetic personal coach helping ${userData.profile.name} with their goals: ${userData.profile.goals.join(', ')}. Keep responses encouraging, actionable, and concise (2-3 sentences). User said: "${message}"`
        }]
      })
    });
    
    const data = await response.json();
    const reply = data.content[0].text;
    
    loadingMsg.classList.remove('loading');
    loadingMsg.querySelector('.chat-bubble').textContent = reply;
    container.scrollTop = container.scrollHeight;
    
  } catch (error) {
    loadingMsg.classList.remove('loading');
    loadingMsg.querySelector('.chat-bubble').textContent = "Sorry, I couldn't connect. Please check your internet and try again.";
  }
}

function quickPrompt(prompt) {
  const input = document.getElementById('chat-input');
  if (input) {
    input.value = prompt;
    sendChatMessage();
  }
}

// Settings
function updateProfile() {
  const name = document.getElementById('settings-name').value.trim();
  if (!name) {
    alert('Please enter your name');
    return;
  }
  
  userData.profile.name = name;
  saveUserData();
  alert('Profile updated!');
  buildMainApp();
  renderDashboard();
}

function updateTargets() {
  const calories = parseInt(document.getElementById('settings-calories').value) || 2000;
  const protein = parseInt(document.getElementById('settings-protein').value) || 150;
  
  userData.profile.calorieTarget = calories;
  userData.profile.proteinTarget = protein;
  
  saveUserData();
  alert('Targets updated!');
  buildMainApp();
  renderMeals();
}

function exportData() {
  const dataStr = JSON.stringify(userData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `elevate-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importData() {
  document.getElementById('import-file').click();
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (confirm('This will replace all your current data. Are you sure?')) {
        userData = imported;
        saveUserData();
        location.reload();
      }
    } catch (error) {
      alert('Invalid backup file');
    }
  };
  reader.readAsText(file);
}

function resetApp() {
  if (!confirm('This will delete ALL your data and reset the app. Are you absolutely sure?')) return;
  if (!confirm('This cannot be undone. Continue?')) return;
  
  localStorage.removeItem('elevate-ai-v2-data');
  location.reload();
}
